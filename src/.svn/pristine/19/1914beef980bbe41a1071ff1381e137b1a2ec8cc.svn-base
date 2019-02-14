'use strict';

angular.module('transactions')
    .factory('printer', ['$rootScope', '$compile', '$http', '$timeout', '$q',
        function ($rootScope, $compile, $http, $timeout, $q) {
            var printHtml = function (html) {
                var deferred = $q.defer();
                var hiddenFrame = $('<iframe style="display: block; width:0px; height:0px;"></iframe>').appendTo('body')[0];
               
                hiddenFrame.contentWindow.printAndRemove = function () {
                    hiddenFrame.contentWindow.print();
                    $(hiddenFrame).remove();    
                    deferred.resolve();
                };
                var htmlContent = "<!doctype html>" +
                        "<html>" +
                            '<body onload="window.print();">' +
                                html +
                            '</body>' +
                        "</html>";
                var doc = hiddenFrame.contentWindow.document.open("text/html", "replace");
                doc.write(htmlContent);
                doc.close();
                $timeout(function(){
                    //$(hiddenFrame).remove();

                },1000)
                return deferred.promise;
            };

            var openNewWindow = function (html) {
                var newWindow = window.open("printTest.html");
                newWindow.addEventListener('load', function () {
                    $(newWindow.document.body).html(html);
                }, false);
            };

            var print = function (templateUrl, data) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (templateData) {
                    var template = templateData.data;
                    var printScope = $rootScope.$new();
                    angular.extend(printScope, data);
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint, 1000);
                        } else {
                        // Replace printHtml with openNewWindow for debugging
                            printHtml(element.html()).then(function () {
                                $rootScope.isBeingPrinted = false;
                                renderAndPrintPromise.resolve();
                            });
                            printScope.$destroy();
                        }
                        return renderAndPrintPromise.promise;
                    };
                    waitForRenderAndPrint();
                    //spinner.forPromise(waitForRenderAndPrint());
                });
            };

            var printFromScope = function (templateUrl, scope, afterPrint) {
                $rootScope.isBeingPrinted = true;
                $http.get(templateUrl).then(function (response) {
                    var template = response.data;
                    var printScope = scope;
                    var element = $compile($('<div>' + template + '</div>'))(printScope);
                    var renderAndPrintPromise = $q.defer();
                    var waitForRenderAndPrint = function () {
                        if (printScope.$$phase || $http.pendingRequests.length) {
                            $timeout(waitForRenderAndPrint);
                        } else {
                            printHtml(element.html()).then(function () {
                                $rootScope.isBeingPrinted = false;
                                if (afterPrint) {
                                    afterPrint();
                                }
                                renderAndPrintPromise.resolve();
                            });
                        }
                        return renderAndPrintPromise.promise;
                    };
                    waitForRenderAndPrint();
                    //spinner.forPromise(waitForRenderAndPrint());
                });
            };
            return {
                print: print,
                printFromScope: printFromScope
            };
        }]);
