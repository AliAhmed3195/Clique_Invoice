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
                        scope.multiEmailValid = true;
                        var atLeastOneInvalid = false;
                        angular.forEach(validityArr, function (value) {
                            if (value === false)
                                atLeastOneInvalid = true;
                            scope.multiEmailValid = true;

                        });
                        if (!atLeastOneInvalid) {
                            scope.multiEmailValid = true;
                            try {
                                scope.$parent.$parent.isDisabledSentButton = true;
                            } catch (err) {
                               // console.log("TCL: err", err)
                            }
                            // if (scope.$parent.$parent.isDisabledSentButton != undefined && scope.$parent.$parent.isDisabledSentButton != nul) {
                            //     scope.$parent.$parent.isDisabledSentButton = true;
                            // }
                            ctrl.$setValidity('multipleEmails', true);
                            return viewValue;
                        } else {
                            scope.multiEmailValid = false;
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
        $scope.showEmailProgress = false;
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
        $scope.showEmailProgress = false
        $scope.isDisabledSentButton = true
        $scope.isSending = false
        $scope.gotoAnchor = function (x) {
            var newHash = 'anchor' + x;
            if ($location.hash() !== newHash) {
                $location.hash('anchor' + x);
            } else {
                $anchorScroll();
            }
        };

        function getContactEmail(id, email) {
            $scope.showEmailProgress = true
            $scope.promise = InvoiceModel.GetContactEmail(id);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    // if (!response.data.item) {
                    if (response.data.item != null) {
                        $scope.isDisabledSentButton = false
                        $scope.showEmailProgress = false
                        $rootScope.customerEmail = response.data.item;
                    } else {
                        $scope.showEmailProgress = false
                        // $rootScope.customerEmail = email;
                        $scope.isDisabledSentButton = true
                    }
                }
            });
        }

        function getContactEmailById(id) {
            $scope.showEmailProgress = true
            $scope.promise = InvoiceModel.GetContactEmail(id);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.showEmailProgress = false
                    if (response.data.item != null) {
                        $scope.isDisabledSentButton = false
                        $rootScope.customerEmail = response.data.item;
                    } else {
                        $scope.showEmailProgress = false
                        // $rootScope.customerEmail = email;
                        $scope.isDisabledSentButton = true
                    }
                }
            });
        }
        // Get Customer Email address to show and edit
        angular.forEach($scope.selectedInvoiceData, function (invoiceInfo, key) {
            if (invoiceInfo.BillEmail == null || invoiceInfo.BillEmail.Address == null) {
                getContactEmailById(invoiceInfo.CustomerRef.value)
            } else {
                getContactEmail(invoiceInfo.CustomerRef.value, invoiceInfo.BillEmail.Address)
            }
        });
        $scope.SelectedTemplateValue = function (value) {
            $rootScope.email_template = value;
            //       console.log($rootScope.email_template);


        }
        $scope.send = function () {
            $scope.isSending = true
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
               //     console.log("test2");
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

            $scope.showEmailProgress = true;
            var invoiceTime = 0; //sec
            angular.forEach($scope.selectedInvoiceData, function (invoiceInfo, key) {

                var to_email = [];
                /*if (invoiceInfo.BillEmail != null) {
                    to_email.push(invoiceInfo.BillEmail.Address);
                }*/
                $scope.viewCustomerEmail = $rootScope.customerEmail;
                var customerEmailArray = $rootScope.customerEmail.split(',');
                var invoice = {
                    to: customerEmailArray,
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
                // debugger;
                if (response.statuscode == 0) {
                    $scope.settings = response.data;


                }
            });
        }

        function processInvoice(invoice) {
            $scope.sentInvoice.push(invoice.invoice_id);
            if ($scope.sentInvoice.length == $scope.selectedInvoiceData.length) {
                $scope.showEmailProgress = false;
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
        //    console.log("Timeout occurred" + new Date());
        }

        function updateProgress() {
            var progressSegment = 100 / $scope.selectedInvoiceData.length;
            $scope.progressValue = parseInt($scope.sentInvoice.length * progressSegment);
        }





    }
})();
