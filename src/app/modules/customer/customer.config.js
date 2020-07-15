(function () {
    'use strict';
    angular
        .module('customer')
        .config(routeConfig);
    /* @ngInject */
    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
            .state('triangular.customer-list', {
                url: '/customer/list/',
                templateUrl: 'app/modules/customer/listing/customer-listing.tmpl.html',
                controller: 'CustomerController',
                controllerAs: 'vm',
                resolve: {
                    Countries: function ($http) {
                        return $http.get('app/modules/invoice/data/countries.json');
                    }
                }
                // data: {
                //       permissions: {
                //         only: 'viewEmail'
                //       }
                //     }
            })
            .state('triangular.card-profile', {
                url: '/customer/card-profile',
                templateUrl: 'app/modules/customer/detail/card.profile.tmpl.html',
                controller: 'CardProfileController',
                params: {
                    'data': '',
                },
                controllerAs: 'vm'

            })
        // .state('triangular.customer-create', {
        //     url: '/customer/create/',
        //     templateUrl: 'app/modules/customer/createnew/customer.create.tmpl.html',
        //     controller: 'InvoiceCreateController',
        //     controllerAs: 'vm',
        //     params: {
        //         'action': 'createinvoice', 
        //       },
        //     data: {
        //         layout: {
        //             sideMenuSize: 'icon'
        //         }

        //     },
        //     resolve: {
        //         Countries: function($http) {
        //           return $http.get('app/modules/customer/data/countries.json');
        //         }
        //     }

        // })
        // .state('triangular.customer-payment', {
        //     url: '/customer/payment',
        //     templateUrl: 'app/modules/customer/payment/profile_creditcard.html',
        //     controller: 'PaymentInvoiceContoller',
        //     controllerAs: 'vm'

        // });
        // next add the menu item that points to the above state.
        triMenuProvider.addMenu({
            name: 'Customers',
            icon: 'zmdi zmdi-accounts',
            priority: 2.0,
            state: 'triangular.customer-list',
            type: 'link',
            permission: 'customer-listing',

        });
    }
})();
