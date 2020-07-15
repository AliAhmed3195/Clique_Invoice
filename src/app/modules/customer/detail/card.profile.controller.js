(function () {
    'use strict';
    angular
        .module('invoice')
        .controller('CardProfileController', Controller)

    function Controller($scope, data, Clique, $state, $mdDialog, CustomerModel, $http) {
        console.log("TCL: Controller -> data", data)
        if (data == "") {
            $state.go('triangular.customer-list');
        } else {
            $scope.data = data
            console.log("$scope.data ",$scope.data);
        }

        


        $scope.loadCountries = function () {
            $http.get('app/modules/invoice/data/countries.json').then(function (response) {
                $scope.countries = response.data;
          
            })
        };






              $scope.Save = function () {
              
            var vm = this;
           
            //addcustomer post data
            vm.promise = CustomerModel.AddCustomer($scope.data);
            vm.promise.then(function (response) {
          console.log(response);
                if (response.statuscode == 0) {
                   
                    Clique.showToast(response.statusmessage, 'bottom right', 'Customer Updated Successfully');
                    $rootScope.$broadcast('add-item-event', {
                        data: response.data,
                        index: index
                    });
                } else {
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                }
               
                $mdDialog.hide();
            });
        };



















        $scope.closeDialog = function () {
            $mdDialog.hide();
        }

    }
})();
