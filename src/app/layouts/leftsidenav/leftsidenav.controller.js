(function() {
    'use strict';

    angular
        .module('triangular.components')
        .controller('LeftSidenavController', LeftSidenavController);

    /* @ngInject */
    function LeftSidenavController(triSettings, triLayout, $scope) {
        var vm = this;
        vm.layout = triLayout.layout;
        vm.sidebarInfo = {
            appName: triSettings.name,
            appLogo: triSettings.logo
        };
        vm.toggleIconMenu = toggleIconMenu;
        ////////////

        function toggleIconMenu() {
            var menu = vm.layout.sideMenuSize === 'icon' ? 'full' : 'icon';
            triLayout.setOption('sideMenuSize', menu);
            triLayout.setOption('sideMenuSize', menu);
        }
    }
})();
