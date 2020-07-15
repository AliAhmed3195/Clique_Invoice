(function () {
    'use strict';
    angular
        .module('taxrate')
        .controller('TaxController', Controller);

    /* @ngInject */
    function Controller($rootScope, $scope, $timeout, $mdDialog, TaxModel, Clique, $mdSidenav, $log, $state, clipboard, PermissionStore) {

        var vm = this;
        vm.ItemData = [];
 
        $scope.checkAll = {};
        $scope.selected = [];
        vm.selected = [];
        vm.columns = {
            ID: 'ID',
            Type: 'TaxType',
            CustomName: 'Name',
            Rate: 'Rate',
            Region: 'Region',
            Ratetype: 'Ratetype',
            Active: 'Active',
            Description: 'Description'
        };
        vm.isInvoiceLoaded = true;
        vm.filter = {
            options: {
                debounce: 500
            }
        };
        // vm.editItem = editItem;
        vm.searchCustomer = searchCustomer;
        vm.removeFilter = removeFilter;
        vm.openSidebar = openSidebar;
        vm.openCustomerDetail = openCustomerDetail;
        vm.createItem = createItem;
        vm.editTax = editTax;
        vm.query = {
           
            limit: 10,
            page: 1,
            order: 'CustomName' 
        }
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
        $scope.promise = TaxModel.GetTax();

        setTimeout(function() {
           
        $scope.promise.then(function (response) {

            if (response.statuscode == 0 && response.data != undefined) {
              vm.isInvoiceLoaded = false;

                var items = response.data.items;
                vm.ItemData = response.data.items;
             
                angular.forEach(items, function (value, key) {
                    var customer = {
                        value: value.Id,
                        display: (value.Name)
                    };
                    vm.customers.push(customer)
                });
                vm.querySearch = querySearch;
            }
        }); }, 1500)

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

        function createItem() {
            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                controller: 'TaxDialogController',
                templateUrl: 'app/modules/tax/createnew/tax.addnew.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: true,
                fullscreen: true,
                locals: {
                    data: ''
                }
            });
        }


        function openCustomerDetail(invoice) {
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


        function editTax(item)
  
        {
            console.log("the tax is", item);
         //    debugger;
              $mdDialog.show({
                  scope: $scope,
                  preserveScope: true,
                  parent: angular.element(document.body),
                  templateUrl: 'app/modules/tax/createnew/tax.updatenew.html',
                  clickOutsideToClose: true,
                  fullscreen: true,
                  controller: 'TaxDialogController',
                  locals: {
                      data: item
                    //   index: data
                  }
              });
          }


        // function editItem(id) {
        //  //   debugger;
        //     console.log('id ' , id);
        //     vm.isEditData= true;
        //     document.getElementById("itemData").style.opacity = "0.3";
        //     $scope.promise = TaxModel.GetSingleItem(id)
        //       $scope.promise.then(function (response) {

        //         if (response.statuscode == 0 ) {
        //           //  debugger;
        //             vm.isEditData= false;
        //             document.getElementById("itemData").style.opacity = "1";
        //             // var items = response.data.items;
        //             vm.SingleItemData = response.data.items;
        //             console.log("singleItem ", vm.SingleItemData);
        //             $mdDialog.show({
        //                 scope: $scope,
        //                 preserveScope: true,
        //                 parent: angular.element(document.body),
        //                 templateUrl: 'app/modules/tax/createnew/tax.addnew.html',
        //                 clickOutsideToClose: true,
        //                 fullscreen: true,
        //                controller: 'TaxDialogController',
        //                 locals: {
        //                     data:  vm.SingleItemData
        //                 }
        //             });
        //         } else  {
        //             vm.isEditData= false;
        //             document.getElementById("itemData").style.opacity = "1";
        //         }
        //     });
          

        // }
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
            vm.promise = TaxModel.SearchCustomers(invoice_search_query);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {
                    vm.ItemData = response.data.items;
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
                limit: 10,
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

 $scope.UpdateActive = function (value, isActive) {
    
//     console.log('Id : ' , value);
//     console.log('IsActiveornot : ' , isActive);
//     vm.isActive= !isActive;  

//     vm.test = {};




//      vm.data = 
//         {
//         Id: value.Id,
//         Active: vm.isActive,
//         Type: value.Type,
//         CustomName: value.CustomName,
//         Region: value.CustomName,
//         Rate: value.Rate,
//         RateType: value.RateType,
//         Description: value.Description
//     };
    

//           //addtax post data
//              vm.promise = TaxModel.AddTax(vm.data);
//              vm.promise.then(function (response) {

//              if(response.statuscode == 0 ) {
          

//                 vm.SingleItemData = response.data.items;
                  
//                     }
//                    }); 
// //  }
                   
//   }
// {
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
