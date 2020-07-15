(function () {
    'use strict';

    angular
        .module('thread')
        .factory('ThreadModel', ThreadModel);

        ThreadModel.$inject = ['$http', 'Clique', '$httpParamSerializer'];

    function ThreadModel($http, Clique, $httpParamSerializer) {

        var service = {};
        // service.GetAllItems = GetAllItems;
        // service.GetCustomers = GetCustomers;
        // service.AddCustomer = AddCustomer;
        service.GetAllMerchantChat = GetAllMerchantChat;
        service.GetTotalUnread = GetTotalUnread;
        service.PostChatData = PostChatData;
        service.GetChatData = GetChatData;
        return service;

        // function AddCustomer(params) {
        //     return Clique.callService('post', '/erp/quickbooks/contact', params).then(handleSuccess, handleError);
        // }

        function GetAllMerchantChat() {
            // var qs = $httpParamSerializer(query);
            return Clique.callService('get', '/invoice/getmerchantthreads', '').then(handleSuccess, handleError);
        }
        function GetChatData(Invoice_id) {
            return Clique.callService('get', '/invoice/thread/' + Invoice_id +  '/', '').then(handleSuccess, handleError);
          }
        function GetTotalUnread() {
            return Clique.callService('get', '/invoice/totalunreadcount/' , '').then(handleSuccess, handleError);
          }
          function PostChatData(params) {
            return Clique.callService('post', '/invoice/openthread/', params).then(handleSuccess, handleError);
          }

        // function GetCustomers() {
        //     return Clique.callService('get', '/erp/quickbooks/contact', '').then(handleSuccess, handleError);
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
