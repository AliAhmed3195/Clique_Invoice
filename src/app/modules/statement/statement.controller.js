(function () {
    'use strict';

    angular
        .module('statement')
        .controller('StatementController', StatementController)
        .controller('emailConfirmationDialogController', emailConfirmationDialogController)
        .controller('StatementPreviewController', StatementPreviewController)
        .controller('StatementDetailController', StatementDetailController)



        .filter('groupBy', function () {
            return _.memoize(function (items, field) {
                return _.groupBy(items, field);
            });
        });

    function StatementController($scope, $rootScope, $timeout, $interval, $q, $http, $compile, Clique, InvoiceModel, SettingModel, RecurringModel, $mdDialog, $mdToast, $element, $state, triTheming, $mdSidenav, $filter, PermissionStore) {
        debugger;
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth();


        var vm = this;

        vm.getInvoices = getInvoices;
        vm.MultipleSelection = MultipleSelection;
        vm.showSendConfirmationDialog = showSendConfirmationDialog;
        vm.showStatement = showStatement;
        vm.FilterStatement = FilterStatement;
        vm.openSidebar = openSidebar;
        vm.openStatementDetail = openStatementDetail;
        vm.InvoiceData = "";
        vm.customerInvoices = [];
        vm.isStatementLoaded = true;
        $scope.ShowGrid = false;
        $scope.totalCheckedAmount = 0;


        vm.query = {
            limit: 10,
            order: 'Name',
            page: 1,
            pageSelect: true,
            from: '',
            to: ''
        };

        $scope.options = {
            rowSelection: true,
            multiSelect: true,
            autoSelect: true,
            decapitate: false,
            largeEditDialog: false,
            boundaryLinks: false,
            limitSelect: true,
            pageSelect: true
        };


        var sessionFromDate;
        var sessionToDate;

        if (typeof (Storage) !== undefined) {
            sessionFromDate = sessionStorage.getItem('statementstart');
            sessionToDate = sessionStorage.getItem('statementend');
        }

        $scope.from = (sessionFromDate != undefined ? new Date(sessionFromDate) : new Date(y, m, 1));
        $scope.to = sessionToDate != undefined ? new Date(sessionToDate) : new Date(y, m + 1, 0);




        //$scope.from = new Date(y, m, 1);
        //$scope.to =  new Date(y, m + 1, 0);
        $scope.CustomerSelection = [];
        $scope.settings = "";
        $scope.buttonPermissions = {
            statement_listing: false,
            statement_view: false,
            statement_print: false,
            statement_send: false,
            statement_download: false,
        };

        var permission_arr = ['listing', 'send', 'view', 'download', 'print'];
        angular.forEach(permission_arr, function (permission_name, key) {
            if (PermissionStore.getPermissionDefinition('statement-' + permission_name) != undefined) {
                $scope.buttonPermissions['statement_' + permission_name] = true;
            } else {
                $scope.buttonPermissions['statement_' + permission_name] = false;
            }

        });


        getInvoices();
        getSettings();

        vm.openStatementDetail = openStatementDetail;


        function MultipleSelection() {
            //alert('hello');
            $scope.selectedCustomerData = [];
            //$scope.CustomerSelection = "";
            if (($scope.CustomerSelection.length > 0)) {
                angular.forEach($scope.CustomerSelection, function (customer_id, key) {
                    var filteredCustomer = $filter('filter')(vm.customerInvoices, {
                        'Id': customer_id
                    }, true)[0];
                    $scope.selectedCustomerData.push(filteredCustomer);
                });
                //sumOpenBalance();
                //console.log($scope.CustomerSelection.length);

            }

        }

        function FilterStatement() {
            getInvoices();
        }

        function getInvoices() {
            vm.InvoiceData = [];
            vm.customerInvoices = [];
            vm.query.from = $filter('date')($scope.from, "yyyy-MM-dd");
            vm.query.to = $filter('date')($scope.to, "yyyy-MM-dd");

            sessionStorage.setItem('statementstart', vm.query.from);
            sessionStorage.setItem('statementend', vm.query.to);


            vm.promise = InvoiceModel.GetOpenBalance(vm.query);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {

                    vm.InvoiceData = response.data.items;


                    //Group By Customer Invoices with Customer Id
                    //var groupInvoice=$filter('groupBy')(vm.InvoiceData, "CustomerRef.value");
                    var groupInvoice = vm.InvoiceData;

                    //Below Code is used to get usefull information only
                    //Looping the Grouped Invoices
                    //console.log(JSON.stringify(groupInvoice));

                    angular.forEach(groupInvoice, function (invoices, key) {

                        //Calculate Open Balance for Each Customer
                        /*var TotalBalance=invoices
                        .map(function(x) { return x.BalanceWithJobs; });
                        .reduce(function(a, b) { return a + b; });*/

                        var TotalBalance = invoices.BalanceWithJobs;

                        //console.log(TotalBalance);

                        //Aggregate Invoice Ids in Aray
                        /*var InvoiceArr = invoices.map(function(elem) {
                            return elem.Id;
                        }); */

                        var InvoiceArr = invoices.InvoiceId;

                        //////////////////////////////////////////////
                        // Check Bill Email Key exists or not
                        if ((invoices.PrimaryEmailAddr != null)) {
                            invoices.PrimaryEmailAddr.Address = invoices.PrimaryEmailAddr.Address;
                        } else {
                            invoices.PrimaryEmailAddr = {
                                Address: ""
                            }
                        }

                        //Make the Dictionary of Customer Invoice
                        var info = {
                            Id: invoices.Id,
                            Name: invoices.DisplayName,
                            Email: invoices.PrimaryEmailAddr.Address,
                            OpenBalance: TotalBalance,
                            Invoices: InvoiceArr,
                        };
                        //Push Usefully information Into New Array
                        vm.customerInvoices.push(info);
                    });
                    vm.isStatementLoaded = false;
                    $timeout(function () {
                        $scope.ShowGrid = true;
                    }, 1000);


                }
            });
        }

        function getSettings() {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.settings = response.data;
                    //$scope.settings.title="Send Statement";
                    $scope.settings.InvoiceContacts.to_email = [];
                }
            });
        }

        function showSendConfirmationDialog() {
            $scope.settings.InvoiceContacts.to_email = [];
            $scope.totalCheckedAmount = 0;
            if ($scope.selectedCustomerData.length > 0) {
                console.log($scope.selectedCustomerData.length);
                angular.forEach($scope.selectedCustomerData, function (customerInfo, key) {
                    //console.log(customerInfo.Email);
                    if ((customerInfo.Email != null) && (customerInfo.Email != '')) {
                        var customerEmail = customerInfo.Email.split(',');
                        var i;
                        for (i = 0; i < customerEmail.length; i++) {
                            if ($scope.settings.InvoiceContacts.to_email.indexOf(customerEmail[i]) == -1) {
                                $scope.settings.InvoiceContacts.to_email.push(customerEmail[i]);
                            }
                        }
                    }
                    // total sum for checked statement
                    $scope.totalCheckedAmount = $scope.totalCheckedAmount + parseFloat(customerInfo.OpenBalance);
                });
                $scope.totalCheckedAmount = $filter('currency')($scope.totalCheckedAmount)
                var amountText = " (Total Amount: " + $scope.totalCheckedAmount + ")";
                $scope.settings.title = "Send Statement" + amountText;
            }
            $mdDialog.show({
                    controller: 'emailConfirmationDialogController',
                    templateUrl: 'app/modules/statement/sendConfirmationDialog.html',
                    parent: angular.element(document.body),
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true
                })
                .then(function (answer) {

                }, function () {

                });
        };

        $scope.sendStatement = function () {
            $scope.showProgress = true;
            var customers = [];
            if ($scope.selectedCustomerData.length > 0) {
                angular.forEach($scope.selectedCustomerData, function (customerInfo, key) {
                    var info = {
                        id: customerInfo.Id,
                        email: customerInfo.Email,
                        invoices: customerInfo.Invoices,
                        email_body: "",
                        statement: {
                            start_date: $filter('date')($scope.from, "yyyy-MM-dd"),
                            end_date: $filter('date')($scope.to, "yyyy-MM-dd")
                        }
                    };
                    customers.push(info);

                });
            }
            var params = {
                cc: $scope.settings.InvoiceContacts.cc_email,
                bcc: $scope.settings.InvoiceContacts.bcc_email,
                sender_name: $scope.settings.InvoiceContacts.sender_name,
                sender_email: $scope.settings.InvoiceContacts.sender_email,
                body: $scope.settings.InvoiceContacts.body,
                customers: customers
            };
            vm.promise = InvoiceModel.SendStatement(params);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {

                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    $scope.showProgress = false;
                    $mdDialog.hide();
                    $state.reload();
                } else {

                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    $scope.showProgress = false;
                    $mdDialog.hide();
                }
            });
        }

        function showStatement(customer) {

            $mdDialog.show({
                    locals: {
                        customerData: customer,
                    },
                    controller: 'StatementPreviewController',
                    templateUrl: 'app/modules/statement/statement.preview.tmpl.html',
                    parent: angular.element(document.body),
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true
                })
                .then(function (answer) {

                }, function () {

                });
        };

        function openStatementDetail(customer) {

            sessionStorage.setItem('customer_statement_info', JSON.stringify(customer));
            $state.go('triangular.statement-detail', {
                id: customer.Id,
            });

        }

        function openSidebar(navID) {

            $mdSidenav(navID)
                .toggle()
                .then(function () {});
        }

        $scope.resetForm = function () {
            var date = new Date(),
                y = date.getFullYear(),
                m = date.getMonth();
            $scope.from = new Date(y, m, 1);
            $scope.to = new Date(y, m + 1, 0)
            vm.query.from = $filter('date')($scope.from, "yyyy-MM-dd");
            vm.query.to = $filter('date')($scope.to, "yyyy-MM-dd");
        }

        $scope.logPagination = function (page, limit) {
            //console.log('page: ', page);
            //console.log('limit: ', limit);
            $scope.CustomerSelection = [];
        }


    }

    function emailConfirmationDialogController($timeout, $mdDialog, $filter, triSkins, $window, $rootScope, $scope, SettingModel, Clique) {

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
            //alert('sdsd');
            $scope.sendStatement();
            $scope.disabledSubmitButton = true;
        }
    }

    function StatementDetailController(InvoiceModel, $timeout, $mdDialog, $filter, triSkins, $window, $rootScope, $scope, $state, SettingModel, Clique, printer, $http, $cookies, $stateParams) {

        $scope.showProgress = true;
        $scope.downloadProgress = false;
        var statementTemplate;
        var stvm = this;
        var vm = this;
        $scope.from = sessionStorage.getItem("statementstart");
        $scope.to = sessionStorage.getItem("statementend");

        //var start_date=$filter('date')($scope.from, "yyyy-MM-dd");
        //var end_date=$filter('date')($scope.to, "yyyy-MM-dd");
        var start_date = $scope.from;
        var end_date = $scope.to;
        var customer_id = $stateParams.id;



        getSettings();
        stvm.params = "customer=" + customer_id + "&start_date=" + start_date + "&end_date=" + end_date;
        $scope.promise = InvoiceModel.GetStatementPreview(stvm.params + "&file_type=html");
        $scope.promise.then(function (response) {
            statementTemplate = response;
            $("#invoice_template").html('');
            $("#invoice_template").append(response);

            $timeout(function () {
                $scope.showProgress = false;
            }, 1000)

        });

        $scope.sendStatement = function () {

            $scope.showProgress = true;
            var customers = [];
            var customerEmailList = '';
            if ($scope.selectedCustomerData.length > 0) {

                angular.forEach($scope.selectedCustomerData, function (customerInfo, key) {

                    customerInfo = JSON.parse(customerInfo)
                    // merge emil merchant enter itself
                    var i;
                    for (i = 0; i < $scope.settings.InvoiceContacts.to_email.length; i++) {
                        customerEmailList = customerEmailList + $scope.settings.InvoiceContacts.to_email[i] + ",";
                    }
                    customerEmailList = customerEmailList.replace(/,(\s+)?$/, '');
                    var info = {
                        id: customerInfo.Id,
                        //email:customerInfo.Email,
                        email: customerEmailList,
                        invoices: customerInfo.Invoices,
                        email_body: "",
                        statement: {
                            start_date: $filter('date')($scope.from, "yyyy-MM-dd"),
                            end_date: $filter('date')($scope.to, "yyyy-MM-dd")
                        }
                    };
                    customers.push(info);

                });
            }
            var params = {
                cc: $scope.settings.InvoiceContacts.cc_email,
                bcc: $scope.settings.InvoiceContacts.bcc_email,
                sender_name: $scope.settings.InvoiceContacts.sender_name,
                sender_email: $scope.settings.InvoiceContacts.sender_email,
                body: $scope.settings.InvoiceContacts.body,
                customers: customers
            };
            vm.promise = InvoiceModel.SendStatement(params);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {

                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    $scope.showProgress = false;
                    $mdDialog.hide();
                    $state.reload();
                } else {
                    //console.log("hello");
                    Clique.showToast("hi there", 'bottom right', 'error');
                    //$scope.showProgress = false;
                    //$mdDialog.hide();
                }
            });
        }

        $scope.cancel = function () {
            $mdDialog.hide();
        }
        $scope.print = function () {
            var contents = document.getElementById("invoice_template").innerHTML;
            var frame1 = document.createElement('iframe');
            frame1.name = "frame3";
            frame1.style.position = "absolute";
            frame1.style.top = "-1000000px";
            document.body.appendChild(frame1);
            var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
            frameDoc.document.open();
            frameDoc.document.write('<html><head> <style>md-dialog-actions{display:none}.invoice-box{max-width:800px;margin:auto;padding:30px;border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,.15);font-size:16px;line-height:24px;color:#555}.invoice-box table{width:100%;line-height:inherit;text-align:left}.invoice-box table td{padding:5px;vertical-align:top}.invoice-box table tr td:nth-child(2){text-align:right}.invoice-box table tr.top table td{padding-bottom:20px}.invoice-box table tr.top table td.title{font-size:45px;line-height:45px;color:#333}.invoice-box table tr.information table td{padding-bottom:40px}.invoice-box table tr.heading td{background:#eee;border-bottom:1px solid #ddd;font-weight:700}.invoice-box table tr.details td{padding-bottom:20px}.invoice-box table tr.item td{border-bottom:1px solid #eee}.invoice-box table tr.item.last td{border-bottom:none}.invoice-box table tr.total td:nth-child(2){border-top:2px solid #eee;font-weight:700} </style>');
            frameDoc.document.write('</head><body>');
            frameDoc.document.write(contents);
            frameDoc.document.write('</body></html>');
            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame3"].focus();
                window.frames["frame3"].print();
                document.body.removeChild(frame1);
            }, 500);
            return false;

        }
        $scope.download = function () {
            $scope.downloadProgress = true;
            var serviceurl = Clique.getServiceUrl();
            var endPoint = "/invoice/statementpreview?";

            $scope.promise = InvoiceModel.GetStatementPreview(stvm.params + "&file_type=pdf");
            $scope.promise.then(function (response) {
                if (response.status != undefined && response.status == -1) {
                    ///do nothing
                } else {

                    window.open(serviceurl + endPoint + stvm.params + "&file_type=pdf", "_self");
                    checkDownloadStatus();

                }
            });
        }

        $scope.sendEmailStatement = function () {
            var customerInfo = sessionStorage.getItem("customer_statement_info");

            $scope.selectedCustomerData = [];
            $scope.selectedCustomerData.push(customerInfo);
            customerInfo = JSON.parse(customerInfo);

            if ((customerInfo.Email != null) && (customerInfo.Email != '')) {
                var customerEmail = customerInfo.Email.split(',');
                var i;
                for (i = 0; i < customerEmail.length; i++) {
                    if ($scope.settings.InvoiceContacts.to_email.indexOf(customerEmail[i]) == -1) {
                        $scope.settings.InvoiceContacts.to_email.push(customerEmail[i]);
                    }
                }
            }
            /*if($scope.settings.InvoiceContacts.to_email.indexOf(customerInfo.Email) == -1){
                  $scope.settings.InvoiceContacts.to_email.push(customerInfo.Email);
             }*/
            //console.log($scope.settings.InvoiceContacts.to_email+"---"+customerInfo.Email);
            $mdDialog.show({
                    controller: 'emailConfirmationDialogController',
                    templateUrl: 'app/modules/statement/sendConfirmationDialog.html',
                    parent: angular.element(document.body),
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true
                })
                .then(function (answer) {

                }, function () {

                });
        };

        function checkDownloadStatus() {
            //console.log("--checkDownloadStatus---");
            var fileDownload = $cookies.get('fileDownload');
            if (fileDownload != undefined) {
                ///cookie exist;

                $scope.downloadProgress = false;
                $cookies.remove('fileDownload');
            } else {
                $timeout(function () {
                    checkDownloadStatus();
                }, 1000);
            }
        }

        function getSettings() {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.settings = response.data;
                    $scope.settings.title = "Send Statement";
                    $scope.settings.InvoiceContacts.to_email = [];
                }
            });
        }

        function downloadSuccess() {
            $scope.downloadProgress = false;
            //console.log($scope.downloadProgress);
        }

        function downloadFailed() {
            Clique.showToast("Error Downloading Statement", 'bottom right', 'success');
            $scope.downloadProgress = false;

        }

    }

    function StatementPreviewController(PermissionStore, InvoiceModel, $timeout, $mdDialog, $filter, triSkins, $window, $rootScope, $scope, SettingModel, Clique, printer, customerData, $http, $cookies) {


        $scope.buttonPermissions = {
            statement_send: false,

        };
        var permission_arr = [
            "send",
        ];

        angular.forEach(permission_arr, function (permission_name, key) {
            if (PermissionStore.getPermissionDefinition('statement-' + permission_name) != undefined) {
                $scope.buttonPermissions['statement_' + permission_name] = true;
            } else {
                $scope.buttonPermissions['statement_' + permission_name] = false;
            }

        });

        $scope.showProgress = true;
        $scope.downloadProgress = false;
        var statementTemplate;
        var stvm = this;
        var start_date = $filter('date')($scope.from, "yyyy-MM-dd");
        var end_date = $filter('date')($scope.to, "yyyy-MM-dd");
        var customer_id = customerData.Id;


        stvm.params = "customer=" + customer_id + "&start_date=" + start_date + "&end_date=" + end_date;
        $scope.promise = InvoiceModel.GetStatementPreview(stvm.params + "&file_type=html");
        $scope.promise.then(function (response) {
            statementTemplate = response;
            $("#statement_template").html('');
            $("#statement_template").append(response);

            $timeout(function () {
                $scope.showProgress = false;


            }, 1000)

        });


        $scope.cancel = function () {
            $mdDialog.hide();
        }
        $scope.print = function () {
            var contents = document.getElementById("statement_template").innerHTML;
            var frame1 = document.createElement('iframe');
            frame1.name = "frame3";
            frame1.style.position = "absolute";
            frame1.style.top = "-1000000px";
            document.body.appendChild(frame1);
            var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
            frameDoc.document.open();
            frameDoc.document.write('<html><head> <style>md-dialog-actions{display:none}.invoice-box{max-width:800px;margin:auto;padding:30px;border:1px solid #eee;box-shadow:0 0 10px rgba(0,0,0,.15);font-size:16px;line-height:24px;color:#555}.invoice-box table{width:100%;line-height:inherit;text-align:left}.invoice-box table td{padding:5px;vertical-align:top}.invoice-box table tr td:nth-child(2){text-align:right}.invoice-box table tr.top table td{padding-bottom:20px}.invoice-box table tr.top table td.title{font-size:45px;line-height:45px;color:#333}.invoice-box table tr.information table td{padding-bottom:40px}.invoice-box table tr.heading td{background:#eee;border-bottom:1px solid #ddd;font-weight:700}.invoice-box table tr.details td{padding-bottom:20px}.invoice-box table tr.item td{border-bottom:1px solid #eee}.invoice-box table tr.item.last td{border-bottom:none}.invoice-box table tr.total td:nth-child(2){border-top:2px solid #eee;font-weight:700} </style>');
            frameDoc.document.write('</head><body>');
            frameDoc.document.write(contents);
            frameDoc.document.write('</body></html>');
            frameDoc.document.close();
            setTimeout(function () {
                window.frames["frame3"].focus();
                window.frames["frame3"].print();
                document.body.removeChild(frame1);
            }, 500);
            return false;

        }
        $scope.download = function () {
            $scope.downloadProgress = true;
            var serviceurl = Clique.getServiceUrl();
            var endPoint = "/invoice/statementpreview?";

            $scope.promise = InvoiceModel.GetStatementPreview(stvm.params + "&file_type=pdf");
            $scope.promise.then(function (response) {
                if (response.status != undefined && response.status == -1) {
                    ///do nothing
                } else {

                    window.open(serviceurl + endPoint + stvm.params + "&file_type=pdf", "_self");
                    checkDownloadStatus();

                }
            });
        }

        function checkDownloadStatus() {
            //console.log("--checkDownloadStatus---");
            var fileDownload = $cookies.get('fileDownload');
            if (fileDownload != undefined) {
                ///cookie exist;
                $scope.downloadProgress = false;
                $cookies.remove('fileDownload');
            } else {
                $timeout(function () {
                    checkDownloadStatus();
                }, 1000);
            }
        }

        function downloadSuccess() {
            $scope.downloadProgress = false;
            //console.log($scope.downloadProgress);
        }

        function downloadFailed() {
            Clique.showToast("Error Downloading Statement", 'bottom right', 'success');
            $scope.downloadProgress = false;

        }

    }
})();
