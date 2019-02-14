(function() {
    'use strict';

    angular
        .module('app')
        .config(translateConfig);

    /* @ngInject */
    function translateConfig(triSettingsProvider, triRouteProvider) {
        var now = new Date();
        // set app name & logo (used in loader, sidemenu, footer, login pages, etc)
        triSettingsProvider.setName('Clique');
        triSettingsProvider.setCopyright('&copy;' + now.getFullYear() + ' clique.center');
        triSettingsProvider.setLogo('assets/images/logo.png');
        // set current version of app (shown in footer)
        triSettingsProvider.setVersion('2.7.1');
        // set the document title that appears on the browser tab
        triRouteProvider.setTitle('Clique');
        triRouteProvider.setSeparator('|');
    }
})();
