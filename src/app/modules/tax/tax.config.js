(function () {
    'use strict';
    angular
        .module('taxrate')
        .config(routeConfig);
    /* @ngInject */
    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.tax-list', {
                url: '/tax/list/',
               templateUrl: 'app/modules/tax/listing/tax-listing.tmpl.html',
               controller: 'TaxController',
               controllerAs: 'vm',
                // data: {
                //       permissions: {
                //         only: 'viewEmail'
                //       }
                //     }
            })
        triMenuProvider.addMenu({
            name: 'Tax Rate',
            icon: 'zmdi zmdi-money-box',
            priority: 3.0,
            state: 'triangular.tax-list',
            type: 'link',
             permission: 'taxrate-listing',

        });
    }
})();
