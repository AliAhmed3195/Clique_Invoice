(function() {
    'use strict';

    angular
        .module('dashboard')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($stateProvider, triMenuProvider) {

        $stateProvider
        .state('triangular.dashboard-analytics', {
            url: '/dashboards/analytics',
            templateUrl: 'app/modules/dashboards/analytics/dashboard-analytics.tmpl.html',
            controller: 'DashboardAnalyticsController',
            controllerAs: 'vm',
        })

        triMenuProvider.addMenu({
            name: 'Dashboard',
            icon: 'zmdi zmdi-home',
            type: 'link',
            state:'triangular.dashboard-analytics',
            priority: 1.1,
            permission: 'dashboard',
            
        });

    }
})();
