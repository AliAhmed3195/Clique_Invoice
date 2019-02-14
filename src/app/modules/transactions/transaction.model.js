(function () {
    'use strict';

    angular
        .module('invoice')
        .factory('TransactionModel', TransactionModel);

    TransactionModel.$inject = ['$http','Clique','$httpParamSerializer'];
    function TransactionModel($http,Clique,$httpParamSerializer) {
        
        var service = {};
            service.GetAllTransaction = GetAllTransaction;
            service.DoVoidTransaction = DoVoidTransaction;
            service.DoRefundTransaction = DoRefundTransaction;
            service.sendReceipt=sendReceipt;
        return service;

        
        function GetAllTransaction(query) {
            var qs = $httpParamSerializer(query);
            return Clique.callService('get','/invoice/transactions/?'+qs,'').then(handleSuccess, handleError);
        }


        function DoVoidTransaction(params) {
            return Clique.callService('post','/transaction/void/',params).then(handleSuccess, handleError);
        }
      
       function DoRefundTransaction(params) {
            return Clique.callService('post','/transaction/refund/',params).then(handleSuccess, handleError);
        }

        function sendReceipt(params) {
            return Clique.callService('post','/transaction/email_receipt/',params).then(handleSuccess, handleError);
        }
      

        // private functions
        function handleSuccess(res) {
            console.log(res);
            return res.data;
        }
        function handleError(error) {
            //console.log(error);
            return error;
        }
    }

})();
