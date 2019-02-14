(function() {
    'use strict';
    angular
        .module('invoice')
        .config(routeConfig);
    /* @ngInject */
    function routeConfig($stateProvider, triMenuProvider) {
        // first create a state that your menu will point to .
        $stateProvider
        .state('triangular.invoice-list', {
            url: '/invoice/list/:type',
            templateUrl: 'app/modules/invoice/listing/invoice-listing.tmpl.html',
            controller: 'InvoiceController',
            controllerAs: 'vm',
            data: {
                  permissions: {
                    only: 'viewEmail'
                  }
                }
        })
        .state('triangular.invoice-detail', {
            url: '/invoice/detail/:id',
            templateUrl: 'app/modules/invoice/detail/invoice.detail.tmpl.html',
            controller: 'InvoiceDetailController',
            params: {
                'id': '', 
              },
            controllerAs: 'vm'

        })
        .state('triangular.invoice-create', {
            url: '/invoice/create/',
            templateUrl: 'app/modules/invoice/createnew/invoice.create.tmpl.html',
            controller: 'InvoiceCreateController',
            controllerAs: 'vm',
            params: {
                'action': 'createinvoice', 
              },
            data: {
                layout: {
                    sideMenuSize: 'icon'
                }

            },
            resolve: {
                Countries: function($http) {
                  return $http.get('app/modules/invoice/data/countries.json');
                }
            }

        })
        .state('triangular.invoice-payment', {
            url: '/invoice/payment',
            templateUrl: 'app/modules/invoice/payment/profile_creditcard.html',
            controller: 'PaymentInvoiceContoller',
            controllerAs: 'vm'

        });
        // next add the menu item that points to the above state.
         triMenuProvider.addMenu({
            name: 'Invoices',
            icon: 'zmdi zmdi-collection-text',
            priority: 2.0,
            state: 'triangular.invoice-list',
            type: 'link',
            permission: 'invoice-listing',
    
        });  
 }
})();