(function () {
    'use strict';

    angular
        .module('invoice')
        .factory('InvoiceModel', InvoiceModel);

    InvoiceModel.$inject = ['$http','Clique','$httpParamSerializer'];
    function InvoiceModel($http,Clique,$httpParamSerializer) {

        var service = {};
            service.GetAllInvoice = GetAllInvoice;
            service.GetInvoiceById = GetInvoiceById;
            service.GetInvoicePreviewById = GetInvoicePreviewById;
            service.GetLastInvoice = GetLastInvoice;
            service.GetLastSalesReceipt = GetLastSalesReceipt;
            service.SendInvoice = SendInvoice;
            service.GetInvoiceLink=GetInvoiceLink;
            service.GetQuickBooksConnectionStatus = GetQuickBooksConnectionStatus;
            service.GetCustomers = GetCustomers;
            service.AddCustomer = AddCustomer;
            service.GetInvoiceStatistics = GetInvoiceStatistics;
            service.GetItems = GetItems;
            service.GetCategories=GetCategories;
            service.AddItem = AddItem;
            service.GetTaxRate = GetTaxRate;
            service.GetTaxCode = GetTaxCode;
            service.GetTerm = GetTerm;
            service.createInvoice = createInvoice;
            service.createRecurringInvoice=createRecurringInvoice;
            service.GetInvoiceLegalDocument = GetInvoiceLegalDocument;
            service.GetClasses = GetClasses;
            service.GeterpStatus = GeterpStatus;
            service.SendStatement = SendStatement;
            service.GetOpenBalance = GetOpenBalance;
            service.GetStatementPreview = GetStatementPreview;
            service.GetInvoicetemplateById = GetInvoicetemplateById;

            //payment
            service.CCSale = CCSale;
            service.CCPartialSale = CCPartialSale;
            service.ProfileAdd = ProfileAdd;
            service.ProfileDelete = ProfileDelete;

            service.ProfileGet = ProfileGet;
            service.CardConnectAuthorizeToken=CardConnectAuthorizeToken;
            service.GetContactEmail=GetContactEmail;
             //bolt///
            service.BoltReadCard = BoltReadCard;

        return service;


        function GetAllInvoice(query) {
          
            var qs = $httpParamSerializer(query);
            return Clique.callService('get','/erp/quickbooks/invoice/?'+ qs,'').then(handleSuccess, handleError);
        }
        function GetContactEmail(id) {
            return Clique.callService('get','/erp/quickbooks/contactemail/'+ id,'').then(handleSuccess, handleError);
        }
        function GetInvoiceById(id) {
            return Clique.callService('get','/erp/quickbooks/invoice/'+ id,'').then(handleSuccess, handleError);
        }

        function GetLastInvoice() {
            return Clique.callService('get','/invoice/last/','').then(handleSuccess, handleError);
        }


        function GetLastSalesReceipt() {
            return Clique.callService('get','/salesreceipt/last/','').then(handleSuccess, handleError);
        }

        // ,token, appId, channelid
        function GetInvoicetemplateById(id,token, appId, channelid) {
            //?invoice_id=1&temp_id=1&temp_color=red
            // var template_id=sessionStorage.getItem("invoice_template_id");
            // var template_color=sessionStorage.getItem("template_color");
            //return Clique.callService('get','/erp/quickbooks/invoice/preview/'+id,'').then(handleSuccess, handleError);
            return Clique.callService('get','/erp/quickbooks/invoice/preview/?invoice_id='+id+'&token='+token+'&app_id='+appId+'&channelid='+channelid,'').then(handleSuccess, handleError);
        }





        function GetInvoicePreviewById(id) {
            //?invoice_id=1&temp_id=1&temp_color=red
            var template_id=sessionStorage.getItem("invoice_template_id");
            var template_color=sessionStorage.getItem("template_color");
            //return Clique.callService('get','/erp/quickbooks/invoice/preview/'+id,'').then(handleSuccess, handleError);
            return Clique.callService('get','/erp/quickbooks/invoice/preview/?invoice_id='+id+'&temp_id='+template_id+'&temp_color='+template_color,'').then(handleSuccess, handleError);
        }
        function SendInvoice(invoice) {
            return Clique.callService('post','/erp/quickbooks/invoice/send',invoice).then(handleSuccess, handleError);
        }
        function GetInvoiceLink(invoiceids) {
            return Clique.callService('post','/erp/quickbooks/invoice/link/',invoiceids).then(handleSuccess, handleError);
        }

        function GetQuickBooksConnectionStatus() {
            return Clique.callService('get','/erp/quickbooks/status/','').then(handleSuccess, handleError);
        }
        /// get status type for standalone
        function GeterpStatus() {
            return Clique.callService('get','/erp/status','').then(handleSuccess, handleError);
        }
        

        function GetCustomers() {
            return Clique.callService('get','/erp/quickbooks/contact','').then(handleSuccess, handleError);
        }
        function AddCustomer(params) {
            return Clique.callService('post','/erp/quickbooks/contact',params).then(handleSuccess, handleError);
        }
        function GetInvoiceStatistics(query) {
         
            var qs = $httpParamSerializer(query);
            return Clique.callService('get','/quickbooks/invoice/statistics/?'+ qs,'').then(handleSuccess, handleError);
            //return Clique.callService('get','/quickbooks/invoice/invoicedetails/?'+ qs,'').then(handleSuccess, handleError);
        }


        function GetItems() {
            return Clique.callService('get','/erp/quickbooks/allitems','').then(handleSuccess, handleError);
        }
        function GetCategories() {
            return Clique.callService('get','/erp/item/categories','').then(handleSuccess, handleError);
        }
        function AddItem(params) {
            return Clique.callService('post','/erp/quickbooks/allitems',params).then(handleSuccess, handleError);
        }
        function GetTaxRate() {
            return Clique.callService('get','/erp/quickbooks/taxrate','').then(handleSuccess, handleError);
        }
        function GetTaxCode() {
            return Clique.callService('get','/erp/quickbooks/taxcode','').then(handleSuccess, handleError);
        }
        function GetTerm() {
            return Clique.callService('get','/erp/quickbooks/term','').then(handleSuccess, handleError);
        }
        function createInvoice(invoice) {
            return Clique.callService('post','/erp/quickbooks/invoice/create/',invoice).then(handleSuccess, handleError);
        }
        function createRecurringInvoice(invoice) {
            return Clique.callService('post','/erp/invoice/recurring/create/',invoice).then(handleSuccess, handleError);
        }

        function GetInvoiceLegalDocument(id) {

            return Clique.callService('get','/invoice/recurring/legaldocument','').then(handleSuccess, handleError);
        }


        function GetClasses() {
            return Clique.callService('get','/erp/quickbooks/classes','').then(handleSuccess, handleError);
        }

        function SendStatement(params) {
            return Clique.callService('post','/invoice/sendstatement/',params).then(handleSuccess, handleError);
        }
        function GetOpenBalance(query) {
            var qs = $httpParamSerializer(query);
            return Clique.callService('get','/invoice/openbalance?'+ qs,'').then(handleSuccess, handleError);
        }
        function GetStatementPreview(query) {

            return Clique.callService('get','/invoice/statementpreview?'+ query,'').then(handleSuccess, handleError);
        }

        function CCPartialSale(params) {
            //return Clique.callService('post','/cardconnect/sale/',params).then(handleSuccess, handleError);
            return Clique.callService('post','/cardconnect/partialsale/',params).then(handleSuccess, handleError);
            //return Clique.callService('post','/transaction/partialsale/',params).then(handleSuccess, handleError);
        }
        function CCSale(params) {
            //return Clique.callService('post','/cardconnect/sale/',params).then(handleSuccess, handleError);
            return Clique.callService('post','/cardconnect/sale/',params).then(handleSuccess, handleError);
            //return Clique.callService('post','/transaction/sale/',params).then(handleSuccess, handleError);
        }
        function ProfileAdd(params) {
            return Clique.callService('post','/profile/add/',params).then(handleSuccess, handleError);
        }

        function ProfileDelete(params) {
            return Clique.callService('post','/profile/delete/',params).then(handleSuccess, handleError);
        }

        function ProfileGet(params) {
            return Clique.callService('post','/profile/get/',params).then(handleSuccess, handleError);
        }

         function CardConnectAuthorizeToken(params){
            return Clique.callService('post','/cardconnect/authorizetoken/',params).then(handleSuccess, handleError);
        }

        /*Bolt Device*/


        function BoltReadCard(params) {
            return Clique.callService('post','/bolt/readcard/',params).then(handleSuccess, handleError);
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
