(function () {
    'use strict';

    angular
        .module('chartaccount')
        .factory('chartaccountModel', chartaccountModel);

        chartaccountModel.$inject = ['$http', 'Clique', '$httpParamSerializer'];

    function chartaccountModel($http, Clique, $httpParamSerializer) {

        var service = {};

        service.GetAccount = GetAccount;
        // service.AddTax = AddTax;  
        return service;

        function GetAccount() {
            return Clique.callService('get','/erp/quickbooks/account','').then(handleSuccess, handleError);
        }
       
        // function AddAccount(params) {
        //     return Clique.callService('post','/invoice/taxrate/',params).then(handleSuccess, handleError);
        // }
   
        // private functions
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
