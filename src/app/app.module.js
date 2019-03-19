(function () {
    'use strict';

    angular
        .module('app', [
            'ui.router',
            'triangular',
            'ngAnimate', 'ngCookies', 'ngSanitize', 'ngMessages', 'ngMaterial',
            'googlechart', 'chart.js', 'linkify', 'ui.calendar', 'angularMoment', 'uiGmapgoogle-maps', 'hljs', 'md.data.table', angularDragula(angular), 'ngFileUpload',
            'pdfjsViewer',
            'app.translate',
            // only need one language?  if you want to turn off translations
            // comment out or remove the 'app.translate', line above
            //'app.permission',
            // dont need permissions?  if you want to turn off permissions
            // comment out or remove the 'app.permission', line above
            // also remove 'permission' from the first line of dependencies
            // https://github.com/Narzerus/angular-permission see here for why
            // uncomment above to activate the example seed module
            // 'seed-module',
            'dashboard',
            'invoice',
            'settings',
            'transactions',
            //'customer',
            // recurring and statement commented for live
            'recurring',
            'statement',
            'salesreceipt',
            'angular-clipboard',
            'app.permission',
            'angularTrix',

            //'angularjs-crypto',
            //'permission',

        ])

        // set a constant for the API we are connecting to
        .constant('API_CONFIG', {
            'url': ''
        });
})();
