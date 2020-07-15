(function () {
    'use strict';

    angular
        .module('customer')
        .factory('CustomerModel', CustomerModel);

    CustomerModel.$inject = ['$http', 'Clique', '$httpParamSerializer'];

    function CustomerModel($http, Clique, $httpParamSerializer) {

        var service = {};
        service.GetAllInvoice = GetAllInvoice;
        service.GetCustomers = GetCustomers;
        service.AddCustomer = AddCustomer;
        service.SearchCustomers = SearchCustomers;
        return service;

        function AddCustomer(params) {
            return Clique.callService('post', '/erp/quickbooks/contact', params).then(handleSuccess, handleError);
        }

        function GetAllInvoice(query) {
            var qs = $httpParamSerializer(query);
            return Clique.callService('get', '/erp/quickbooks/invoice/?' + qs, '').then(handleSuccess, handleError);
        }

        function GetCustomers() {
            return Clique.callService('get', '/erp/quickbooks/contact').then(handleSuccess, handleError);
        }

        function SearchCustomers(params) {
            var qs = $httpParamSerializer(params);
            return Clique.callService('get', '/erp/quickbooks/contact/?' + qs, '').then(handleSuccess, handleError);
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
