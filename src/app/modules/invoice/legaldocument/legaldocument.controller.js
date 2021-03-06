(function ()
{
    'use strict';

    angular
        .module('invoice')
        .controller('LegalDocumentController', Controller)
       
    function Controller($scope, $rootScope,$mdDialog,SettingModel,InvoiceModel,$timeout,$locale,Clique,printer)
    {
       var vm = this;
        

        $scope.promise = InvoiceModel.GetInvoiceLegalDocument();
            $scope.promise.then(function(response){
                    $("#legal_document").html('');
                    $("#legal_document").append(response);
            });

        $scope.print=function(){
            printer.print('https://apps.clique.center/template/legaldoc.html',{});
                    
        }
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
       
    }
})();