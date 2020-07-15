(function () {
    'use strict';
    angular
        .module('chartaccount')
        .config(routeConfig);
    /* @ngInject */
    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.chartaccount-list', {
                url: '/chartaccount/list/',
               templateUrl: 'app/modules/chartaccount/listing/chartaccount-listing.tmpl.html',
               controller: 'chartaccountController',
               controllerAs: 'vm',
                // data: {
                //       permissions: {
                //         only: 'viewEmail'
                //       }
                //     }
            })
        triMenuProvider.addMenu({
            name: 'Chart of Account',
            icon: 'zmdi zmdi-assignment-account',
            priority: 3.0,
            state: 'triangular.chartaccount-list',
            type: 'link',
            permission: 'chartofaccount-listing'

        });
    }
})();
