(function () {
    'use strict';
    angular
        .module('settings')
        .config(routeConfig);

    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.settings', {
                url: '/settings/general',
                templateUrl: 'app/modules/settings/settings.tmpl.html',
                controller: 'SettingsController',
                controllerAs: 'vm'
            });
        // next add the menu item that points to the above state.
        triMenuProvider.addMenu({
            name: 'Settings',
            icon: 'zmdi zmdi-settings',
            priority: 5.0,
            state: 'triangular.settings',
            type: 'link',
            permission: 'settings-depositToAccount',

        });
    }
})();
