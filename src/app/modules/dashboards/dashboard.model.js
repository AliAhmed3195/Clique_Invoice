(function () {
    'use strict';

    angular
        .module('dashboard')
        .factory('DashboardModel', DashboardModel);

    DashboardModel.$inject = ['$http','Clique','$httpParamSerializer'];
    function DashboardModel($http,Clique,$httpParamSerializer) {
        
        var service = {};
            service.GetInvoiceStatistics = GetInvoiceStatistics;
            service.GetTotalUnread = GetTotalUnread;
        return service;

        
        function GetInvoiceStatistics(query) {
            var qs = $httpParamSerializer(query);
            return Clique.callService('get','/invoice/dashboard/?'+qs,'').then(handleSuccess, handleError);
        }
      
        function GetTotalUnread() {
            return Clique.callService('get', '/invoice/totalunreadcount/' , '').then(handleSuccess, handleError);
          }

        // private functions
        function handleSuccess(res) {
            return res.data;
        }
        function handleError(error) {
            return error;
        }
    }

})();
