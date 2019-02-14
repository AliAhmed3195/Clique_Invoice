(function() {
    'use strict';
    angular
        .module('transactions')
        .config(routeConfig);
    /* @ngInject */
    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
        .state('triangular.transactionlist', {
            url: '/transaction/list',
            templateUrl: 'app/modules/transactions/transaction-listing.tmpl.html',
            controller: 'TransactionController',
            controllerAs: 'vm'
        })
      
        ;
        // next add the menu item that points to the above state.
         triMenuProvider.addMenu({
            name: 'Payments',
            icon: 'zmdi zmdi-card',
            priority: 4.0,
            state: 'triangular.transactionlist',
            type: 'link',
            permission: 'transaction-listing',
        });            
    }
})();