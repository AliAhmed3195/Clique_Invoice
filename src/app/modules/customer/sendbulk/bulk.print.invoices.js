'use strict';

angular.module('invoice')
    .factory('BulkPrintInvoices', ['$rootScope', '$compile', '$http', '$timeout', '$q','InvoiceModel','$sce','printer',
        function ($rootScope, $compile, $http, $timeout, $q,InvoiceModel,$sce,printer) {
            var printInvoice = function (invoiceSelection) {
                   
                    if(invoiceSelection.length > 0){
                        var invoice_list=invoiceSelection.join(",")
                        $rootScope.promise = InvoiceModel.GetInvoicePreviewById(invoice_list);
                            $rootScope.promise.then(function(response) {
                                 var invoiceContent = $sce.trustAsHtml(response); 
                                 $rootScope.printProcess=false;   
                                 printer.print('assets/invoice.bulk.print.html', {content:invoiceContent});
                            });  
                    }
            };
            return {
                printInvoice: printInvoice,
                
            };
        }]);