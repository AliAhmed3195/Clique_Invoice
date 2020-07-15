(function () {
    'use strict';
    angular
        .module('chartaccount')
        .controller('chartaccountController', Controller);

    /* @ngInject */
    function Controller($rootScope, $scope, $timeout, $mdDialog, chartaccountModel, Clique, $mdSidenav, $log, $state, clipboard, PermissionStore)
     {
        var vm = this;
        vm.createAccount = createAccount;
        vm.isInvoiceLoaded = true;
        vm.openSidebar = openSidebar;
        vm.query = {
           
            limit: 5,
            page: 1,
            order: 'Id' 
        }

debugger;
        function createAccount() {
            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                controller: 'TaxDialogController',
                templateUrl: 'app/modules/chartaccount/createnew/chartaccount.addnew.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: true,
                fullscreen: true,
                locals: {
                    data: ''
                }
            });
        }

        $scope.promise = chartaccountModel.GetAccount();

        setTimeout(function() {
           
        $scope.promise.then(function (response) {
debugger;
            if (response.statuscode == 0 && response.data != undefined) {
              vm.isInvoiceLoaded = false;

                var items = response.data.items;
                vm.ItemData = response.data.items;
             
                // angular.forEach(items, function (value, key) {
                //     var customer = {
                //         value: value.Id,
                //         display: (value.Name)
                //     };
                //     // vm.customers.push(customer)
                // });
                // vm.querySearch = querySearch;
            }
        }); }, 1500)

        function querySearch(query) {
            return query ? vm.customers.filter(createFilterFor(query)) : vm.customers;
        }

        function openSidebar(navID) {

            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        }




     }
})();
