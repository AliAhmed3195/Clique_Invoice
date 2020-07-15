(function () {
    'use strict';
    angular
        .module('customer')
        .controller('CustomerController', Controller);

    /* @ngInject */
    function Controller($rootScope, Countries, $scope, $timeout, $mdDialog, CustomerModel, Clique, $mdSidenav, $log, $state, clipboard, PermissionStore) {
// debugger;
        var vm = this;
        vm.CustomerData = [];
        $scope.showInvoiceToolBar = false;
        $scope.showInvoiceEmailToolBar = false;
        $scope.showInvoicePaymentButton = false;
        $scope.showInvoiceLink = false;
        $scope.showRecurringToolBar = false;
        $scope.showBatchInvoices = false;
        vm.isInvoiceLoaded = true;
        $scope.checkAll = {};
        $scope.selected = [];
        vm.selected = [];
        vm.columns = {
            DisplayName: 'Name',
            PrimaryEmailAddr: 'Email',
            CompanyName: 'Company Name',
            Balance: 'Balance',
            CardProfile: 'Action'
        };
        vm.filter = {
            options: {
                debounce: 500
            }
        };
        vm.searchCustomer = searchCustomer;
        vm.removeFilter = removeFilter;
        vm.openSidebar = openSidebar;
        vm.openCustomerDetail = openCustomerDetail;
        vm.createCustomer = createCustomer;
        vm.query = {
            
            limit: 10,
            page: 1,
            order: 'DisplayName'
        };
        vm.pageQuery = {
            limit: 10,
            page: 1
        }

        $scope.buttonPermissions = {
            invoice_addnew: false,
            invoice_search: false,
            invoice_print: false,
            invoice_send: false,
            invoice_payment: false,
            invoice_link: false,
            invoice_recurring: false
        };
        vm.notifications = [{
                invoice_no: '10001',
                transaction_id: '0000112',
                amount: 12.00,
                status: 'approved',
                customer_name: 'John Smith',
                date: new Date('2017-11-29 11:50 AM')
            },
            {
                invoice_no: '10001',
                transaction_id: '0000112',
                amount: 12.00,
                status: 'declined',
                customer_name: 'John Smith',
                date: new Date('2017-11-22 11:25 AM')
            }, {
                invoice_no: '10001',
                transaction_id: '0000112',
                amount: 12.00,
                status: 'approved',
                customer_name: 'John Smith',
                date: new Date('2014-04-03')
            }, {
                invoice_no: '10001',
                transaction_id: '0000112',
                amount: 12.00,
                status: 'approved',
                customer_name: 'John Smith',
                date: new Date('2014-04-03')
            }, {
                invoice_no: '10001',
                transaction_id: '0000112',
                amount: 12.00,
                status: 'approved',
                customer_name: 'John Smith',
                date: new Date('2014-04-03')
            }, {
                invoice_no: '10001',
                transaction_id: '0000112',
                amount: 12.00,
                status: 'approved',
                customer_name: 'John Smith',
                date: new Date('2014-04-03')
            },

        ];
        var permission_arr = ['addnew', 'search', 'print', 'send', 'payment', 'link', 'recurring'];
        angular.forEach(permission_arr, function (permission_name, key) {
            if (PermissionStore.getPermissionDefinition('invoice-' + permission_name) != undefined) {
                $scope.buttonPermissions['invoice_' + permission_name] = true;
            } else {
                $scope.buttonPermissions['invoice_' + permission_name] = false;
            }

        });
        if (!clipboard.supported) {
            console.log('Sorry, copy to clipboard is not supported');
        }

        /*Customer*/
        vm.customers = [];
        $scope.promise = CustomerModel.GetCustomers();
        $scope.promise.then(function (response) {

            if (response.statuscode == 0 && response.data != undefined) {
                vm.isInvoiceLoaded = false;

                var total_count = response.data.total_count;
                var items = response.data.items;
                vm.CustomerData = response.data.items;
                angular.forEach(items, function (value, key) {
                    var customer = {
                        value: value.Id,
                        display: (value.DisplayName)
                    };
                    vm.customers.push(customer)
                });
                vm.querySearch = querySearch;
            }
        });

        function querySearch(query) {
            return query ? vm.customers.filter(createFilterFor(query)) : vm.customers;
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.display.indexOf(lowercaseQuery) === 0);
            };
        }


        function openSidebar(navID) {

            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        }

        function createCustomer() {
            $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,

                    locals: {
                        // customerData: "",
                        Countries: Countries
                    },
                    controller: 'CustomerDialogController',
                    templateUrl: 'app/modules/customer/createnew/customer.addnew.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: true,
                    fullscreen: true,
                    // openFrom:{'#left'}
                    openFrom: {
                        right: 0
                    },
                    // closeTo: {
                    //     right: 0
                    // },

                }
                // .openFrom('#left')
            )
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function openCustomerDetail(invoice) {
            console.log("the custoemr is", invoice );
          //  debugger;
            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                templateUrl: 'app/modules/customer/detail/card.profile.tmpl.html',
                clickOutsideToClose: true,
                fullscreen: true,
                controller: 'CardProfileController',
                locals: {
                    data: invoice
                }
            });
        }

        function searchCustomer() {
            $scope.toggleAll();

            if (vm.selectedItem != null) {
                vm.query.id = vm.selectedItem.value;
            } else {
                vm.query.name = "";
            }

            var invoice_search_query = vm.query;
            // if (vm.selectedItem != null) {
            //     invoice_search_query.customerSelectedItem = vm.selectedItem;
            // }
            vm.promise = CustomerModel.SearchCustomers(invoice_search_query);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {
                    vm.CustomerData = response.data.items;
                    $timeout(function () {
                        vm.isInvoiceLoaded = false;
                    }, 2000);

                }
            });

        }

        $scope.refreshInvoiceGrid = function () {
            $state.reload();
        }
        $scope.resetForm = function () {
            var date = new Date(),
                y = date.getFullYear(),
                m = date.getMonth();

            vm.query = {
                status: 'all',
                docnumber: '',
                customer: '',
                limit: 200,
                order: '-TxnDate',
                // page: 1
            }
            $scope.from = new Date(y, m, 1);
            $scope.to = new Date(y, m + 1, 0)
            vm.selectedItem = "";
            sessionStorage.setItem("invoice_search", "{}");
            //  $cookies.put('invoice_search','{}')
        }

        function removeFilter() {
            vm.filter.show = false;
            vm.query.filter = '';

            if (vm.filter.form.$dirty) {
                vm.filter.form.$setPristine();
            }
        }




        $scope.toggleAll = function () {
            if ($scope.checkAll) {
                $scope.invoiceSelection = angular.copy($scope.displayInvoices);
            } else {
                $scope.invoiceSelection = [];
            }
        }

        // set Page number in cookies when page change
        $scope.logPagination = function (page, limit) {
            sessionStorage.setItem('invoice_current_page', page);
        }
    }
})();
