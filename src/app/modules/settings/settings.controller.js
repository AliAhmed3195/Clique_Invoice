(function () {
    'use strict';

    angular
        .module('settings')
        .controller('SettingsController', Controller)
        .directive('mdChips', function () {
            return {
                restrict: 'E',
                require: 'mdChips', // Extends the original mdChips directive
                link: function (scope, element, attributes, mdChipsCtrl) {
                    mdChipsCtrl.onInputBlur = function () {
                        this.inputHasFocus = false;

                        // ADDED CODE
                        var chipBuffer = this.getChipBuffer();
                        if (chipBuffer != "") { // REQUIRED, OTHERWISE YOU'D GET A BLANK CHIP
                            this.appendChip(chipBuffer);
                            this.resetChipBuffer();
                        }
                        // - EOF - ADDED CODE
                    };
                }
            }
        });

    /* @ngInject */

    function Controller($window, $scope, $rootScope, $timeout, $interval, $q, $http, $compile, Clique, InvoiceModel, SettingModel, $mdDialog, $mdToast, $state, triTheming) {



        $scope.innerHeight = $window.innerHeight + 0;

        //remove invoice search
        sessionStorage.removeItem("invoice_search");

        var vm = this;
        vm.saveInvoiceContactSettings = saveInvoiceContactSettings;
        vm.SaveEmailSettings = SaveEmailSettings;
        $scope.setting;
        vm.invoice_templates = [];
        vm.fabDirections = ['up', 'down', 'left', 'right'];
        vm.fabDirection = vm.fabDirections[2];
        vm.fabAnimations = ['md-fling', 'md-scale'];
        vm.fabAnimation = vm.fabAnimations[1];
        vm.fabStatuses = [false, true];
        vm.fabStatus = false;
        vm.template_color = "";
        vm.readonly = false;
        $scope.selectedtemplate;
        $scope.email_temp = {};

        $rootScope.selectedTemplate;
        $rootScope.selectedTemplateemail;
        $rootScope.StatusTempID = 1;

        $scope.socialOption = [{
                value: 'facebook',
                name: 'Facebook',
                image: 'assets/images/social/facebook.png'
            },
            {
                value: 'googlemap',
                name: 'Google Maps',
                image: 'assets/images/social/googlemap.png'
            },
            {
                value: 'yelp',
                name: 'Yelp',
                image: 'assets/images/social/yelp.png'
            },
            {
                value: 'thumbtack',
                name: 'Thumbtack',
                image: 'assets/images/social/thumbtack.png'
            },
            {
                value: 'trip_advisor',
                name: 'Trip Advisor',
                image: 'assets/images/social/trip_advisor.png'
            },
            {
                value: 'amazon',
                name: 'Amazon',
                image: 'assets/images/social/amazon.png'
            },
            {
                value: 'airbnb',
                name: 'Airbnb',
                image: 'assets/images/social/airbnb.png'
            },
            {
                value: 'kudzu',
                name: 'Kudzu',
                image: 'assets/images/social/kudzu.png'
            },
            {
                value: 'capterra',
                name: 'Capterra',
                image: 'assets/images/social/capterra.png'
            },
            {
                value: 'homeadvisor',
                name: 'Home Advisor',
                image: 'assets/images/social/homeadvisor.png'
            },
            {
                value: 'angieslist',
                name: "Angie's List",
                image: 'assets/images/social/angies-list.png'
            },
            {
                value: 'bbb',
                name: 'Better Business Bureau',
                image: 'assets/images/social/bbb.png'
            }
        ];


        //getCompanyInfo();
        getSettings();





        vm.palettes = triTheming.palettes;
        $scope.colourRGBA = function (value) {
            var rgba = triTheming.rgba(value);
            return {
                'background-color': rgba
            };
        }
        $scope.setTemplateTheme = function (ev, name, palette, template_id) {
            $scope.setButtonColor(name);
            sessionStorage.setItem("template_color", name);
            $scope.setTemplateDefault(ev, template_id);

        }


        $scope.validateChip = function ($chip, type) {
            //console.log("i am call");
            if (!$chip) return;
            // check if the current string length is greater than or equal to a character limit.
            //console.log($chip+'-'+type);
            if (type == "bcc") {
                if (angular.isArray($scope.setting.InvoiceContacts.cc_email)) {

                    if (($scope.setting.InvoiceContacts.cc_email.indexOf($chip) >= 0) || ($scope.setting.InvoiceContacts.sender_email.indexOf($chip) >= 0)) {
                        Clique.showToast('Email already defined', 'bottom right', 'error');
                        $scope.setting.InvoiceContacts.bcc_email.pop();
                    }
                }
            } else if (type == "cc") {
                if (angular.isArray($scope.setting.InvoiceContacts.bcc_email)) {

                    if (($scope.setting.InvoiceContacts.bcc_email.indexOf($chip) >= 0) || ($scope.setting.InvoiceContacts.sender_email.indexOf($chip) >= 0)) {
                        Clique.showToast('Email already defined', 'bottom right', 'error');
                        $scope.setting.InvoiceContacts.cc_email.pop();
                    }
                }
            }

            var reg = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
            if (!reg.test($chip)) {

                if (type == "bcc") {

                    $scope.setting.InvoiceContacts.bcc_email.pop();
                }
                if (type == "cc") {
                    $scope.setting.InvoiceContacts.cc_email.pop();
                }
            }
        }

        function getSettings() {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.setting = response.data;
                    console.log('TCL: $scope.setting', $scope.setting)
                    sessionStorage.setItem("template_color", $scope.setting.InvoiceTemplateColor);
                    vm.template_color = $scope.setting.InvoiceTemplateColor;
                    $scope.$broadcast("invoice-preview-event");
                    $scope.setButtonColor($scope.setting.InvoiceTemplateColor);
                    getInvoiceTemplates();
                } else {}
            });
        }
        $scope.myClassObj = {}
        $scope.setButtonColor = function (colorName) {
            var palette = vm.palettes[colorName];
            var rgbObj = palette[500].value;

            var color = {
                r: rgbObj[0],
                g: rgbObj[1],
                b: rgbObj[2],
                a: 1

            };
            $scope.myClassObj.style = {
                "background-color": "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")"
            }
        }





        $scope.promise = SettingModel.GetAccount();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.account = response.data.items;
                });
            }
        });

        function saveInvoiceContactSettings() {

            // console.log($rootScope.StatusTempID)
            //Function For Json Object Update
            //  $scope.selectedtemplate;
            if (("template_email" in $scope.setting.InvoiceContacts) == true) {
                //  console.log($scope.selectedtemplate)
                //console.log($scope.setting.InvoiceContacts.template_email.length)
                if ($scope.setting.InvoiceContacts.template_email.length > 0) {

                    for (var i = 0; i < $scope.setting.InvoiceContacts.template_email.length; i++) {

                        $scope.setting.InvoiceContacts.template_email[i].isSelected = false
                        //  console.log()
                        if ($scope.selectedtemplate != null) {
                            if ($scope.selectedtemplate.id == $scope.setting.InvoiceContacts.template_email[i].id) {
                                $scope.setting.InvoiceContacts.template_email[i].name = $scope.selectedtemplate.name
                                $scope.setting.InvoiceContacts.template_email[i].subject = $scope.selectedtemplate.subject
                                $scope.setting.InvoiceContacts.template_email[i].body = $scope.selectedtemplate.body
                                $scope.setting.InvoiceContacts.template_email[i].isSelected = false
                                if ($scope.selectedtemplate.isSelected === true) {
                                    $scope.setting.InvoiceContacts.template_email[i].isSelected = true
                                } else {
                                    $scope.setting.InvoiceContacts.template_email[i].isSelected = false
                                }
                            }
                        } else {

                        }

                    }
                } else {

                    $scope.Defaulttemplate = {}
                    $scope.Defaulttemplate.id = 1
                    $scope.Defaulttemplate.name = "Default"
                    $scope.Defaulttemplate.subject = "Invoice"
                    $scope.Defaulttemplate.body = "To Our Valued Customer, <br><p> Your invoice <invoice_number> dated <date> is attached. You will receive your shipment in 2-3 business days. YOUR ORDER MAY ARRIVE IN MULTIPLE SHIPMENTS. Please check your order carefully and notify us within 48 hours of delivery if there are any discrepancies.</p> <br> Thank you for shopping with us. <br> Sincerely, <br> <company_name> <br> <company_phone> <br> <company_weburl> <br> 888-656-8055 <br>"
                    $scope.Defaulttemplate.isSelected = true
                    $scope.setting.InvoiceContacts.template_email.push($scope.Defaulttemplate);
                    // console.log($scope.Defaulttemplate);

                }
            } else {

                var template_email = []
                $scope.Defaulttemplate = {}
                $scope.Defaulttemplate.id = 1
                $scope.Defaulttemplate.name = "Default"
                $scope.Defaulttemplate.subject = "Invoice"
                $scope.Defaulttemplate.body = "To Our Valued Customer, <br><p> Your invoice <invoice_number> dated <date> is attached. You will receive your shipment in 2-3 business days. YOUR ORDER MAY ARRIVE IN MULTIPLE SHIPMENTS. Please check your order carefully and notify us within 48 hours of delivery if there are any discrepancies.</p> <br> Thank you for shopping with us. <br> Sincerely, <br> <company_name> <br> <company_phone> <br> <company_weburl> <br> 888-656-8055 <br>"
                $scope.Defaulttemplate.isSelected = true

                template_email = $scope.Defaulttemplate


                $scope.setting.InvoiceContacts.template_email = []
                $scope.setting.InvoiceContacts.template_email.push($scope.Defaulttemplate)

            }
            //
            var params = {
                Setting: {
                    InvoiceContacts: $scope.setting.InvoiceContacts,
                    Feedback: $scope.setting.Feedback,
                    IsDefaultTemplate: $scope.setting.IsDefaultTemplate,
                    ShowConfirmationDialog: $scope.setting.ShowConfirmationDialog,
                    InvoiceReceiptDialog: $scope.setting.InvoiceReceiptDialog,
                    EmailReceiptDialog: $scope.setting.EmailReceiptDialog,
                    DepositAccountId: parseInt($scope.setting.DepositAccountId),
                    InvoiceTemplateId: $scope.setting.InvoiceTemplateId,
                    InvoiceTemplateColor: $scope.setting.InvoiceTemplateColor
                }
            };


            $scope.promise = SettingModel.SaveInvoiceContactSettings(params);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    if ($rootScope.StatusTempID == 79) {
                        //     console.log("i am at 79")
                        Clique.showToast('Template Updated successfully', 'bottom right', 'success');
                        $rootScope.StatusTempID = 1;
                    } else {
                        // console.log("i am at 1")
                        Clique.showToast('Settings Updated successfully', 'bottom right', 'success');
                    }
                } else {
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                }
            });
            $window.location.reload();

        }


        /*Invoice Templates*/

        $scope.showTemplatePreview = function (ev, templateUrl) {
            $rootScope.selectedTemplate = templateUrl;
            $mdDialog.show({
                    controller: PreviewTemplateController,
                    templateUrl: 'app/modules/settings/invoice_preview.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });


        };

        function getInvoiceTemplates() {

            $scope.promise = SettingModel.GetInvoiceTemplates();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    vm.invoiceTemplates = response.data;
                } else {}
            });
        }

        $scope.setTemplateDefault = function (ev, templateId) {

            var template_color = "cyan";
            if (sessionStorage.getItem("template_color") != null) {
                template_color = sessionStorage.getItem("template_color");
            }
            $scope.setting.InvoiceTemplateId = templateId;
            $scope.setting.InvoiceTemplateColor = template_color;
            $rootScope.StatusTempID = 79;
            $rootScope.StatusTemplate = "Template Updated Successfully"
            saveInvoiceContactSettings();


        };




        /// Multi Email Template

        $scope.AddNewTemplate = function (ev) {
            $mdDialog.show({
                controller: Controller,
                templateUrl: 'app/modules/settings/add_template.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            })


        }

        $scope.updateEmailTemplateList = function () {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.setting = response.data;


                } else {}
            });

        }

        function SaveEmailSettings() {
            //Function For Json Object Update


            //
            var params = {
                Setting: {
                    InvoiceContacts: $scope.setting.InvoiceContacts,
                    Feedback: $scope.setting.Feedback,
                    IsDefaultTemplate: $scope.setting.IsDefaultTemplate,
                    ShowConfirmationDialog: $scope.setting.ShowConfirmationDialog,
                    InvoiceReceiptDialog: $scope.setting.InvoiceReceiptDialog,
                    EmailReceiptDialog: $scope.setting.EmailReceiptDialog,
                    DepositAccountId: parseInt($scope.setting.DepositAccountId),
                    InvoiceTemplateId: $scope.setting.InvoiceTemplateId,
                    InvoiceTemplateColor: $scope.setting.InvoiceTemplateColor
                }
            };


            $scope.promise = SettingModel.SaveEmailSettings(params);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    Clique.showToast(response.statusmessage, 'bottom right', 'success');

                } else {
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                }
            });
        }

        $scope.SaveTemplateSetting = function () {
            if (("template_email" in $scope.setting.InvoiceContacts) == true) {
                $scope.emailtempid = $scope.setting.InvoiceContacts.template_email.length
                    ++$scope.emailtempid;

                $scope.emailtemplate = {
                    "id": $scope.emailtempid,
                    "name": $scope.email_temp.name,
                    "subject": $scope.email_temp.subject,
                    "body": $scope.email_temp.body,
                    "isSelected": false
                }

                $scope.setting.InvoiceContacts.template_email.push($scope.emailtemplate);
            } else {
                //   console.log("this setting")
                var template_email = []
                $scope.Defaulttemplate = {}
                $scope.Defaulttemplate.id = 1
                $scope.Defaulttemplate.name = $scope.email_temp.name
                $scope.Defaulttemplate.subject = $scope.email_temp.subject
                $scope.Defaulttemplate.body = $scope.email_temp.body
                $scope.Defaulttemplate.isSelected = true

                template_email = $scope.Defaulttemplate
                // console.log($scope.Defaulttemplate)

                $scope.setting.InvoiceContacts.template_email = []
                $scope.setting.InvoiceContacts.template_email.push($scope.Defaulttemplate)

            }
            var params = {
                Setting: {
                    InvoiceContacts: $scope.setting.InvoiceContacts,
                    Feedback: $scope.setting.Feedback,
                    IsDefaultTemplate: $scope.setting.IsDefaultTemplate,
                    ShowConfirmationDialog: $scope.setting.ShowConfirmationDialog,
                    InvoiceReceiptDialog: $scope.setting.InvoiceReceiptDialog,
                    EmailReceiptDialog: $scope.setting.EmailReceiptDialog,
                    DepositAccountId: parseInt($scope.setting.DepositAccountId),
                    InvoiceTemplateId: $scope.setting.InvoiceTemplateId,
                    InvoiceTemplateColor: $scope.setting.InvoiceTemplateColor
                }
            };

            $scope.promise = SettingModel.SaveEmailSettings(params);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    Clique.showToast("Template Added Successfully", 'bottom right', 'success');
                    //    console.log($scope.setting.InvoiceContacts.template_email);
                    $mdDialog.hide();

                } else {
                    Clique.showToast("Template Failed To Add", 'bottom right', 'error');
                }
            })
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        /// Multi Email Template

        var fileList;
        ////////////////

    }

    function PreviewTemplateController($scope, $rootScope, $mdDialog) {

        $scope.invoiceTemplateUrl = $rootScope.selectedTemplate;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    }
})();
