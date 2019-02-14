(function() {
    'use strict';

    angular
        .module('app')
        .config(appConfig);

    /* @ngInject */
    function appConfig($compileProvider) {
        // Make sure this still works in controllers (breaking change in angular 1.6)
        $compileProvider.preAssignBindingsEnabled(true);
    }

})();
