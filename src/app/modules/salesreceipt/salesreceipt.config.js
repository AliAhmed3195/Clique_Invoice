(function() {
    'use strict';
    angular
        .module('salesreceipt')
        .config(routeConfig);

    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.salesreceipt', {
                url: '/salesreceipt',
                templateUrl: 'app/modules/salesreceipt/salesreceipt.tmpl.html',
                controller: 'SalesReceiptController',
                controllerAs: 'vm',
                resolve: {
                    Countries: function($http) {
                      return $http.get('app/modules/invoice/data/countries.json');
                    }
                }
            });
        // next add the menu item that points to the above state.
        triMenuProvider.addMenu({
            name: 'Sales Receipt',
            icon: 'fa fa-file-text-o',
            priority: 3.0,
            state: 'triangular.salesreceipt',
            type: 'link',
            permission: 'salesreceipt-addnew',
        });
    }
})();