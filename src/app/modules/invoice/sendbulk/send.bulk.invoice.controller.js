(function () {
    'use strict';

    angular
        .module('invoice')
        .controller('SendBulkInvoiceController', Controller)
        .run(['$anchorScroll', function ($anchorScroll) {
            $anchorScroll.yOffset = 50; // always scroll by 50 extra pixels
        }])
        .filter('parseErrorMessage', function ($filter) {
            return function (input, invoice_id) {
                if (input.length > 0) {
                    var filteredInvoiceMessage = $filter('filter')(input, {
                        'id': invoice_id
                    })[0];
                    if (filteredInvoiceMessage != undefined) {
                        return filteredInvoiceMessage;
                    }
                    return '';
                }
            };
        })
        .directive('clickToEdit', function ($timeout, $rootScope) {
            return {
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    type: '@type'
                },
                replace: true,
                transclude: false,
                // includes our template
                template: '<div class="ng-binding" style="height:50px;"><md-input-container class="hover-edit-trigger">' +
                    '<div class="hover-text-field" ng-show="!editState" ng-click="toggle()">{{model}} <i class="zmdi zmdi-border-color" style="cursor: pointer;"></i></div>' +
                    '<input  class="inputText" style="height: 50%;width: 80%;text-align: left;" label="subject" name="customeremail" multiple-emails ng-model="localModel" ng-enter="save()" ng-show="editState && type == \'inputText\'"/>' +
                    '<div ng-messages="sendEmail.customeremail">' +
                    '<div ng-message="email">Please enter a valid email address.</div>' +
                    '</div>' +
                    '</md-input-container>' +
                    '<div class="edit-button-group pull-right" ng-show="editState">' +
                    '<span><i class="zmdi zmdi-check zmdi-hc-2x" ng-click="save()" style="color:#08C65B;cursor: pointer;"></i></span><span>&nbsp;</span><span>&nbsp;</span>' +
                    '</div>' +
                    '</div>',
                link: function (scope, element, attrs) {
                    scope.editState = false;

                    // make a local ref so we can back out changes, this only happens once and persists
                    scope.localModel = scope.model;

                    // apply the changes to the real model
                    scope.save = function () {
                        scope.model = scope.localModel;
                        $rootScope.customerEmail = scope.model;
                        scope.toggle();
                    };

                    // don't apply changes
                    scope.cancel = function () {
                        scope.localModel = scope.model;
                        //scope.customerEmail = scope.localModel;
                        //console.log(scope.customerEmail);
                        scope.toggle();
                    }

                    /*
                     * toggles the editState of our field
                     */
                    scope.toggle = function () {

                        scope.editState = !scope.editState;

                        /*
                         * a little hackish - find the "type" by class query
                         *
                         */
                        var x1 = element[0].querySelector("." + scope.type);

                        /*
                         * could not figure out how to focus on the text field, needed $timout
                         * http://stackoverflow.com/questions/14833326/how-to-set-focus-on-input-field-in-angularjs
                         */
                        $timeout(function () {
                            // focus if in edit, blur if not. some IE will leave cursor without the blur
                            scope.editState ? x1.focus() : x1.blur();
                        }, 0);
                    }
                }
            }
        })
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter);
                        });
                        event.preventDefault();
                    }
                });
            };
        })
        .directive('multipleEmails', function () {
            return {
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {
                    ctrl.$parsers.unshift(function (viewValue) {
                        var emails = viewValue.split(',');
                        var re = /\S+@\S+\.\S+/;
                        var validityArr = emails.map(function (str) {
                            return re.test(str.trim());
                        });
                        var atLeastOneInvalid = false;
                        angular.forEach(validityArr, function (value) {
                            if (value === false)
                                atLeastOneInvalid = true;
                        });
                        if (!atLeastOneInvalid) {
                            ctrl.$setValidity('multipleEmails', true);
                            return viewValue;
                        } else {
                            ctrl.$setValidity('multipleEmails', false);
                            return undefined;
                        }
                    });
                }
            }
        });

    function Controller($scope, $rootScope, $mdDialog, SettingModel, InvoiceModel, $timeout, $location, $anchorScroll, $filter) {
        $scope.settings = {};
        $scope.sentInvoice = [];
        $scope.showProgress = false;
        $scope.progressValue = 0;
        $scope.currecntInvoice;
        $scope.invoiceMessages = [];
        $scope.templateInfo;
        $scope.selecttemplate;
        $rootScope.selectedTemplate;
        $rootScope.customerEmail = '';
        getSettings();
        $scope.sprintName = "Sprint 3";
        $scope.sprintDesc = "Learn directives";

        $scope.gotoAnchor = function (x) {
            var newHash = 'anchor' + x;
            if ($location.hash() !== newHash) {
                $location.hash('anchor' + x);
            } else {
                $anchorScroll();
            }
        };

        //console.log($scope.selectedInvoiceData);
        // Get Customer Email address to show and edit
        angular.forEach($scope.selectedInvoiceData, function (invoiceInfo, key) {
            if (invoiceInfo.BillEmail != null) {
                $rootScope.customerEmail = invoiceInfo.BillEmail.Address;
            }
        });

        $scope.SelectedTemplateValue = function (value) {
            $rootScope.email_template = value;
            //       console.log($rootScope.email_template);


        }
        $scope.send = function () {
            //       console.log($rootScope.email_template)
            if ($rootScope.email_template == undefined) {
                $rootScope.email_template = {}
                $rootScope.email_template.name = ''
                $rootScope.email_template.subject = ''
                $rootScope.email_template.body = ''
            }
            $scope.selectedTemplate;
            //   console.log($rootScope.email_template)
            //   console.log($rootScope.email_template)
            if (("template_email" in $scope.settings.InvoiceContacts) == true) {
                //  console.log("test");
                if ($scope.settings.InvoiceContacts.template_email.length > 0) {
                    console.log("test2");
                    for (var i = 0; i < $scope.settings.InvoiceContacts.template_email.length; i++) {
                        //         console.log($scope.settings.InvoiceContacts.template_email)
                        if ($scope.settings.InvoiceContacts.template_email[i].isSelected == true && $rootScope.email_template.id == $scope.settings.InvoiceContacts.template_email.id) {
                            //    console.log("template_email",$scope.settings.InvoiceContacts.template_email)
                            $rootScope.email_template = $scope.settings.InvoiceContacts.template_email
                            $rootScope.email_template.name = $scope.settings.InvoiceContacts.template_email[i].name
                            $rootScope.email_template.subject = $scope.settings.InvoiceContacts.template_email[i].subject
                            $rootScope.email_template.body = $scope.settings.InvoiceContacts.template_email[i].body

                            //    console.log("tempr",  $rootScope.email_template);
                        }
                        //         console.log("temprr",  $rootScope.email_template);
                    }

                } else if (!$rootScope.email_template) {
                    $rootScope.email_template = $scope.settings.InvoiceContacts.template_email
                    $rootScope.email_template.name = ''
                    $rootScope.email_template.subject = ''
                    $rootScope.email_template.body = ''
                    //   console.log($rootScope.email_template)
                    //   console.log( $rootScope.email_template.name)
                }
            } else {
                $rootScope.email_template = {}
                $rootScope.email_template.name = ''
                $rootScope.email_template.subject = ''
                $rootScope.email_template.body = ''
            }

            //  console.log("outisde",$rootScope.email_template)

            $scope.showProgress = true;
            var invoiceTime = 0; //sec
            angular.forEach($scope.selectedInvoiceData, function (invoiceInfo, key) {

                var to_email = [];
                /*if (invoiceInfo.BillEmail != null) {
                    to_email.push(invoiceInfo.BillEmail.Address);
                }*/
                $scope.viewCustomerEmail = $rootScope.customerEmail;
                var invoice = {
                    to: [$rootScope.customerEmail],
                    cc: $scope.settings.InvoiceContacts.cc_email,
                    bcc: $scope.settings.InvoiceContacts.bcc_email,
                    subject: $rootScope.email_template.subject,
                    body: $rootScope.email_template.body,
                    sender_name: $scope.settings.InvoiceContacts.sender_name,
                    sender_email: $scope.settings.InvoiceContacts.sender_email,
                    invoice_id: invoiceInfo.Id,
                    customer_id: invoiceInfo.CustomerRef.value,
                    invoice_template_id: $scope.settings.InvoiceTemplateId,
                    color: $scope.settings.InvoiceTemplateColor,
                    save_email_erp: false,
                    payment_method_id: $scope.paymentInfo.id
                };
                $timeout(function () {
                    sendInvoice(invoice)
                }, invoiceTime);



                invoiceTime += 999; //sec
            });

        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.showInvoiceProgress = function (invoice_id) {
            //console.log(invoice_id);
            return true;
        }


        function sendInvoice(invoice) {
            if (invoice.to.length == 0) {

                var message = {
                    id: invoice.invoice_id,
                    type: 'notsent',
                    message: "Client Email address not found"
                };
                $scope.invoiceMessages.push(message);
                processInvoice(invoice);

            } else {
                $scope.currecntInvoice = invoice.invoice_id;
                $scope.promise = InvoiceModel.SendInvoice(invoice);
                $scope.promise.then(function (response) {
                    console.log('TCL: sendInvoice -> response', response)

                    if (response.statuscode == 0) {

                        var message = {
                            id: invoice.invoice_id,
                            type: 'processed',
                            message: 'Processed'
                        };
                        $scope.invoiceMessages.push(message);
                    } else {

                        var message = {
                            id: invoice.invoice_id,
                            type: 'notsent',
                            message: response.statusmessage
                        };
                        $scope.invoiceMessages.push(message);

                    }
                    processInvoice(invoice);

                });
            }
        }

        function getSettings() {

            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.settings = response.data;


                }
            });
        }

        function processInvoice(invoice) {
            $scope.sentInvoice.push(invoice.invoice_id);
            if ($scope.sentInvoice.length == $scope.selectedInvoiceData.length) {
                $scope.showProgress = false;
                $scope.currecntInvoice = 0;
                $timeout(function () {
                    $scope.refreshInvoiceGrid();
                    $mdDialog.hide();
                }, 3000)
            }

            updateProgress();

            $timeout(function () {
                $scope.gotoAnchor(invoice.invoice_id);
            }, 500);
        }

        function callAtTimeout() {
            console.log("Timeout occurred" + new Date());
        }

        function updateProgress() {
            var progressSegment = 100 / $scope.selectedInvoiceData.length;
            $scope.progressValue = parseInt($scope.sentInvoice.length * progressSegment);
        }





    }
})();
