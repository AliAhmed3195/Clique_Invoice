(function() {
    'use strict';
    angular
        .module('recurring')
        .config(routeConfig);

    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.recurring', {
                url: '/recurring',
                templateUrl: 'app/modules/recurring/recurring.tmpl.html',
                controller: 'RecurringController',
                controllerAs: 'vm'
            });
        // next add the menu item that points to the above state.
        triMenuProvider.addMenu({
            name: 'Recurring',
            icon: 'zmdi zmdi-refresh',
            priority: 3.0,
            state: 'triangular.recurring',
            type: 'link',
            permission: 'recurring-listing',
        });
    }
})();