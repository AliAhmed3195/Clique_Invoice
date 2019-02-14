(function () {
    'use strict';

    angular
    .module('statement')
    .factory('StatementModel', StatementModel);

    StatementModel.$inject = ['$http','Clique','$httpParamSerializer'];
    function StatementModel($http,Clique,$httpParamSerializer) {
        var service = {};
        service.SetInvoiceTemplate=SetInvoiceTemplate; 
        
        return service;

        
        function SetInvoiceTemplate(params) {
            return Clique.callService('post','/invoice_templates/',params).then(handleSuccess, handleError);
        }
        
        function handleSuccess(res) {
            //console.log(res);
            return res.data;
        }

        function handleError(error) {
            //console.log(error);
            return error;
        }
    }

})();
