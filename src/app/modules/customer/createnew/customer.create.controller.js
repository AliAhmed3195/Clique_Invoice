(function () {
    'use strict';
    angular
        .module('customer')
        .controller('CustomerDialogController', CustomerDialogController)

    function CustomerDialogController($scope, CustomerModel, $mdDialog, $http, Clique, $rootScope, $state) {
        var vm = this;

        $scope.hideDialogActions = false;
        $scope.customer = {};
        // $scope.customer.DisplayName = customerData;s
        $scope.loadCountries = function () {
            $http.get('app/modules/invoice/data/countries.json').then(function (response) {
                $scope.countries = response.data
            //    console.log("the country", $scope.countries);
            })
        };
        $scope.setCustomerShipping = function () {
            if ($scope.sameAsBilling == true) {
                $scope.customer.ShipAddr = $scope.customer.BillAddr;
            } else {
                $scope.customer.ShipAddr = {
                    Line1: "",
                    City: "",
                    Country: "",
                    CountrySubDivisionCode: "",
                    PostalCode: ""
                }
            }
        }
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.addNewCustomer = function (task) {
            if ($scope.sameAsBilling == true) {
                $scope.customer.ShipAddr = $scope.customer.BillAddr;
            }
            $scope.showProgress = true;
            $scope.hideDialogActions = true;

            vm.promise = CustomerModel.AddCustomer($scope.customer);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {
                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    $rootScope.$broadcast('add-customer-event', {
                        data: response.data
                    });
                } else {
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                }
                $state.reload()
                $mdDialog.hide();
            });
        };
    }

})();
