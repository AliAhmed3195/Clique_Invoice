(function () {
    'use strict';
    angular
        .module('item')
        .config(routeConfig);
    /* @ngInject */
    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.item-list', {
                url: '/item/list/',
                templateUrl: 'app/modules/item/listing/item-listing.tmpl.html',
                controller: 'ItemController',
                controllerAs: 'vm',
                // data: {
                //       permissions: {
                //         only: 'viewEmail'
                //       }
                //     }
            })
            .state('triangular.item-profile', {
                url: '/item/item-profile',
                templateUrl: 'app/modules/item/createnew/item.addnew.html',
                controller: 'ItemDialogController',
                params: {
                    'data': '',
                },
                controllerAs: 'vm'

            })


        triMenuProvider.addMenu({
            name: 'Products & Services',
            icon: 'zmdi zmdi-delicious',
            priority: 2.0,
            state: 'triangular.item-list',
            type: 'link',
             permission: 'item-listing',

        });
    }
})();
