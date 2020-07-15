(function () {
    'use strict';

    angular
        .module('app')
        .config(translateConfig);

    /* @ngInject */
    function translateConfig(triSettingsProvider, triRouteProvider, CliqueProvider) {

        var appConfig = CliqueProvider.$get().configApp()
        var appName = appConfig.appName;
        var appLogo = appConfig.appLogo;
        var now = new Date();
        // var http = angular.injector(['ng']).get('$http');
        // var url = "http://192.168.1.108:8000"
        // var logo = "";
        // http.get("https://jsonplaceholder.typicode.com/todos/1")
        //     .then(function (response) {
        //         logo = 'assets/images/logo.png'
        //     }, function (error) {
        //     });

        // set app name & logo (used in loader, sidemenu, footer, login pages, etc)
        triSettingsProvider.setLogo(appLogo);
        triSettingsProvider.setName(appName);
        triSettingsProvider.setCopyright('&copy;' + now.getFullYear() + appName + ' .center');
        // set current version of app (shown in footer)
        triSettingsProvider.setVersion('2.7.1');
        // set the document title that appears on the browser tab
        triRouteProvider.setTitle(appName);
        triRouteProvider.setSeparator('|');
    }
})();
