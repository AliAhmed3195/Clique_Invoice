(function() {
    'use strict';

    angular
        .module('app.permission')
        .run(permissionRun);

    /* @ngInject */
    function permissionRun($rootScope, $cookies, $state, PermissionStore, RoleStore, UserService,SettingModel,Clique,triMenu) {
        // normally this would be done at the login page but to show quick
        // demo we grab username from cookie and login the user
        var cookieUser = $cookies.get('tri-user');
        if(angular.isDefined(cookieUser)) {
            UserService.login(cookieUser);
        }

        var permissions=[];
        $rootScope.promise = SettingModel.GetErpStatus();
            $rootScope.promise.then(function(response) {
                if (response.statuscode == 0) {
                   
                   
                   $rootScope.accounttype = response.data.erp.type;
                   console.log("response1", $rootScope.accounttype);
                    var appFeatures=response.data.erp.app_features;
                    console.log('app features', appFeatures);

                    if(appFeatures.length > 0){
                        angular.forEach(appFeatures, function(feature, key){
                            if(angular.isObject(feature)){
                                angular.forEach(feature, function(subFeatureArr, feature_name){
                                    angular.forEach(subFeatureArr, function(subFeatureValue, key){
                                             permissions.push(feature_name+'-'+subFeatureValue.toString());  
                                    });    

                                });    
                            }else{
                                permissions.push(feature.toString());  
                            }
                        });
                    }

                    // create permissions and add check function verify all permissions
                        //console.log("--permissions--");
                        //console.log(permissions);
                        PermissionStore.defineManyPermissions(permissions, function (permissionName) {
                            //return UserService.hasPermission(permissionName);
                            return true;
                        });
                    
                        $state.reload();

                } 
            });


        
      
        // create roles for app
        RoleStore.defineManyRoles({
            'SUPERADMIN': ['viewEmail', 'viewGitHub', 'viewCalendar', 'viewLayouts', 'viewTodo', 'viewElements', 'viewAuthentication', 'viewCharts', 'viewMaps'],
            'ADMIN': ['viewLayouts', 'viewTodo', 'viewElements', 'viewAuthentication', 'viewCharts', 'viewMaps'],
            'USER': ['viewAuthentication', 'viewCharts', 'viewMaps'],
            'ANONYMOUS': []
        });


        ///////////////////////

        // default redirect if access is denied
        function accessDenied() {
            $state.go('401');
        }

        // watches

        // redirect all denied permissions to 401
        var deniedHandle = $rootScope.$on('$stateChangePermissionDenied', accessDenied);

        // remove watch on destroy
        $rootScope.$on('$destroy', function() {
            deniedHandle();
        });
    }
})();
