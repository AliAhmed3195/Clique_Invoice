(function () {
    'use strict';
    var myModule = angular.module('item')
        .controller('ItemDialogController', ItemDialogController)

    function ItemDialogController($window, $scope, Clique, data, $rootScope, $timeout, $filter, $mdDialog, SettingModel, ItemsModel) {
   

     $scope.item = {}
      
        if (data) {
            // $scope.item.Sku = data.Sku;
            // $scope.item.Id = data.Id;
            // $scope.item.Name = data.Name;
            // $scope.item.UnitPrice = data.UnitPrice;
            // $scope.item.Type = data.Type;
            // $scope.item.ParentRef = data.ParentRef;
            // $scope.item.QtyOnHand = data.QtyOnHand;
            // $scope.item.InvStartDate = data.InvStartDate;
            // //  $scope.item.AssetAccountRef.value = data.AssetAccountRef;
            // $scope.item.ExpenseAccountRef = data.ExpenseAccountRef;
            // $scope.item.IncomeAccountRef = data.IncomeAccountRef;
            // $scope.item.Description = data.Description;
            // $scope.item.Active = data.Active;
            // $scope.item.Taxable = data.Taxable;
            // $scope.item.InvStartDate;
            // setsDate();
            $scope.item = {

                "Sku": data.Sku,
             "Id" : data.Id,
               "Name" : data.Name,
              "UnitPrice" : data.UnitPrice,
               "Type": data.Type,
              "ParentRef" : data.ParentRef,
             "QtyOnHand": data.QtyOnHand,
                "InvStartDate" : data.InvStartDate,
                "ExpenseAccountRef" : data.ExpenseAccountRef,
              "IncomeAccountRef" : data.IncomeAccountRef,
               "Description": data.Description,
               "Active": data.Active,
               "Taxable": data.Taxable
    
            }
          
         
        }
          if($scope.item.Id > 0) {
console.log("data.id", data.id);
          } else {
            console.log("data.id1", data.id);
            $scope.item.Taxable = true;
            $scope.item.Active = true;
          }
        console.log($scope.item.Taxable,"taxable1")
        var vm = this;
        $scope.hideDialogActions = false;
        // vm.addItemIntoList = addItemIntoList;

        // $scope.item.Name = itemData;
        // console.log("TCL: ItemDialogController -> item")
        
        $scope.account_income = [];
        $scope.account_expense = [];
        $scope.account_asset = [];
        $scope.enableMoreInventoryFields = false;
        setsDate();



        $scope.logoServiceUrl = Clique.api.url + Clique.api.version + '/companylogo';
        $scope.acceptTypes = "image/png,image/jpg";
        $scope.allowMultiple = false;
        $scope.forceIframeUpload = false;
        //if($rootScope.account==undefined){
        $scope.promise = SettingModel.GetAccount();
        $scope.promise.then(function (response) {
            // console.log('it is here')
            // console.log("TCL: ItemDialogController -> response", response)
            if (response.statuscode == 0) {
                $timeout(function () {
                    $rootScope.account = response.data.items;
                    $scope.account = $rootScope.account;
                    if ($scope.account.length > 0) {

                        $scope.account_expense = $filter('filter')($scope.account, {
                            'AccountType': 'Cost of Goods Sold'
                        }, true);
                        $scope.account_income = $filter('filter')($scope.account, {
                            'AccountType': 'Income'
                        }, true);
                        $scope.account_asset = $filter('filter')($scope.account, {
                            'AccountType': 'Other Current Asset'
                        }, true);


                        $scope.item.IncomeAccountRef = {
                            value: $scope.account_income[0].Id
                        };
                        $scope.item.AssetAccountRef = {
                            value: $scope.account_asset[0].Id
                        };
                        $scope.item.ExpenseAccountRef = {
                            value: $scope.account_expense[0].Id
                        };


                    }
                });
            }
        });
        if ($rootScope.categories == undefined) {
            $scope.promise = ItemsModel.GetCategories();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $timeout(function () {
                        $rootScope.categories = response.data.items;
                        $scope.categories = $rootScope.categories;
                    });
                }
            });
        } else {
            $scope.categories = $rootScope.categories;
        }

        $scope.$watch('item.ParentRef.value',
            function (newValue, oldValue) {
                if (newValue != undefined) {
                    $scope.item.SubItem = true;
                } else {
                    $scope.item.SubItem = false;
                    $scope.item.ParentRef = undefined;
                }
            }
        );
        $scope.$watch('item.Type',
            function (newValue, oldValue) {
             
                if (newValue == 'Inventory') {
                 
                    $scope.enableMoreInventoryFields = true;
                    $scope.item.AssetAccountRef = {
                        value: $scope.account_asset[0].Id
                    };
                    $scope.item.TrackQtyOnHand = true;
                } else {
                
                    $scope.enableMoreInventoryFields = false;
                    $scope.item.QtyOnHand = undefined;
                  $scope.item.InvStartDate =  $scope.item.InvStartDate;
                    $scope.item.AssetAccountRef = undefined;
                    $scope.item.TrackQtyOnHand = false;
                }
            }
        );

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

       
        $scope.adddecimalplaces =  function (value) {
            debugger;
            $scope.item.UnitPrice  = parseFloat(value).toFixed(2);
           
        }


        $scope.clickUpload = function () {
            //   console.log('--clickUpload');
            angular.element('#upload input').trigger('click');
          }
          $scope.onUpload = function (files) {
            //  console.log('--onUpload');
          }
          $scope.onSuccess = function (response) {
            // console.log('--onSuccess');
            if (response.status == 200 && response.data.statuscode == 0) {
              Clique.showToast('Image has been upload successfully', 'bottom right', 'success');
              GetItems();
            }
          }
          $scope.onError = function (response) {
            //    console.log('--onError');
            Clique.showResponseError(response);
          }
          $scope.onComplete = function (response) {
            //      console.log('--onComplete');
          }



          function setsDate() { 
         
                // var date = new Date();
                $scope.Date = $filter("date")(Date.now(), 'MM-dd-yyyy');
                console.log( "the date is",$scope.Date);
                $scope.item.InvStartDate =  $scope.Date;
              
                console.log( "the date invoice is",$scope.item.InvStartDate);
                // console.log( "the duedate invoice is",$scope.invoice.DueDate);
             
    
                // $scope.CurrentDate = new Date();
            }
    






    function GetItems() {
   
      $scope.promise = SettingModel.GetItems();
      $scope.promise.then(function (response) {
    
        if (response.statuscode == 0) {
                   
          vm.setting.user = response.data.user;
          

        } else {
          Clique.showToast(response.statusmessage, 'bottom right', 'error');
        }
      });

    }


    // $scope.item.Taxable = false;

    $scope.Taxableornot = function(value){
     $scope.item.Taxable = value;
        // console.log("the status is", $scope.item.Taxable);
    }




        // $scope.Activeornot();
        // $scope.item.Active = false;
       $scope.Activeornot = function(value){
        $scope.item.Active = value;
        //    console.log("the status is", $scope.item.Active);
       }


//  $scope.Activeornot($scope.Active);
 


        $scope.addNew = function (task) {
        
            if ($scope.item.Id) {
                //   Edit work 
             
                $scope.showProgress = true;
                $scope.hideDialogActions = true;
                console.log("2",$scope.item);
                vm.promise = ItemsModel.AddItem($scope.item,$scope.item.Id);
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
                console.log("1",$scope.item);

                $scope.showProgress = true;
                $scope.hideDialogActions = true;
    
                vm.promise = ItemsModel.AddItem($scope.item);
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



    //         $scope.showProgress = true;
    //         $scope.hideDialogActions = true;

    //         vm.promise = ItemsModel.AddItem($scope.item);
    //         vm.promise.then(function (response) {
    //             if (response.statuscode == 0) {
    //                 console.log('items data', response.data);
    //                 Clique.showToast(response.statusmessage, 'bottom right', 'success');
    //                 $rootScope.$broadcast('add-item-event', {
    //                     data: response.data,
    //                     index: 0
    //                 });
    //                 $rootScope.$emit('add-item-events' , {
    //                     data:response.data,
                        
    //                 })
    //                 // localStorage.setItem("new data add", response.data); 
    //                 $mdDialog.cancel();
    //                 // return response.data

    //                 // myModule.controller('ItemDialogController', function($rootScope) {
    //                 //     $rootScope.$on('ItemController', function(event, data) {
    //                 //       console.log(data + ' Inside Sibling two');
    //                 //     });
    //                 //     $rootScope.$on('ItemController', function(event, data) {
    //                 //       console.log('broadcast from child in parent', data);
    //                 //     });
    //                 //   });


    //     } else {
    //         Clique.showToast(response.statusmessage, 'bottom right', 'error');
    //     }
    //     $mdDialog.hide();
    //     $mdDialog.cancel();
    // });
};





    }

}) ();
