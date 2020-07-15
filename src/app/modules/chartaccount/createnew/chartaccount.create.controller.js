(function () {
    'use strict';
    angular
        .module('taxrate')
        .controller('TaxDialogController', TaxDialogController)
        .directive('stringToNumber', function() {
            return {
              require: 'ngModel',
              link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    debugger;
                  return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    debugger;
                  return parseFloat(value, 10);
                });
              }
            };
          });
    function TaxDialogController($window, $scope, Clique, data, $rootScope, $timeout, $filter, $mdDialog, SettingModel, TaxModel)
     {
       // debugger;
        $scope.item = {};
     //   console.log('data of single data' , data);
        if(data) {
         $scope.item.Type       = data.Type;
         $scope.item.CustomName = data.CustomName;
         $scope.item.Region     = data.Region;
         $scope.item.Rate       = data.Rate;
         $scope.item.RateType   = data.RateType;
         $scope.item.Active     = data.Active;
        // $scope.item.Ratetype = data[0].Ratetype;
         $scope.item.Description = data.Description;
    
         $scope.item.Id = data.Id;
        }

        if($scope.item.Id > 0) {
            console.log("data.id", data.id);
                      } else {
                        console.log("data.id1", data.id);
                       
                        $scope.item.Active = true;
                      }






        var vm = this;
        // vm.setTwoNumberDecimal = setTwoNumberDecimal;
        $scope.hideDialogActions = false;
      
        // $scope.item.Name = itemData;
        // console.log("TCL: ItemDialogController -> item")
        $scope.account_income = [];
        $scope.account_expense = [];
        $scope.account_asset = [];
        $scope.enableMoreInventoryFields = false;

        // $scope.item.Active = false;
        // $scope.Activeornot = function(value){
        //  $scope.item.Active = value;
        //  console.log("the status is", $scope.item.Active);
        // }
 
        // $scope.setTwoNumberDecimal =  function (event) {
        //     debugger;
        //     event.key = parseFloat(event.key).toFixed(2);
        //     $scope.item.Rate = event.key;
        // }

        $scope.adddecimalplaces =  function (value) {
            debugger;
            $scope.item.Rate  = parseFloat(value).toFixed(2);
           
        }


        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.addNew = function (task) {
         //   debugger;
           
         if ($scope.item.Id) {
            //   Edit work 
      
            $scope.showProgress = true;
            $scope.hideDialogActions = true;

            vm.promise = TaxModel.AddTax($scope.item,$scope.item.Id);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {
                    // console.log('items data', response.data);
                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    $rootScope.$broadcast('add-item-event', {
                        data: response.data,
                        index: 0
                    });
                    $rootScope.$emit('add-item-events' , {
                        data:response.data,
                        
                    })
                    // localStorage.setItem("new data add", response.data); 
                    $mdDialog.cancel();
                    // return response.data

                    // myModule.controller('ItemDialogController', function($rootScope) {
                    //     $rootScope.$on('ItemController', function(event, data) {
                    //       console.log(data + ' Inside Sibling two');
                    //     });
                    //     $rootScope.$on('ItemController', function(event, data) {
                    //       console.log('broadcast from child in parent', data);
                    //     });
                    //   });


        } else {
            Clique.showToast(response.statusmessage, 'bottom right', 'error');
        }
        $mdDialog.hide();
        $mdDialog.cancel();
    });

    
        } else {
            //  save
            // debugger;
            $scope.showProgress = true;
            $scope.hideDialogActions = true;

            vm.promise = TaxModel.AddTax($scope.item);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {
                    // console.log('items data', response.data);
                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    $rootScope.$broadcast('add-item-event', {
                        data: response.data,
                        index: 0
                    });
                    $rootScope.$emit('add-item-events' , {
                        data:response.data,
                        
                    })
                    // localStorage.setItem("new data add", response.data); 
                    $mdDialog.cancel();
                    // return response.data

                    // myModule.controller('ItemDialogController', function($rootScope) {
                    //     $rootScope.$on('ItemController', function(event, data) {
                    //       console.log(data + ' Inside Sibling two');
                    //     });
                    //     $rootScope.$on('ItemController', function(event, data) {
                    //       console.log('broadcast from child in parent', data);
                    //     });
                    //   });


        } else {
            Clique.showToast(response.statusmessage, 'bottom right', 'error');
        }
        $mdDialog.hide();
        $mdDialog.cancel();
    });
    }
    };
    }

})();
