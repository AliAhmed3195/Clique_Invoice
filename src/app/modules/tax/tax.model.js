(function () {
    'use strict';

    angular
        .module('taxrate')
        .factory('TaxModel', TaxModel);

    TaxModel.$inject = ['$http', 'Clique', '$httpParamSerializer'];

    function TaxModel($http, Clique, $httpParamSerializer) {



        var service = {};

        service.GetTax = GetTax;
        service.AddTax = AddTax;



   
        return service;




        function GetTax() {
            return Clique.callService('get','/erp/quickbooks/taxrate','').then(handleSuccess, handleError);
        }
       
        function AddTax(params) {
            return Clique.callService('post','/invoice/taxrate/',params).then(handleSuccess, handleError);
        }
   

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
