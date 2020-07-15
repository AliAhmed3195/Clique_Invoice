(function ()
{
    'use strict';

    angular
        .module('invoice')
        .controller('LinkInvoiceController', Controller);
        
    function Controller($scope, $rootScope,$mdDialog,SettingModel,InvoiceModel,$timeout,$locale,Clique,printer,$sce,InvoiceData,$filter)
    {
        debugger;
       var vm = this;
       $scope.textToCopy=[];
       $scope.allLinks="";
       var invoiceParams=[];

        if($scope.invoiceSelection.length > 0){
            angular.forEach($scope.invoiceSelection, function(invoice_id, key) {
                    var filteredInvoice = $filter('filter')(InvoiceData, {
                        'Id': invoice_id
                    })[0];

                    var invoiceInfo={
                      invoice_id:invoice_id,
                      customer_id:filteredInvoice.CustomerRef.value
                    };
                    
                    invoiceParams.push(invoiceInfo);
            });
             $scope.promise = InvoiceModel.GetInvoiceLink({"data":invoiceParams});
             $scope.promise.then(function(response){
                if(response.statuscode==0){
                    // debugger;
                    $scope.textToCopy = response.data;    
                    console.log("$scope.textToCopy", $scope.textToCopy);
                    if($scope.textToCopy.length > 0){
                        angular.forEach($scope.textToCopy, function(value, key){
                            $scope.allLinks+=value;
                            $scope.allLinks+='\n';
                            console.log("$scope.allLinks",$scope.allLinks);

                        });
                    }
                }
            });
         }

        $scope.stripText = function(text) {
          return text;
        } 
        $scope.success=function(){
            Clique.showToast(+$scope.textToCopy.length+" Invoice(s) links Copied to Clipboard","bottom right","success");
            $mdDialog.hide();
        }
        $scope.fail=function(err){
            Clique.showToast("Error unable to copy","bottom right","error");
        }  
       
    }
})();