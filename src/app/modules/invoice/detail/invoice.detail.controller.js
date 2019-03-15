(function () {
    'use strict';
    angular
        .module('invoice')
        .controller('InvoiceDetailController', Controller)
        .controller('GridBottomSheetCtrl', GridBottomSheetCtrl)
        .controller('PaymentMethodSheetController', PaymentMethodSheetController)
        .controller('invoiceConfirmationController', invoiceConfirmationController)
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
    function Controller($scope, PermissionStore, $timeout, $interval, $q, $http, $sce, $compile, Clique, InvoiceModel, SettingModel, $mdDialog, $mdToast, $element, $stateParams, triBreadcrumbsService, $state, $mdBottomSheet, $rootScope, $mdSidenav, $mdColorPalette, $mdColors, $mdColorUtil, triTheming, BulkPrintInvoices) {

        $scope.pdf = []
        $scope.pdf.src = "www.pdf995.com/samples/pdf.pdf";
        //screen.orientation.lock('landscape');
        var vm = this;
        vm.InvoiceStatsColumns = [{
            title: 'Date',
            field: 'date',
            sortable: false,
        }, {
            title: 'Request',
            field: 'request',
            sortable: true
        }, {
            title: 'Delivered',
            field: 'delivered',
            sortable: true
        }, {
            title: 'Opens',
            field: 'open',
            sortable: true
        }, {
            title: 'Clicks',
            field: 'clicks',
            sortable: true
        }, {
            title: 'Bounces',
            field: 'bounces',
            sortable: true
        }];


        vm.palettes = triTheming.palettes;
        vm.InvoiceStatsData = [];
        $scope.colourRGBA = function (value) {
            var rgba = triTheming.rgba(value);
            return {
                'background-color': rgba
            };
        }

        var invoiceTemplate;
        var compiledeHTML
        var invoice_id = "";
        var invoice_docnumber = "";
        $scope.invoice = "";
        $scope.settings = "";
        $scope.template_url;
        $scope.isInvoicePaid;
        $scope.displayPaidStamp = false;
        $scope.slider = 12;
        $scope.readonly = false;
        $scope.payment_methods;
        $scope.payment_default_id = 0;
        $rootScope.showInvoiceLoader = false;
        $rootScope.printProcess = false;

        if (sessionStorage.getItem('invoice_status') == 'paid') {
            $scope.isInvoicePaid = true;
        } else {
            $scope.isInvoicePaid = false;
        }
        vm.subMenu = subMenu;
        $scope.showProgress = false;
        if ($stateParams.id) {
            invoice_docnumber = $stateParams.id;
            invoice_id = sessionStorage.getItem('invoice_id')
        }
        vm.statisticsGroups = [{
            name: 'Invoice Statistics',
            stats: []
        }];
        $scope.totalRequest = 0;
        vm.pieLabels = ['Processed', 'Delivered', 'Open', 'Clicks', 'Bounces'];
        vm.pieOptions = {
            legend: {
                display: true
            },
            showTooltips: true
        };
        vm.pieData = [0, 0, 0, 0, 0];



        triBreadcrumbsService.reset();
        var breadcrumbs = [{
            active: false,
            icon: "zmdi zmdi-chart",
            name: 'Invoice #' + invoice_docnumber + "</b>",
            priority: 2,
            state: "triangular.invoice-detail",
            template: "app/triangular/components/menu/menu-item-link.tmpl.html",
            type: "link",

        }, {
            active: true,
            icon: "zmdi zmdi-chart",
            name: 'Invoices',
            priority: 1,
            state: "triangular.invoice-list-type",
            template: "app/triangular/components/menu/menu-item-link.tmpl.html",
            type: "link",

        }];
        angular.forEach(breadcrumbs, function (breadcrumb, key) {
            triBreadcrumbsService.addCrumb(breadcrumb);
        });


        vm.fabDirections = ['up', 'down', 'left', 'right'];
        vm.fabDirection = vm.fabDirections[2];
        vm.fabAnimations = ['md-fling', 'md-scale'];
        vm.fabAnimation = vm.fabAnimations[1];
        vm.fabStatuses = [false, true];
        vm.fabStatus = false;
        vm.showCustomerEmailSaveOption = true;
        vm.openSidebar = openSidebar;
        vm.template_color = "";
        vm.showInvoiceStatsProgress = true;
        getSettings();


        $scope.promise = SettingModel.GetPaymentInfo();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                if (response.data.total_count > 0) {
                    $scope.payment_methods = response.data.items;
                    $scope.payment_default_id = response.data.items[0].id;
                }

            }
        });

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

        $scope.getTemplateColor = function () {

            if (sessionStorage.getItem("template_color") != null) {
                vm.template_color = sessionStorage.getItem("template_color");
            }

        }
        $scope.isObjectEmpty = function (obj) {
            return Object.keys(obj).length === 0;
        }


        $scope.settings = {
            InvoiceContacts: {
                sender_email: '',
                sender_name: '',
                cc_email: [],
                bcc_email: [],
                to_email: [],
                save_email_erp: false,
                body: ''
            },
            subject: '',
            template_id: '',

        };

        function openSidebar(navID) {

            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    getInvoiceStatistics();
                });
        }
        $scope.setTemplateTheme = function (name, palette) {

            var templateStyle = "";
            var bg_500 = "";
            angular.forEach(palette, function (paletteInfo, palette_name) {
                var contras = paletteInfo.contrast;
                var rgbObj = paletteInfo.value;


                var color = {
                    name: palette_name,
                    r: rgbObj[0],
                    g: rgbObj[1],
                    b: rgbObj[2],
                    a: 1

                };
                if (palette_name == "500") {
                    bg_500 = "background-color:rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
                }

                var bg = ".primary-bg-" + color.name + "{" + "background-color:rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ") !important;" + "}";
                var br = ".primary-br-" + color.name + "{" + "border-color:rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ") !important;" + "}";
                var tc = ".primary-tc-" + color.name + "{" + "color:rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ") !important;" + "}";
                templateStyle += bg + br + tc;
                sessionStorage.setItem("template_color", name);
            });

            $("#invoice_template style").append(templateStyle);
            $scope.setButtonColor(name);

        }

        function getSettings() {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.settings = response.data;
                    // // console.log('TCL: $scope.settings', $scope.settings)
                    var customer_email = sessionStorage.getItem('customer_email');
                    $scope.settings.InvoiceContacts.to_email = [];
                    $scope.settings.InvoiceContacts.save_email_erp = false;
                    $scope.settings.title = "Send Invoice";
                    if (customer_email != "") {
                        $scope.settings.InvoiceContacts.to_email.push(customer_email);
                    } else {
                        vm.showCustomerEmailSaveOption = true;
                    }

                    sessionStorage.setItem("invoice_template_id", $scope.settings.InvoiceTemplateId);
                    sessionStorage.setItem("template_color", $scope.settings.InvoiceTemplateColor);
                    vm.template_color = $scope.settings.InvoiceTemplateColor;
                    $scope.IsDefaultTemplate = $scope.settings.IsDefaultTemplate;
                    $scope.$broadcast("invoice-preview-event");
                    $scope.setButtonColor($scope.settings.InvoiceTemplateColor);



                } else {}
            });
        }

        function getInvoiceStatistics() {

            var totalRequest = 0;
            var totalProcessed = 0;
            var totalDelivered = 0;
            var totalOpens = 0;
            var totalClicks = 0;
            var totalBounces = 0;
            var invoice_issuedate = sessionStorage.getItem("invoice_issuedate");
            var invoice_id = sessionStorage.getItem("invoice_id");
            vm.query = {
                invoice_issuedate: invoice_issuedate,
                invoice_id: invoice_id,
            };
            $scope.promise = InvoiceModel.GetInvoiceStatistics(vm.query);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    if (Object.keys(response.data).length > 0) {

                        angular.forEach(response.data, function (statsData, key) {

                            angular.forEach(statsData, function (statsInfo, date) {
                                var statsObj = {
                                    date: date,
                                    request: statsInfo.requests,
                                    delivered: statsInfo.delivered,
                                    open: statsInfo.opens,
                                    clicks: statsInfo.clicks,
                                    bounces: statsInfo.bounces,
                                };
                                vm.InvoiceStatsData.push(statsObj);

                                totalRequest += statsInfo.requests
                                totalProcessed += statsInfo.processed
                                totalDelivered += statsInfo.delivered
                                totalOpens += statsInfo.opens
                                totalClicks += statsInfo.clicks
                                totalBounces += statsInfo.bounces
                            });
                        });
                        $scope.totalRequest = totalRequest;
                        vm.pieData = [totalProcessed, totalDelivered, totalOpens, totalClicks, totalBounces];
                        var statsArray = [];
                        angular.forEach(vm.pieLabels, function (lblName, lblKey) {
                            var stats = {
                                title: lblName,
                                value: vm.pieData[lblKey]
                            };
                            statsArray.push(stats);
                        });
                        vm.statisticsGroups[0].stats = statsArray;

                    }
                } else {}
                vm.showInvoiceStatsProgress = false;
            });
        }
        $scope.src = null
        $scope.$on('invoice-preview-event', function (event) {
            console.log('TCL: PermissionStore', PermissionStore)

            // // console.log('TCL: $scope.IsDefaultTemplate', $scope.IsDefaultTemplate)
            $scope.showProgress = true;
            $scope.fabMenu = false;
            $scope.src = null
            var url = Clique.getServiceUrl()
            // // console.log('TCL: url', url)
            // $http.get(url + "/dashboardtest/?invoice_id=" + 23, {
            if ($scope.IsDefaultTemplate == true) {
                $http.get(url + "/erp/quickbooks/invoice/preview/?invoice_id=" + invoice_id, {
                        responseType: 'arraybuffer'
                    })
                    .then(function (response) {
                        // // console.log('TCL: response', response)
                        $scope.src = new Uint8Array(response.data);
                        // // console.log('TCL: $scope.src', $scope.src)
                        $scope.showProgress = false;
                        $scope.displayPaidStamp = true
                        if ($scope.isInvoicePaid == false) {
                            $scope.fabMenu = true;
                        }
                    });
            } else {
                $scope.promise = InvoiceModel.GetInvoicePreviewById(invoice_id);
                $scope.promise.then(function (response) {
                    invoiceTemplate = response;
                    // // console.log('TCL: getInvoiceStatistics -> response', response)
                    $("#invoice_template").html('');
                    $("#invoice_template").append(response);
                    $scope.showProgress = false;
                    $scope.displayPaidStamp = true;
                    if ($scope.isInvoicePaid == false) {
                        $scope.fabMenu = true;
                    }
                });
            }
        });

        $scope.buttonPermissions = {
            invoice_addnew: false,
            invoice_search: false,
            invoice_print: false,
            invoice_send: false,
            invoice_payment: false,
            invoice_link: false,
            invoice_recurring: false,

            invoice_color: false,
            invoice_statistics: false,
            invoice_paymentmethod: false,
            invoice_templates: false,

        };
        // var permission_arr = ['addnew', 'search', 'print', 'send', 'payment', 'link', 'recurring'];
        var permission_arr = [
            "addnew",
            "listing",
            "send",
            "sendbulk",
            "link",
            "payment",
            "search",
            "statistics",
            "detail",
            "templates",
            "paymentmethod",
            "color"
        ];

        angular.forEach(permission_arr, function (permission_name, key) {
            if (PermissionStore.getPermissionDefinition('invoice-' + permission_name) != undefined) {
                $scope.buttonPermissions['invoice_' + permission_name] = true;
            } else {
                $scope.buttonPermissions['invoice_' + permission_name] = false;
            }

        });


        function subMenu(type) {
            switch (type) {
                case "email":
                    var showConfirmation = $scope.settings.ShowConfirmationDialog;
                    var total_to_address = $scope.settings.InvoiceContacts.to_email.length;
                    //showConfirmation=false;
                    if (showConfirmation == true || total_to_address == 0) {
                        $scope.showSendConfirmationDialog();
                    } else {
                        $scope.sendInvoice();
                    }
                    break;


                case "collect_payment":
                    $scope.collectPayment();
                    break;

                case "recuring":
                    break;

                case "invoice_template":
                    $scope.showGridBottomSheet();
                    break;
                case "invoice_print":
                    $scope.printInvoice();
                    break;
                case "payment_methods":
                    $scope.showGridPaymentMethods();
                    break;

                case "invoice_stats":
                    openSidebar('statistics')
                    break;

            }

        }

        $scope.printPDFInvoice = function () {
            $rootScope.printProcess = true;

            var url = Clique.getServiceUrl()
            // var invoice_id = $scope.invoiceSelection[0]
            $http.get(url + "/erp/quickbooks/invoice/preview/?invoice_id=" + invoice_id, {
                    responseType: 'arraybuffer'
                })
                .then(function (response) {

                    var pdfFile = new Blob([response.data], {
                        type: "application/pdf"
                    });
                    var pdfUrl = URL.createObjectURL(pdfFile);
                    //window.open(pdfUrl);
                    printJS(pdfUrl);
                    // var printwWindow = $window.open(pdfUrl);
                    // printwWindow.print();
                    $rootScope.printProcess = false;

                });

        }
        $scope.collectPayment = function () {
            $rootScope.dataObj = [];
            var invoice_detail = sessionStorage.getItem("invoice_detail");
            if (invoice_detail != null || invoice_detail != undefined) {
                $rootScope.dataObj.push(JSON.parse(invoice_detail));
                $state.go("triangular.invoice-payment");
            } else {
                alert("Error: Invoice Detail not found");
            }


        }
        $scope.printInvoice = function () {
            $rootScope.printProcess = true;
            var invoice_selection = [];
            var invoice_id = sessionStorage.getItem("invoice_id");
            invoice_selection.push(invoice_id);
            BulkPrintInvoices.printInvoice(invoice_selection);
        }

        $scope.SelectedTemplateValue = function (value) {
            $rootScope.email_template = value;
            //  console.log($rootScope.email_template);
        }
        $scope.sendInvoice = function () {
            var showConfirmation = $scope.settings.ShowConfirmationDialog;
            // console.log('sendInvoice', $rootScope.email_template)
            if ($rootScope.email_template == undefined) {
                $rootScope.email_template = {}
                $rootScope.email_template.name = ''
                $rootScope.email_template.subject = ''
                $rootScope.email_template.body = ''
            }
            $scope.selectedTemplate;

            // console.log($rootScope.email_template)
            $scope.settings.showConfirmationDialog

            $scope.showProgress = true;
            if (("template_email" in $scope.settings.InvoiceContacts) == true) {
                //  console.log("test");
                if ($scope.settings.InvoiceContacts.template_email.length > 0) {
                    for (var i = 0; i < $scope.settings.InvoiceContacts.template_email.length; i++) {
                        //         console.log($scope.settings.InvoiceContacts.template_email)
                        if ($scope.settings.InvoiceContacts.template_email[i].isSelected == true && $rootScope.email_template.id == $scope.settings.InvoiceContacts.template_email.id) {
                            //  console.log($scope.settings.InvoiceContacts.template_email)
                            $rootScope.email_template = $scope.settings.InvoiceContacts.template_email
                            $rootScope.email_template.name = $scope.settings.InvoiceContacts.template_email[i].name
                            $rootScope.email_template.subject = $scope.settings.InvoiceContacts.template_email[i].subject
                            $rootScope.email_template.body = $scope.settings.InvoiceContacts.template_email[i].body

                        }

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



            //console.log($scope.disabledSubmitButton);

            var invoice_template_id = 1;
            var customer_id = 0;
            if (sessionStorage.getItem("invoice_template_id") != null) {
                invoice_template_id = sessionStorage.getItem("invoice_template_id");
            }
            var invoice_detail = sessionStorage.getItem("invoice_detail");
            if (invoice_detail != null || invoice_detail != undefined) {
                invoice_detail = JSON.parse(invoice_detail);
                customer_id = parseInt(invoice_detail.CustomerRef.value);
            }
            $scope.getTemplateColor();

            var invoice = {
                to: $scope.settings.InvoiceContacts.to_email,
                cc: $scope.settings.InvoiceContacts.cc_email,
                bcc: $scope.settings.InvoiceContacts.bcc_email,
                sender_name: $scope.settings.InvoiceContacts.sender_name,
                sender_email: $scope.settings.InvoiceContacts.sender_email,
                subject: $rootScope.email_template.subject,
                body: $rootScope.email_template.body,
                invoice_id: invoice_id,
                customer_id: customer_id,
                invoice_template_id: invoice_template_id,
                color: vm.template_color,
                save_email_erp: $scope.settings.InvoiceContacts.save_email_erp,
                payment_method_id: $scope.payment_default_id
            };
            vm.promise = InvoiceModel.SendInvoice(invoice);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {

                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    $state.go('triangular.invoice-list');
                    $scope.showProgress = false;


                } else {

                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    $scope.showProgress = false;
                    $mdDialog.hide();


                }
                $scope.fabMenu = true;

            });

        }


        $scope.showRecuringDialog = function () {
            $mdDialog.show({
                    controller: 'RecuringController',
                    templateUrl: 'app/modules/invoice/recuringDialog.html',
                    parent: angular.element(document.body),
                    scope: $scope.$new(),
                    //targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function (answer) {

                }, function () {

                });
        };


        $scope.showSendConfirmationDialog = function () {
            $mdDialog.show({
                    controller: 'invoiceConfirmationController',
                    templateUrl: 'app/modules/invoice/detail/sendConfirmationDialog.html',
                    parent: angular.element(document.body),
                    scope: $scope.$new(),
                    //targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function (answer) {

                }, function () {

                });
        };
        $scope.showGridBottomSheet = function () {
            $scope.alert = '';
            $mdBottomSheet.show({
                templateUrl: 'app/modules/invoice/detail/bottom-sheet-grid-template.html',
                controller: 'GridBottomSheetCtrl',
                clickOutsideToClose: true,
                parent: angular.element(document.getElementById('invoice_detail_layout')),
            }).then(function (clickedItem) {});
        };

        $scope.showGridPaymentMethods = function () {

            $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    controller: 'PaymentMethodSheetController',
                    templateUrl: 'app/modules/invoice/detail/payment_method_dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: null,
                    clickOutsideToClose: true,
                    fullscreen: true
                })
                .then(function (answer) {}, function () {});
        };
    }

    function GridBottomSheetCtrl($window, $rootScope, $scope, $mdBottomSheet, SettingModel, Clique) {

        $scope.invoice_template_id = sessionStorage.getItem("invoice_template_id");
        $scope.items = [];
        for (var i = 0; i < 2; i++) {
            $scope.items.push(i);
        }
        $scope.invoice_templates = [];
        $scope.promise = SettingModel.GetInvoiceTemplates();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $scope.invoice_templates = response.data;

            } else {}

        });


        $scope.closeBottomSheet = function () {
            $mdBottomSheet.hide();
        }
        $scope.listItemClick = function (item) {
            var template_color = sessionStorage.getItem("template_color");
            var invoice_template = {
                invoice_template_id: item.id,
                template_color: template_color
            }
            sessionStorage.setItem("invoice_template_id", item.id);
            $rootScope.$broadcast("invoice-preview-event");
            //TODO
            $mdBottomSheet.hide(item);
        };
    }


    function PaymentMethodSheetController($window, $rootScope, $scope, $mdDialog, SettingModel, Clique) {


        $scope.cancel = function () {
            $mdDialog.hide();
        }
        $scope.listItemClick = function (item) {
            $scope.payment_default_id = item.id;
            $mdDialog.hide(item);
        };
    }



    function invoiceConfirmationController($timeout, $mdDialog, $filter, triSkins, $window, $rootScope, $scope, SettingModel, Clique) {

        $scope.disabledSubmitButton = false;
        $scope.showCCSIcon = 'zmdi zmdi-account-add';
        $scope.showCCS = false;

        $scope.toggleCCS = function () {
            $scope.showCCS = !$scope.showCCS;
            $scope.showCCSIcon = $scope.showCCS ? 'zmdi zmdi-account' : 'zmdi zmdi-account-add';
        }
        $scope.cancel = function () {
            $mdDialog.hide();
        }
        $scope.validateChip = function ($chip, type) {
            if (!$chip) return;
            // check if the current string length is greater than or equal to a character limit.
            var reg = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
            if (!reg.test($chip)) {
                if (type == "bcc") {
                    $scope.settings.InvoiceContacts.bcc_email.pop();
                }
                if (type == "cc") {
                    $scope.settings.InvoiceContacts.cc_email.pop();
                }
                if (type == "to") {
                    $scope.settings.InvoiceContacts.to_email.pop();
                }
            }
            if (type == "to") {
                if ($scope.settings.InvoiceContacts.to_email.length == 0) {
                    $scope.disabledSubmitButton = true;
                } else {
                    $scope.disabledSubmitButton = false;
                }
            }
        }
        $scope.submit = function () {
            $scope.sendInvoice();
            $scope.disabledSubmitButton = true;
        }
    }

    function RecuringController($timeout, $mdDialog, $filter, triSkins, $window, $rootScope, $scope, SettingModel, Clique) {

        //var vm=this;
        $scope.disabledSubmitButton = false;
        $scope.showCCSIcon = 'zmdi zmdi-account-add';
        $scope.showCCS = false;

        $scope.toggleCCS = function () {
            $scope.showCCS = !$scope.showCCS;
            $scope.showCCSIcon = $scope.showCCS ? 'zmdi zmdi-account' : 'zmdi zmdi-account-add';
        }
        $scope.cancel = function () {
            $mdDialog.hide();
        }
        $scope.submit = function () {
            $scope.sendInvoice();
        }
    }
})();
