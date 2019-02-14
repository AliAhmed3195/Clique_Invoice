(function() {
    'use strict';
    angular
        .module('statement')
        .config(routeConfig);

    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.statement', {
                url: '/statement',
                templateUrl: 'app/modules/statement/statement.tmpl.html',
                controller: 'StatementController',
                controllerAs: 'vm'
            })
			.state('triangular.statement-detail', {
            url: '/statement/detail/:id',
            templateUrl: 'app/modules/statement/statement.detail.tmpl.html',
            controller: 'StatementDetailController',
            params: {
                'id': '', 
              },
            controllerAs: 'vm'

        });
        // next add the menu item that points to the above state.
        triMenuProvider.addMenu({
            name: 'Statement',
            icon: 'zmdi zmdi-view-toc',
            priority: 3.0,
            state: 'triangular.statement',
            type: 'link',
            permission: 'statement-listing',
        });
    }
})();