(function () {
    'use strict';

    angular
    .module('settings')
    .factory('SettingModel', SettingModel);

    SettingModel.$inject = ['$http','Clique','API_CONFIG'];
    function SettingModel($http,Clique,API_CONFIG) {
        var service = {};

        service.GetSettings = GetSettings;
        service.SaveSettings = SaveSettings;
        service.GetCompanyInfo = GetCompanyInfo;
        service.GetPaymentInfo = GetPaymentInfo;
        service.GetInvoiceTemplates = GetInvoiceTemplates;
        service.SetInvoiceTemplate=SetInvoiceTemplate;
        service.SaveInvoiceEmailContent=SaveInvoiceEmailContent;
        service.SaveInvoiceContactSettings=SaveInvoiceContactSettings;
        /*service.GetTaxValues = GetTaxValues;
        service.SaveTaxRates = SaveTaxRates;
        service.RemoveTaxRate = RemoveTaxRate;*/
        service.GetPreferences = GetPreferences;
        service.GetAccount = GetAccount;
        service.GetErpStatus = GetErpStatus;
        service.SaveEmailSettings = SaveEmailSettings;
        service.GetProfileLink = GetProfileLink;
        service.PostProfileLink = PostProfileLink;


        return service;
        
        
        function PostProfileLink() {
            return Clique.callService('post','/profilelink/','').then(handleSuccess, handleError);
        }
        function GetProfileLink() {
            return Clique.callService('get','/profilelink/','').then(handleSuccess, handleError);
        }
        function GetSettings() {
            return Clique.callService('get','/settings/','').then(handleSuccess, handleError);
        }
        function SaveSettings(params) {
            var apiurl=API_CONFIG.api_url+API_CONFIG.api_version;
            return $http.post(apiurl+'/company', params, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined,'Authorization':Clique.getUserToken()}
            }).then(handleSuccess, handleError);
        }

        function SaveInvoiceContactSettings(params) {
            //return Clique.callService('post','/settings/invoice_contact',params).then(handleSuccess, handleError);
            return Clique.callService('post','/settings/',params).then(handleSuccess, handleError);
        }

        function SaveEmailSettings(params) {
            //return Clique.callService('post','/settings/invoice_contact',params).then(handleSuccess, handleError);
            return Clique.callService('post','/settings/',params).then(handleSuccess, handleError);
        }


        function SaveInvoiceEmailContent(params) {
            return Clique.callService('post','/settings/',params).then(handleSuccess, handleError);
        }

        function GetCompanyInfo() {
            return Clique.callService('get','/company','').then(handleSuccess, handleError);
        }
        function GetPaymentInfo() {
            return Clique.callService('get','/paymentmethods','').then(handleSuccess, handleError);
        }

        function GetInvoiceTemplates() {
            return Clique.callService('get','/invoice_templates/','').then(handleSuccess, handleError);
        }
        function SetInvoiceTemplate(params) {
            return Clique.callService('post','/invoice_templates/',params).then(handleSuccess, handleError);
        }

        /*function GetTaxValues() {
            return Clique.callService('get','/shopify/tax/','').then(handleSuccess, handleError);
        }
        function SaveTaxRates(params) {
            return Clique.callService('post','/shopify/tax/save/',params).then(handleSuccess, handleError);
        }
        function RemoveTaxRate(params) {
            return Clique.callService('post','/shopify/tax/remove/',params).then(handleSuccess, handleError);
        }*/
        function GetPreferences() {
            return Clique.callService('get','/erp/quickbooks/preferences','').then(handleSuccess, handleError);
        }
        function GetAccount() {
            return Clique.callService('get','/erp/quickbooks/account','').then(handleSuccess, handleError);
        }
        function GetErpStatus() {
            return Clique.callService('get','/erp/status','').then(handleSuccess, handleError);
        }



        // private functions

        function handleSuccess(res) {
            //console.log('----handle Success---');
            //console.log(res);
            return res.data;
        }

        function handleError(error) {
            //console.log(error);
            //console.log('----handle Error---');
            return error;
        }
    }

})();
