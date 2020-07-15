(function() {
    'use strict';
    angular
        .module('thread')
        .config(routeConfig);

    function routeConfig($stateProvider, triMenuProvider) {
        // $scope.promise = ThreadModel.GetTotalUnread();
        // $scope.promise.then(function (response) {
        //    if(response.status === 0) {
        //        console.log('count is ' , response.data)
        //    }
        // });
      //  console.log($rootScope)
        // first create a state that your menu will point to .
        var count =  localStorage.getItem("count")
        // console.log('count in customer portal' , count)
        $stateProvider
            .state('triangular.thread', {
                url: '/threads',
                templateUrl: 'app/modules/thread/thread.tmpl.html',
                controller: 'ThreadController',
                controllerAs: 'vm',
                //  data: {
                //       permissions: {
                //         only: 'viewEmail'
                //       }
                //     }
            });
        // next add the menu item that points to the above state.
        triMenuProvider.addMenu({
            name: 'Messages',
            icon: 'zmdi zmdi-inbox',
            priority: 4.0,
            state: 'triangular.thread',
            type: 'link',
            permission: 'messages-listing',
            
        });
    }
})();