(function () {
    'use strict';
    angular
        .module('invoice')
        .controller('InvoiceController', Controller);

    /* @ngInject */
    function Controller($window, $http, $sce, $cookies, $rootScope, $filter, $scope, $timeout, $q, $mdDialog, InvoiceModel, Clique, $mdSidenav, $log, $state, triBreadcrumbsService, $stateParams, BulkPrintInvoices, SettingModel, clipboard, CliqueConstant, dataService, PermissionStore) {

        var vm = this;
        vm.InvoiceData = [];
        $scope.showInvoiceToolBar = false;
        $scope.showInvoiceEmailToolBar = false;
        $scope.showInvoicePaymentButton = false;
        $scope.showInvoiceLink = false;
        $scope.showRecurringToolBar = false;
        $scope.showBatchInvoices = false;
        vm.isInvoiceLoaded = true;
        $scope.checkAll = {};
        $scope.hasInk;
        $scope.textToCopy = "";
        $rootScope.printProcess = false;
        $scope.sendProcess = false;

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
        console.log()
        if (!clipboard.supported) {
            console.log('Sorry, copy to clipboard is not supported');
        }

        /*Customer*/
        vm.customers = [];
        $scope.promise = InvoiceModel.GetCustomers();
        $scope.promise.then(function (response) {

            if (response.statuscode == 0 && response.data != undefined) {
                var total_count = response.data.total_count;
                var items = response.data.items;
                angular.forEach(items, function (value, key) {
                    var customer = {
                        value: value.Id,
                        display: (value.DisplayName).toLowerCase()
                    };
                    vm.customers.push(customer)
                });
                vm.querySearch = querySearch;
            }
        });

        function querySearch(query) {
            return query ? vm.customers.filter(createFilterFor(query)) : vm.customers;
        }

        function loadAll() {

        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(state) {
                return (state.display.indexOf(lowercaseQuery) === 0);
            };
        }



        //set Date/////
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth();

        var saveInvoiceSearch = sessionStorage.getItem("invoice_search");
        // var saveInvoiceSearch = $cookies.get('invoice_search');
        // console.log("saveInvoiceSearch", saveInvoiceSearch)
        if (saveInvoiceSearch != null) {

            saveInvoiceSearch = JSON.parse(saveInvoiceSearch);
            if (saveInvoiceSearch.customerSelectedItem != null) {
                if (Object.keys(saveInvoiceSearch.customerSelectedItem).length > 0) {
                    vm.selectedItem = saveInvoiceSearch.customerSelectedItem;
                }
            }
            vm.query = saveInvoiceSearch;
        }

        var sessionFromDate;
        var sessionToDate;
        var sessionInvoicePage = 1;
        var filterstatus = 'all'
        var filtersession = 'all'
        if (typeof (Storage) !== undefined) {
            sessionFromDate = sessionStorage.getItem('fromDate');
            sessionToDate = sessionStorage.getItem('toDate');
            sessionInvoicePage = sessionStorage.getItem('invoice_current_page');
            filterstatus = $cookies.get('invoice_search_status');
            filtersession = sessionStorage.getItem('invoice_search_status');
            //filterstatus = filterstatusq.status

            if (sessionInvoicePage == null) {
                sessionInvoicePage = 1
            }
            if (filtersession == null) {
                filtersession = 'all'
            }
        }

        // if (typeof(cookie)  !== undefined){
        //     filterstatus = $cookies.get('invoice_search_status');
        //    }
        // console.log("last status", filtersession)
        // var invoicedata = sessionStorage.getItem('invoice_search');
        /*eof datatable*/
        vm.query = {
            status: filtersession,
            limit: 100,
            order: '-TxnDate',
            page: sessionInvoicePage,
            limitSelect: true,

        };

        $scope.from = (sessionFromDate != undefined ? new Date(sessionFromDate) : new Date(y, m, 1));
        $scope.to = sessionToDate != undefined ? new Date(sessionToDate) : new Date(y, m + 1, 0);

        vm.selected = [];
        vm.columns = {
            invoiceNo: 'INVOICE #.',
            customerName: 'CUSTOMER',
            invoiceDate: 'INVOICE DATE',
            dueDate: 'DUE DATE',
            status: 'INVOICE STATUS',
            balance: 'BALANCE',
            total: 'TOTAL',
            action: 'ACTION'
        };
        vm.filter = {
            options: {
                debounce: 500
            }
        };
        // $scope.toggleLimitOptions = function () {
        //     $scope.limitOptions = $scope.limitOptions ? undefined : [10, 25, 50, 100];
        // };
        vm.getInvoices = getInvoices;
        vm.removeFilter = removeFilter;
        vm.printPDFInvoice = printPDFInvoice;
        vm.printBulkInvoice = printBulkInvoice;
        vm.sendBulkInvoice = sendBulkInvoice;
        vm.paymentInvoice = paymentInvoice;
        vm.copyCustomerPortalLink = copyCustomerPortalLink;
        vm.openSidebar = openSidebar;
        vm.openInvoiceDetail = openInvoiceDetail;
        vm.openRecuringDialog = openRecuringDialog;
        vm.createInvoice = createInvoice;
        vm.toolBarProcess = toolBarProcess;
        // vm.limitOptions = [10, 25, 50, 100];

        activate();
        $scope.invoiceSelection = [];
        $scope.displayInvoices = [];

        $scope.promise = SettingModel.GetPaymentInfo();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                if (response.data.total_count > 0) {
                    $scope.paymentInfo = response.data.items[0];
                    $rootScope.paymentInfo = $scope.paymentInfo;
                }
            }
        });


        function isQuickBookConnected() {
            vm.promise = InvoiceModel.GetQuickBooksConnectionStatus();
            vm.promise.then(function (response) {});
        }

        function openSidebar(navID) {

            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        }

        function createInvoice() {

            $state.go('triangular.invoice-create');
        }


        function activate() {
            var bookmark;
            $scope.$watch('vm.query.filter', function (newValue, oldValue) {
                if (!oldValue) {
                    bookmark = vm.query.page;
                }

                if (newValue !== oldValue) {
                    vm.query.page = 1;
                }

                if (!newValue) {
                    vm.query.page = bookmark;
                }

                vm.getInvoices();
            });
        }

        function normalizeInvoiceData() {
            angular.forEach(vm.invoices.items, function (value, key) {});
        }

        function getInvoices() {
            $scope.toggleAll();
            vm.query.from = $filter('date')($scope.from, "yyyy-MM-dd");
            vm.query.to = $filter('date')($scope.to, "yyyy-MM-dd");

            if (vm.selectedItem != null) {

                vm.query.customer = vm.selectedItem.value;
            } else {
                vm.query.customer = "";
            }

            var invoice_search_query = vm.query;
            // console.log(invoice_search_query, "invoice_search_query")
            if (vm.selectedItem != null) {
                invoice_search_query.customerSelectedItem = vm.selectedItem;
            }
            if (typeof (Storage) !== "undefined") {
                // console.log("This Is Working", invoice_search_query)
                //   $cookies.put("invoice_search_status", invoice_search_query.status)
                sessionStorage.setItem("invoice_search_status", invoice_search_query.status);
                sessionStorage.setItem("invoice_search", JSON.stringify(invoice_search_query));
                // $cookies.put("invoice_search", JSON.stringify(invoice_search_query))
                sessionStorage.setItem("fromDate", $scope.from);
                sessionStorage.setItem("toDate", $scope.to);
            }

            vm.promise = InvoiceModel.GetAllInvoice(vm.query);

            vm.promise.then(function (response) {
                if (response.statuscode == 0) {
                    vm.invoices = response.data;
                    vm.InvoiceData = vm.invoices.items;
                    $timeout(function () {
                        vm.isInvoiceLoaded = false;
                    }, 2000);

                }
            });
            $scope.IsDefaultTemplate = false
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
             //   debugger
                if (response.statuscode == 0) {
                    $scope.IsDefaultTemplate = response.data.IsDefaultTemplate;
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
                limit: 100,
                order: '-TxnDate',
                page: 1
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

        function openInvoiceDetail(invoice) {

            sessionStorage.setItem('customer_id',invoice.CustomerRef.value)

            // to remove print iframe
            var myEl = angular.element(document.getElementsByClassName('pdfIframe'));
            myEl.remove();


            var invoice_status = '';
            if (invoice.Balance == 0) {
                invoice_status = 'paid';
            } else {
                invoice_status = 'unpaid';
            }

            sessionStorage.setItem('invoice_status', invoice_status);
            // if (invoice.BillEmail != null) {
            //     sessionStorage.setItem('customer_email', invoice.BillEmail.Address);
            // } else {
            //     // sessionStorage.setItem('customer_email', '');
            // }
            sessionStorage.setItem('invoice_id', invoice.Id);
            sessionStorage.setItem('invoice_issuedate', invoice.TxnDate);
            sessionStorage.setItem('invoice_detail', JSON.stringify(invoice));
            // console.log("(invoice.DocNumber ",invoice.DocNumber,"123" )
            if (invoice.DocNumber == null || invoice.DocNumber === "") {
                invoice.DocNumber = invoice.Id
                //      console.log("this work")
            }
            $state.go('triangular.invoice-detail', {
                id: invoice.DocNumber
            });

        }

        function openRecuringDialog() {
            if ($scope.invoiceSelection.length > 0) {
                var filteredInvoice
                angular.forEach($scope.invoiceSelection, function (invoice_id, key) {
                    filteredInvoice = $filter('filter')(vm.InvoiceData, {
                        'Id': invoice_id
                    })[0];
                });
                sessionStorage.setItem('invoice_detail', JSON.stringify(filteredInvoice));
                $state.go('triangular.invoice-create', {
                    action: 'recurring'
                });
            }
        }

        function printPDFInvoice() {
            $rootScope.printProcess = true;

            var url = Clique.getServiceUrl()
            var invoice_id = $scope.invoiceSelection[0]
            $http.get(url + "/erp/quickbooks/invoice/preview/?invoice_id=" + invoice_id, {
                    responseType: 'arraybuffer'
                })
                .then(function (response) {

                    var pdfFile = new Blob([response.data], {
                        type: "application/pdf"
                    });
                    var pdfUrl = URL.createObjectURL(pdfFile);
                    //window.open(pdfUrl);
                    // printJS(pdfUrl);
                    // var printwWindow = $window.open(pdfUrl);
                    // printwWindow.print();
                    printPdf(pdfUrl)
                    $rootScope.printProcess = false;

                });

        }

        function printPdf(url) {
            var iframe = document.createElement('iframe');
            // iframe.id = 'pdfIframe'
            iframe.className = 'pdfIframe'
            document.body.appendChild(iframe);
            iframe.style.display = 'none';
            iframe.onload = function () {
                setTimeout(function () {
                    iframe.focus();
                    iframe.contentWindow.print();
                    URL.revokeObjectURL(url)
                    // document.body.removeChild(iframe)
                }, 1);
            };
            iframe.src = url;
            // URL.revokeObjectURL(url)
        }

        function printBulkInvoice() {
            //fa fa-refresh fa-spin fa-3x
            $rootScope.printProcess = true;
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.settings = response.data;
                    sessionStorage.setItem("invoice_template_id", $scope.settings.InvoiceTemplateId);
                    sessionStorage.setItem("template_color", $scope.settings.InvoiceTemplateColor);

                    BulkPrintInvoices.printInvoice($scope.invoiceSelection);
                }
            });

        }

        function sendBulkInvoice() {

            //fa fa-refresh fa-spin fa-3x
            $scope.sendProcess = true;
            $timeout(function () {
                $scope.sendProcess = false;
            }, 2000);

            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                controller: 'SendBulkInvoiceController',
                parent: angular.element(document.body),
                templateUrl: 'app/modules/invoice/sendbulk/send.bulk.invoice.html',
                clickOutsideToClose: true,
                fullscreen: true,
                
            });
        }

        function paymentInvoice() {
            var customer_id;
        //    debugger;
            $rootScope.dataObj = {};
            $rootScope.dataObj = $scope.selectedInvoiceData;
            $state.go("triangular.invoice-payment");
        }

        function copyCustomerPortalLink() {
            $mdDialog.show({
                locals: {
                    InvoiceData: vm.InvoiceData
                },
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                templateUrl: 'app/modules/invoice/linking/link.invoice.html',
                clickOutsideToClose: true,
                fullscreen: true,
                controller: 'LinkInvoiceController'
            });

        };

        function toolBarProcess() {
            //alert(1);
            $scope.selectedInvoiceData = [];
            $scope.selectedCustomer = [];

            if ($scope.invoiceSelection.length > 0) {
                ;
                angular.forEach($scope.invoiceSelection, function (invoice_id, key) {
                    var filteredInvoice = $filter('filter')(vm.InvoiceData, {
                        'Id': invoice_id
                    }, true)[0];
                    $scope.selectedInvoiceData.push(filteredInvoice);

                    var customer_id = filteredInvoice.CustomerRef.value;
                    if (customer_id != undefined) {
                        if ($scope.selectedCustomer.indexOf(customer_id) == -1) {
                            $scope.selectedCustomer.push(customer_id);
                        }
                    }

                });
                $scope.showInvoiceToolBar = true;

            } else {
                $scope.showInvoiceToolBar = false;
            }
            // to hide invoice link and collect payment            
            $scope.showInvoiceLink = false;
            $scope.showInvoicePaymentButton = false;
            if ($scope.selectedCustomer.length == 1 && $scope.selectedInvoiceData[0].IsPaid != 1) {
                $scope.showInvoiceLink = true;
                $scope.showInvoicePaymentButton = true;
            }
            if ($scope.invoiceSelection.length > 1) {
                $scope.showInvoiceLink = false;
            }
            $scope.showInvoiceEmailToolBar = false;
            if ($scope.selectedInvoiceData.length == 1) {
                $scope.showInvoiceEmailToolBar = true;
            }
            // console.log("length", $scope.selectedInvoiceData.length)
            $scope.showRecurringToolBar = false;
            if ($scope.invoiceSelection.length == 1) {
                $scope.showRecurringToolBar = true;
            }
            $scope.showBatchInvoices = false;
            if ($scope.invoiceSelection.length >= 1) {
                $scope.showBatchInvoices = true;
            }

        }

        $scope.toggleAll = function () {
            if ($scope.checkAll) {
                $scope.invoiceSelection = angular.copy($scope.displayInvoices);
            } else {
                $scope.invoiceSelection = [];
            }
            toolBarProcess();
        }
        $scope.clearInvoiceArray = function (index) {
            if (index == 0) {
                $scope.displayInvoices = [];
            }
        }
        $scope.toggleSelection = function toggleSelection(invoice_id) {
            var idx = $scope.invoiceSelection.indexOf(invoice_id);
            if (idx > -1) {
                $scope.invoiceSelection.splice(idx, 1);
            } else {
                $scope.invoiceSelection.push(invoice_id);
            }
            toolBarProcess();
        };

        // set Page number in cookies when page change
        $scope.logPagination = function (page, limit) {
            sessionStorage.setItem('invoice_current_page', page);
        }
    }
})();
