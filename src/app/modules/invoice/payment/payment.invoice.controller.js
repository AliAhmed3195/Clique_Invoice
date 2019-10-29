(function () {
    'use strict';

    angular
        .module('invoice')
        .controller('PaymentInvoiceContoller', Controller)
        .filter('range', function () {
            var filter =
                function (arr, lower, upper) {
                    for (var i = lower; i <= upper; i++) arr.push(i)
                    return arr
                }
            return filter
        })
        .filter('profile', function () {

            return function (profile, searchType) {
                if (!profile) {
                    return '';
                }
                if (searchType == 'ach') {
                    if (profile.card_type == "ECHK") {
                        return profile;
                    }
                } else if (searchType == 'cc') {
                    if (profile.card_type != "ECHK") {
                        return profile;
                    }
                }

            }
        })
        .filter('ssn', function () {
            return function (ssn) {
                if (!ssn) {
                    return '';
                }

                var value = ssn.toString().trim().replace(/^\+/, '');

                if (value.match(/[^0-9]/)) {
                    return ssn;
                }

                return (ssn.slice(0, 3).replaceWith('*') + '-' + ssn.slice(4, 5).replaceWith('*') + '-' + ssn.slice(4)).trim();
            }
        });

    function Controller($window, $scope, $rootScope, $mdDialog, SettingModel, InvoiceModel, $timeout, $locale, Clique, printer, $state, triBreadcrumbsService, dataService, $http, VantivTriPOSiPP350, $filter) {
        var vm = this;
        $scope.innerHeight = $window.innerHeight + 0;

        $http.defaults.headers.common = [];
        $http.defaults.headers.common.appid = "2";
        $http.defaults.headers.common.APPID = "2";
        var x2js = new X2JS();

        var userInfo = Clique.getUserInfo();


        $scope.selectedInvoiceData = $rootScope.dataObj;
        $scope.paymentInfo = $rootScope.paymentInfo;

        //remote ip
        //$scope.paymentInfo=JSON.parse('{"is_configured":1,"status":1,"id":3,"name":"Vantiv","type":"vantiv","logo":"http://apps.clique.center/apps/settings/assets/images/logos/vantiv_logo.png","is_default":true,"voidrefund":true,"btn_logo":"http://apps.clique.center/apps/settings/assets/images/logos/vantiv-logo-btn.png","configuration":{"AccountID":"asd","AccountToken":"asd","AcceptorID":"asd","ApplicationID":"1234","hardware":{"triposipp350":{"service_address":"http://192.168.0.103:8080/","developer_key":"a4b6c122-bc2b-4cad-8395-a6789b628194","developer_secret":"526d67ca-9c62-42fc-a082-5e17ae574df5"}}},"details":"Vantiv is an easy way to quickly get your customers to pay by credit card from the reminders they receive."}');

        ///local ip
        //$scope.paymentInfo=JSON.parse('{"is_configured":1,"status":1,"id":4,"name":"CardConnect","type":"cardconnect","logo":"https://apps.clique.center/apps/settings/assets/images/logos/cardconnect_logo.png","is_default":true,"voidrefund":true,"btn_logo":"http://apps.clique.center/apps/settings/assets/images/logos/cardconnect_logo.png","configuration":{"Password":"testing123","MerchantID":"496160873888","Username":"testing","supported_methods":{"ach":true},"hardware":{"bolt":{"merchant_id":"80009990000","auth":"asldasdjaksdjalkjdakljdalksjdlkasjdlkajdklasd","terminals":{"16009SC80887755":{"users":["2","3"]},"16009SC80887756":{"users":["3"]}}}}},"details":"CardConnect is an easy way to quickly get your customers to pay by credit card from the reminders they receive."}');

        //$scope.paymentInfo=JSON.parse('{"is_configured":1,"status":1,"id":3,"name":"Vantiv","type":"vantiv","logo":"http://apps.clique.center/apps/settings/assets/images/logos/vantiv_logo.png","is_default":true,"voidrefund":true,"btn_logo":"http://apps.clique.center/apps/settings/assets/images/logos/vantiv-logo-btn.png","configuration":{"AccountID":"asd","AccountToken":"asd","AcceptorID":"asd","ApplicationID":"asd","hardware":{"triposipp350":{"service_address":"http://localhost/slim/paysync/public/","developer_key":"a4b6c122-bc2b-4cad-8395-a6789b628194","developer_secret":"526d67ca-9c62-42fc-a082-5e17ae574df5"}}},"details":"Vantiv is an easy way to quickly get your customers to pay by credit card from the reminders they receive."}');
        //$scope.selectedInvoiceData=JSON.parse('[{"DueDate":"2017-03-30","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"15","AllowOnlinePayment":false,"SalesTermRef":{"value":"1","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":null,"DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"6","name":"Remax 10A","type":""},"UnitPrice":2,"PriceLevelRef":null},"Amount":2.0,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":2.0,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":9991.0,"SendGridEvent":"open","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":null,"TrackingNum":"","ShipDate":"","TotalAmt":2.0,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1012","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-30T05:51:29-07:00","CreateTime":"2017-03-30T05:51:29-07:00"},"TxnDate":"2017-03-30","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0},{"DueDate":"2017-03-23","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"7","AllowOnlinePayment":false,"SalesTermRef":{"value":"3","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":"Remax Wifi Switch","DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"3","name":"Electronics:Remax Wifi Switch","type":""},"UnitPrice":5.4,"PriceLevelRef":null},"Amount":5.4,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":5.4,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":5.4,"SendGridEvent":"open","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":null,"TrackingNum":"","ShipDate":"","TotalAmt":5.4,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1006","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-22T04:09:24-07:00","CreateTime":"2017-03-22T04:09:24-07:00"},"TxnDate":"2017-03-23","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0},{"DueDate":"2017-03-22","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"10","AllowOnlinePayment":false,"SalesTermRef":{"value":"1","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":null,"DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"5","name":"Wifi Switch:Smart Wifi Switch","type":""},"UnitPrice":5,"PriceLevelRef":null},"Amount":5.0,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":5.0,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":5.0,"SendGridEvent":"","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":null,"TrackingNum":"","ShipDate":"","TotalAmt":5.0,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1009","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-22T04:59:06-07:00","CreateTime":"2017-03-22T04:59:06-07:00"},"TxnDate":"2017-03-22","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0},{"DueDate":"2017-03-22","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"8","AllowOnlinePayment":false,"SalesTermRef":{"value":"1","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":"Wifi Switch","DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"12","name":"Remax 30A","type":""},"UnitPrice":8,"PriceLevelRef":null},"Amount":8.0,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":8.0,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":8.0,"SendGridEvent":"","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":null,"TrackingNum":"","ShipDate":"","TotalAmt":8.0,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1007","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-22T04:13:51-07:00","CreateTime":"2017-03-22T04:13:51-07:00"},"TxnDate":"2017-03-22","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0},{"DueDate":"2017-03-22","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"6","AllowOnlinePayment":false,"SalesTermRef":{"value":"1","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":"Remax Wifi Switch","DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"3","name":"Electronics:Remax Wifi Switch","type":""},"UnitPrice":5,"PriceLevelRef":null},"Amount":5.0,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":5.0,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":5.0,"SendGridEvent":"","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":null,"TrackingNum":"","ShipDate":"","TotalAmt":5.0,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1005","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-22T04:06:52-07:00","CreateTime":"2017-03-22T04:06:52-07:00"},"TxnDate":"2017-03-22","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0},{"DueDate":"2017-03-21","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"3","AllowOnlinePayment":false,"SalesTermRef":{"value":"1","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":"Remax Wifi Switch","DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"3","name":"Electronics:Remax Wifi Switch","type":""},"UnitPrice":5,"PriceLevelRef":null},"Amount":5.0,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":5.0,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":5.0,"SendGridEvent":"","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":null,"TrackingNum":"","ShipDate":"","TotalAmt":5.0,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1003","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-22T02:49:32-07:00","CreateTime":"2017-03-22T02:49:32-07:00"},"TxnDate":"2017-03-21","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0},{"DueDate":"2017-03-21","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"2","AllowOnlinePayment":false,"SalesTermRef":{"value":"1","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":"Remax Wifi Switch","DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"3","name":"Electronics:Remax Wifi Switch","type":""},"UnitPrice":5,"PriceLevelRef":null},"Amount":5.0,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":5.0,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":5.0,"SendGridEvent":"","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":null,"TrackingNum":"","ShipDate":"","TotalAmt":5.0,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1002","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-22T02:44:27-07:00","CreateTime":"2017-03-22T02:44:27-07:00"},"TxnDate":"2017-03-21","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0},{"DueDate":"2017-03-21","BillAddr":{"Lat":"","Line4":"","Id":"2","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"EInvoiceStatus":null,"Id":"1","AllowOnlinePayment":false,"SalesTermRef":{"value":"1","name":"","type":""},"AllowOnlineACHPayment":false,"LinkedTxn":[],"Line":[{"LinkedTxn":[],"Description":"Remax Wifi Switch","DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"MarkupInfo":null,"ServiceDate":"","TaxCodeRef":{"value":"NON","name":"","type":""},"ClassRef":null,"TaxInclusiveAmt":0,"Qty":1,"ItemRef":{"value":"3","name":"Electronics:Remax Wifi Switch","type":""},"UnitPrice":5,"PriceLevelRef":null},"Amount":5.0,"LineNum":1,"CustomField":[],"Id":"1"},{"LinkedTxn":[],"Description":null,"SubTotalLineDetail":{},"DetailType":"SubTotalLineDetail","Amount":5.0,"SubtotalLineDetail":null,"LineNum":0,"CustomField":[],"Id":null}],"Balance":5.0,"SendGridEvent":"open","BillEmail":{"Address":"james.gibs@yopmail.com"},"CurrencyRef":{"value":"USD","name":"United States Dollar","type":""},"Deposit":0,"ShipAddr":{"Lat":"","Line4":"","Id":"3","Line1":"A-14 Right Street 14-B road","City":"New Vally","Line5":"","Note":"","PostalCode":"46062","Country":"United States","Line2":"","Line3":"","CountrySubDivisionCode":"NY","Long":""},"ApplyTaxAfterDiscount":false,"TxnTaxDetail":null,"CustomerRef":{"value":"1","name":"John Smith","type":""},"EmailStatus":"NotSet","CustomField":[],"domain":"QBO","PrivateNote":"","CustomerMemo":{"value":"Thanks"},"TrackingNum":"","ShipDate":"","TotalAmt":5.0,"PrintStatus":"NotSet","SyncToken":"0","DocNumber":"1001","AllowOnlineCreditCardPayment":false,"MetaData":{"LastUpdatedTime":"2017-03-22T02:43:44-07:00","CreateTime":"2017-03-22T02:43:44-07:00"},"TxnDate":"2017-03-21","ExchangeRate":1,"AllowIPNPayment":true,"DepartmentRef":null,"DeliveryInfo":null,"sparse":false,"GlobalTaxCalculation":"TaxExcluded","IsPaid":0}]');

        if ($scope.selectedInvoiceData == undefined) {
            $state.go("triangular.invoice-list");
        }
        //$scope.selectedInvoiceData.ChargeAmount = 500;
        triBreadcrumbsService.reset();
        var breadcrumbs = [{
            active: false,
            icon: "zmdi zmdi-chart",
            name: 'Invoice Payment.',
            priority: 2,
            state: "triangular.invoice-list",
            template: "app/triangular/components/menu/menu-item-link.tmpl.html",
            type: "link",

        }];
        angular.forEach(breadcrumbs, function (breadcrumb, key) {
            triBreadcrumbsService.addCrumb(breadcrumb);
        });



        /*fab controller*/
        vm.fabDirections = ['up', 'down', 'left', 'right'];
        vm.fabDirection = vm.fabDirections[2];
        vm.fabAnimations = ['md-fling', 'md-scale'];
        vm.fabAnimation = vm.fabAnimations[1];
        vm.fabStatuses = [false, true];
        vm.fabStatus = vm.fabStatuses[0];
        vm.share = true;
        /*eof fab controller*/


        var randomPalettes = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey'];
        var rand = "";
        var num = 1;
        $scope.initRand = function (min, max) {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
            rand = randomPalettes[num];

        }

        $scope.getRandomSpan = function () {
            return rand;
        }


        $scope.currentYear = new Date().getFullYear();
        $scope.currentMonth = new Date().getMonth() + 1;
        $scope.months = $locale.DATETIME_FORMATS.MONTH;
        $scope.cardlogos = [{
                id: 'visa',
                title: 'Visa',
                src: "visa.png"
            },
            {
                id: 'master',
                title: 'Master',
                src: "mastercard.png"
            },
            {
                id: 'discover',
                title: 'Discover',
                src: "discover.png"
            },
            {
                id: 'amex',
                title: 'Amex',
                src: "amex.png"
            },
        ];
        $scope.ccinfo = {
            type: undefined
        }
        $scope.showProgress = false;
        $scope.totalAmount = 0;
        $scope.isAmountInvalid = false;
        $scope.disabledChargeButton = false;
        $scope.invoiceIds = []; //{}
        $scope.invoiceAmount = [];
        $scope.payform = {
            cardnumber: ""
        };
        $scope.cardnumber = "";
        $scope.ccno = {};
        $scope.cardnumber_arr = [];
        $scope.declined_message = "";
        $scope.companyInfo = {};
        $scope.isPaymentSuccess = false;
        $scope.transactionResponse = {};
        $scope.ccprofiles = {};
        $scope.ccprofile = JSON.parse('{"profile_id":0, "last_digits":"0"}');
        $scope.profile_id = {};
        $scope.usedCardProfile = false;
        $scope.openEmailReceipt = false;

        //echeck
        $scope.requiredAccountNo = false;
        $scope.requiredBankaba = false;
        $scope.requiredAccountName = false;


        //creditcard
        $scope.requiredMonthField = true;
        $scope.requiredYearField = true;
        $scope.requiredCreditCardNumber = true;
        $scope.requiredCardHolderName = true;

        /* Bolt Confuguration*/
        $scope.boltProcessStatus = "";
        $scope.boltToken = "";


        $scope.enableCreditCard = false;
        $scope.enableBolt = false;

        $scope.activePaymentMethods = {
            creditcard: false,
            ach: false,
            bolt: false,
            tripos_ipp350: false,
            cash: false
        };

        $scope.boltConfig = {
            auth: '',
            merchant_id: '',
            hsn: ''
        };

        $scope.triPOSiPP350 = {
            developer_key: '',
            developer_secret: '',
            sevice_address: ''
        };

        $scope.tripos_searchlane_progress = false;
        $scope.showtriPOSLaneInfo = false;
        $scope.triPOSLaneInfo = "";
        $scope.triPOSSaleInfo = "";
        $scope.convfee = false;
        $scope.disableinpt = false;


        if ($scope.paymentInfo.hasOwnProperty('configuration')) {
            if ($scope.paymentInfo.configuration.hasOwnProperty('hardware')) {


                //triPOSiPP350
                if ($scope.paymentInfo.configuration.hardware.hasOwnProperty('triposipp350')) {
                    $scope.activePaymentMethods.tripos_ipp350 = true;

                    VantivTriPOSiPP350.config.serviceAddress = $scope.paymentInfo.configuration.hardware.triposipp350.service_address;
                    VantivTriPOSiPP350.config.tpAuthorizationCredential = $scope.paymentInfo.configuration.hardware.triposipp350.developer_key;
                    VantivTriPOSiPP350.config.tpAuthorizationSecret = $scope.paymentInfo.configuration.hardware.triposipp350.developer_secret;
                    VantivTriPOSiPP350.config.application_id = parseInt($scope.paymentInfo.configuration.ApplicationID)

                    //Get Lane Information
                    $timeout(function () {
                        $scope.tripos_searchlane_progress = true;
                        VantivTriPOSiPP350.getLaneInfo(VantivTriPOSiPP350.config, function (res) {
                            $scope.tripos_searchlane_progress = false;
                            var response = res.data;
                            $scope.triPOSLaneInfo = response;
                            $scope.triPOSLaneInfo._hasErrors;
                            if ($scope.triPOSLaneInfo._hasErrors == true) {
                                $scope.triPOSLaneInfo.errorMessage = response._errors[0].developerMessage;
                            } else {
                                $scope.showtriPOSLaneInfo = true;
                            }
                        });
                    }, 2000);
                }
                //eof triPOSiPP350


                //Bolt CardConnect
                if ($scope.paymentInfo.configuration.hardware.hasOwnProperty('bolt')) {

                    $scope.enableBolt = true;

                    $scope.activePaymentMethods.bolt = true;

                    $scope.boltConfig.auth = $scope.paymentInfo.configuration.hardware.bolt.auth;
                    $scope.boltConfig.merchant_id = $scope.paymentInfo.configuration.hardware.bolt.merchant_id;


                    var userInfo = Clique.getUserInfo();
                    var user_id;
                    if (userInfo != null)
                        if (userInfo.id != null || userInfo.id != undefined) {
                            user_id = userInfo.id;
                        }

                    //get user terminal////

                    if ($scope.paymentInfo.configuration.hardware.bolt.hasOwnProperty('terminals')) {
                        var terminals = $scope.paymentInfo.configuration.hardware.bolt.terminals;
                        var fetchTerminals = true;
                        if (user_id != null) {
                            angular.forEach(terminals, function (userData, terminal_id) {
                                if (fetchTerminals) {

                                    var users = userData.users;


                                    for (var i = 0; i < userData.users.length; i++) {
                                        if (user_id == userData.users[i].user_id) {
                                            $scope.boltConfig.hsn = terminal_id;
                                            fetchTerminals = false;
                                        }

                                    }


                                }
                            });
                        }

                    }
                }
                //eof bolt
            }
        }


        /* Eof Bolt Confuguration*/

        $scope.paymentDescription = {
            cash: {
                icon: 'assets/images/icons/icon_cash.png',
                title: 'Cash'
            },
            ach: {
                icon: 'assets/images/icons/icon_check.png',
                title: 'eCheck (ACH)'
            },
            creditcard: {
                icon: 'assets/images/icons/icon_creditcard.png',
                title: 'CreditCard'
            },
            bolt: {
                icon: 'assets/images/icons/icon_bolt.png',
                title: 'Bolt P2PE'
            },
            //tripos_ipp350:{icon:'assets/images/tripos.jpg',title:''}
        };

        $scope.ccPattern = /[0-9-()]*[1-9][0-9-()]*/;


        $scope.checkConv = false
        switch ($scope.paymentInfo.type) {

            case "cardconnect":
                $scope.paymentMode = 'creditcard';
                $scope.activePaymentMethods.creditcard = true;
                $scope.activePaymentMethods.cash = false;
                if ($scope.paymentInfo.hasOwnProperty('configuration')) {
                    if ($scope.paymentInfo.configuration.hasOwnProperty('supported_methods')) {
                        if ($scope.paymentInfo.configuration.supported_methods.hasOwnProperty('ach')) {
                            $scope.activePaymentMethods.ach = $scope.paymentInfo.configuration.supported_methods.ach;
                        }
                    }
                }
                break;

            case "bridgepay":
                $scope.paymentMode = 'creditcard';
                $scope.activePaymentMethods.creditcard = true;
                $scope.activePaymentMethods.cash = false;
                if ($scope.paymentInfo.hasOwnProperty('configuration')) {
                    if ($scope.paymentInfo.configuration.hasOwnProperty('supported_methods')) {
                        if ($scope.paymentInfo.configuration.supported_methods.hasOwnProperty('ach')) {
                            $scope.activePaymentMethods.ach = $scope.paymentInfo.configuration.supported_methods.ach;
                        }
                    }
                }
                break;

            case "vantiv":
                if ($scope.activePaymentMethods.tripos_ipp350)
                    $scope.paymentMode = 'tripos_ipp350';
                else
                    $scope.paymentMode = 'cash';

                $scope.activePaymentMethods.cash = true;

                break;

            case "paypal":
                $scope.paymentMode = 'cash';
                $scope.activePaymentMethods.cash = true;
                break;
        }


        function resetChargeAmount() {
            $scope.isAmountInvalid = false;
            $scope.totalAmount = 0;
            if ($scope.selectedInvoiceData.length > 0) {
                angular.forEach($scope.selectedInvoiceData, function (item, key) {
                    item.ChargeAmount = item.Balance
                });
            }
        }

        $scope.changePaymentMode = function (type) {
            resetChargeAmount()
            $scope.ccprofile = JSON.parse('{"profile_id":0, "last_digits":"0"}');
            $scope.paymentMode = type;
            $scope.UpdateCCFields({
                "profile_id": 0
            });

            switch (type) {

                case "ach":
                    $scope.disableinpt = false;
                    $scope.convfee = false;
                    $scope.requiredAccountNo = true;
                    $scope.requiredBankaba = true;
                    $scope.requiredAccountName = true;

                    $scope.requiredMonthField = false;
                    $scope.requiredYearField = false;
                    $scope.requiredCreditCardNumber = false;
                    $scope.requiredCardHolderName = false;
                    $scope.totalAmount = $rootScope.FinalTotal
                    // console.log($scope.totalAmount)
                    break;

                case "creditcard":

                    if ($scope.checkConv) {
                        $scope.convfee = true;
                        console.log("i am here")
                        $scope.totalAmount = $scope.newAmount
                        if ($scope.totalAmount) {

                        } else {
                            $scope.totalAmount = $scope.newAmount
                        }

                    } else {
                        $scope.convfee = false;
                        $scope.totalAmount = $rootScope.FinalTotal
                    }

                    // console.log($scope.newAmount)
                    // console.log($scope.totalAmount)
                    $scope.requiredAccountNo = false;
                    $scope.requiredBankaba = false;
                    $scope.requiredAccountName = false;

                    $scope.requiredMonthField = true;
                    $scope.requiredYearField = true;
                    $scope.requiredCreditCardNumber = true;
                    $scope.requiredCardHolderName = true;

                    break;
                case "bolt":
                    $scope.disableinpt = false;
                    $scope.convfee = false;
                    $scope.totalAmount = $rootScope.FinalTotal
                    // console.log($scope.totalAmount)
                    break;
            }
        }
        // fetch all settings
        getSettings();

        function getSettings() {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.setting = response.data;
                } else {}
            });
        }


        //fetch settng///
        $scope.promise = SettingModel.GetCompanyInfo();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $scope.companyInfo = response.data;
            }
        });

        var customer_id;



        //caculate total amount
        if ($scope.selectedInvoiceData != undefined) {
            if ($scope.selectedInvoiceData.length > 0) {
                angular.forEach($scope.selectedInvoiceData, function (invoiceInfo, key) {
                    var Balance = parseFloat(invoiceInfo.Balance);
                    var invoice_id = parseInt(invoiceInfo.Id);
                    $scope.totalAmount += Balance;
                    customer_id = invoiceInfo.CustomerRef.value;
                    $scope.invoiceIds.push(invoice_id);
                    $rootScope.FinalTotal = $scope.totalAmount;

                });
                // console.log($rootScope.FinalTotal)
                if (("ConvenienceFee" in $scope.selectedInvoiceData[0]) == true) {
                    if ($scope.selectedInvoiceData[0].ConvenienceFee.length > 0) {
                        if ($scope.selectedInvoiceData[0].ConvenienceFee[0].is_active == true) {
                            $scope.hconvFee = true;
                            $scope.convfee = true;
                            if ($scope.convfee == true) {
                                $scope.disableinpt = true;
                                $scope.checkConv = true;
                            }

                            $scope.convfeeamount = $scope.selectedInvoiceData[0].ConvenienceFee[0].amount
                            $scope.convfeetype = $scope.selectedInvoiceData[0].ConvenienceFee[0].type
                            $rootScope.haveconfee = false
                            switch ($scope.selectedInvoiceData[0].ConvenienceFee[0].type) {
                                case '$':
                                    {
                                        $scope.totalAmount = $scope.totalAmount + $scope.selectedInvoiceData[0].ConvenienceFee[0].amount
                                        console.log("$scope.totalAmount", $scope.totalAmount)
                                        $scope.newAmount = $scope.totalAmount
                                        //  $rootScope.amount =  vm.invoice.Balance + vm.invoice.ConvenienceFee.amount
                                    }
                                    break;
                                case '%':
                                    {
                                        $scope.totalAmount = $scope.totalAmount + (($scope.selectedInvoiceData[0].ConvenienceFee[0].amount * $scope.totalAmount) / 100)
                                        console.log("$scope.totalAmount", $scope.totalAmount)
                                        $scope.newAmount = $scope.totalAmount
                                        // $rootScope.amount =  vm.invoice.Balance + ((vm.invoice.ConvenienceFee.amount *vm.invoice.Balance)/100)
                                    }
                                    break
                            }
                        } else {
                            $scope.newAmount = $scope.totalAmount
                        }

                    } else {
                        //  $rootScope.amount = $scope.totalAmount
                    }
                } else {
                    //     console.log(vm.invoice.Balance)
                    // console.log("not found")
                    ///   $scope.totalAmount
                    console.log($scope.totalAmount)
                }
            }

        }

        //fetch customr profile
        fetchCustomerProfile(customer_id);



        $scope.ProfileDeleteWithId = function (id) {
            var confirm = $mdDialog.confirm()
                .title("Are you sure you want to delete?")
                .textContent('')
                .ariaLabel('Confirmation')
                //.targetEvent(ev)
                .ok('Confirm')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {

                var params = {
                    id: $scope.profile_id
                };
                $scope.promise = InvoiceModel.ProfileDelete(params);
                $scope.promise.then(function (response) {
                    if (response.statuscode == 0) {
                        Clique.showToast(response.statusmessage, 'bottom right', 'success');
                        $state.reload();

                    } else {
                        Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    }
                });

            }, function () {

            });

        }

        $scope.ProfileDelete = function () {
            var confirm = $mdDialog.confirm()
                .title("Are you sure you want to delete?")
                .textContent('')
                .ariaLabel('Confirmation')
                //.targetEvent(ev)
                .ok('Confirm')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {

                var params = {
                    id: $scope.profile_id
                };
                $scope.promise = InvoiceModel.ProfileDelete(params);
                $scope.promise.then(function (response) {
                    if (response.statuscode == 0) {
                        Clique.showToast(response.statusmessage, 'bottom right', 'success');
                        $state.reload();

                    } else {
                        Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    }
                });

            }, function () {

            });

        }

        $scope.calculateTotalAmount = function () {
            $scope.isAmountInvalid = false;
            $scope.totalAmount = 0;
            if ($scope.selectedInvoiceData.length > 0) {
                angular.forEach($scope.selectedInvoiceData, function (item, key) {
                    if (item.ChargeAmount > item.Balance || !angular.isNumber(item.ChargeAmount)) {
                        $scope.isAmountInvalid = true;
                    }
                    var itemTotal = parseFloat(item.ChargeAmount);
                    if (itemTotal > 0) {
                        $scope.totalAmount += itemTotal;
                        $scope.invoiceAmount.push(itemTotal);
                    }
                });
            }
        }

        $scope.UpdateCCFields = function () {

            var profile = {};
            if ($scope.ccprofile.profile_id != "") {
                profile = $filter('filter')($scope.ccprofiles, {
                    'profile_id': $scope.ccprofile.profile_id
                })[0];
            }


            $scope.usedCardProfile = false;


            $scope.payform = {
                cc2: '',
                cardnumber: "",
                cardholder: "",
                streetaddress: '',
                zipcode: '',
                bankaba: '',
                account: '',
                name: '',
            };

            if (profile.profile_id != 0 && profile.profile_id != undefined) {
                $scope.profile_id = profile.profile_id;
                $scope.payform = {
                    cardnumber: "xxxxxxxxxxxx" + profile.last_digits,
                    cardholder: profile.cardholder_name,
                    bankaba: "xxxxxxxxxxxx" + profile.last_digits,
                    account: "xxxxxxxxxxxx",
                    name: profile.cardholder_name,

                };

                $scope.ccinfo = {
                    type: angular.lowercase(profile.card_type)
                };
                $scope.usedCardProfile = true;

                $scope.requiredMonthField = false;
                $scope.requiredYearField = false;
                //$scope.ccPattern=/^[a-zA-Z0-9]*$/;
                $scope.ccPattern = /^[a-zA-Z0-9]*$/;


            } else {

                if ($scope.paymentMode == 'creditcard') {
                    $scope.requiredMonthField = true;
                    $scope.requiredYearField = true;
                    $scope.requiredAccountNo = false;
                    $scope.requiredBankaba = false;






                } else if ($scope.paymentMode == 'ach') {

                    $scope.requiredMonthField = false;
                    $scope.requiredYearField = false;
                    $scope.requiredCreditCardNumber = false;
                    $scope.requiredCardHolderName = false;
                    $scope.requiredAccountNo = true;
                    $scope.requiredBankaba = true;


                }
                $scope.ccPattern = /^[0-9]+$/;
            }
        }
        $scope.submit = function (mode) {
            Sale(mode);
        };

        function Sale(mode) {

            $scope.disabledChargeButton = true;
            $timeout(function () {
                $scope.declined_message = "";
            });
            $scope.showProgress = true;
            var Line = [];
            var LineItem = {
                Amount: 0.0,
                LinkedTxn: [{
                    TxnId: 0,
                    TxnLineId: 0,
                    TxnType: "Invoice"
                }]
            };
            var DocNumber = [];
            var CustomerName = "";
            var CustomerEmail = "";
            var CustomerId = "";
            if ($scope.selectedInvoiceData.length > 0) {
                // console.log("data",$scope.selectedInvoiceData)
                angular.forEach($scope.selectedInvoiceData, function (invoiceInfo, key) {

                    var ChargeAmount = parseFloat(invoiceInfo.ChargeAmount);
                    var invoice_id = parseInt(invoiceInfo.Id);
                    ////console.log(invoice_id);
                    var LineItem = {
                        Amount: 0.0,
                        LinkedTxn: [{
                            TxnId: 0,
                            TxnLineId: 0,
                            TxnType: "Invoice"
                        }]
                    };
                    LineItem.Amount = ChargeAmount;
                    LineItem.LinkedTxn[0].TxnId = invoice_id;
                    Line.push(LineItem);

                    DocNumber.push(invoiceInfo.DocNumber);
                    CustomerId = invoiceInfo.CustomerRef.value;
                    CustomerName = invoiceInfo.CustomerRef.name;
                    if (invoiceInfo.BillEmail != null) {
                        CustomerEmail = invoiceInfo.BillEmail.Address
                    }

                });
            }
            var paymentObj = {};
            if (mode == 'creditcard') {
                // console.log("vm.invoice",$scope.selectedInvoiceData[0])


                if ($scope.usedCardProfile) {
                    paymentObj = {
                        CustomerRef: {
                            value: CustomerId,
                            name: CustomerName
                        },
                        Line: Line,
                        TotalAmt: $scope.totalAmount,
                        TransType: 'profile_sale',
                        ProfileId: $scope.profile_id,
                        CustomerEmail: CustomerEmail,
                        DocNumber: DocNumber,
                        Type: "invoice"
                    };
                } else {

                    paymentObj = {
                        CustomerRef: {
                            value: CustomerId,
                            name: CustomerName
                        },
                        Line: Line,
                        TotalAmt: $scope.totalAmount,
                        TransType: 'sale',
                        CardHolder: $scope.payform.cardholder,
                        CreditCardNumber: $scope.payform.cardnumber,
                        track2: $scope.payform.track2,
                        Month: $scope.payform.months,
                        Exp: $scope.payform.years,
                        CCV2: $scope.payform.cc2,
                        StreetAddress: $scope.payform.streetaddress,
                        Zipcode: $scope.payform.zipcode,
                        CardProfile: $scope.payform.card_profile,
                        CustomerEmail: CustomerEmail,
                        DocNumber: DocNumber,
                        Type: "invoice"

                    };
                }
            } else if (mode == 'cash') {
                paymentObj = {
                    CustomerRef: {
                        value: CustomerId,
                        name: CustomerName
                    },
                    Line: Line,
                    TotalAmt: $scope.totalAmount,
                    TransType: 'cash',
                    CustomerEmail: CustomerEmail,
                    DocNumber: DocNumber,
                    Type: "invoice"
                };
            } else if (mode == 'ach') {
                if ($scope.usedCardProfile) {
                    paymentObj = {
                        CustomerRef: {
                            value: CustomerId,
                            name: CustomerName
                        },
                        Line: Line,
                        TotalAmt: $scope.totalAmount,
                        TransType: 'profile_sale',
                        ProfileId: $scope.profile_id,
                        CustomerEmail: CustomerEmail,
                        DocNumber: DocNumber,
                        Type: "invoice"
                    };
                } else {
                    paymentObj = {
                        CustomerRef: {
                            value: CustomerId,
                            name: CustomerName
                        },
                        Line: Line,
                        TotalAmt: $scope.totalAmount,
                        TransType: 'ach_sale',
                        account: $scope.payform.account,
                        name: $scope.payform.name,
                        bankaba: $scope.payform.bankaba,
                        CardProfile: $scope.payform.card_profile,
                        CustomerEmail: CustomerEmail,
                        DocNumber: DocNumber,
                        Type: "invoice"
                    };
                }
            } else if (mode == 'bolt') {
                $scope.totalAmount = $rootScope.FinalTotal
                console.log($scope.totalAmount)
                paymentObj = {
                    CustomerRef: {
                        value: CustomerId,
                        name: CustomerName
                    },
                    Line: Line,
                    TotalAmt: $scope.totalAmount,
                    TransType: 'bolt',
                    Token: $scope.boltToken,
                    CustomerEmail: CustomerEmail,
                    DocNumber: DocNumber,
                    Type: "invoice"
                };
            } else if (mode == 'triposipp350') {
                var processorRawResponse = "";
                var payment_type = "";
                var xml2json = x2js.xml_str2json($scope.triPOSSaleInfo._processor.processorRawResponse);
                payment_type = ($scope.triPOSSaleInfo.paymentType).toLowerCase();
                if (payment_type == 'credit') {
                    processorRawResponse = xml2json.CreditCardSaleResponse.Response;
                } else if (payment_type == 'debit') {
                    processorRawResponse = xml2json.DebitCardSaleResponse.Response;
                } else if (payment_type == 'gift') {
                    processorRawResponse = xml2json.GiftCardSaleResponse.Response;
                }
                var cardNumber = $scope.triPOSSaleInfo.accountNumber;
                var last4Digits = cardNumber.substr(cardNumber.length - 4);
                var transStatus;
                var reason = "";
                var ResponseCode = "";
                if ($scope.triPOSSaleInfo.isApproved == true) {
                    transStatus = "approved";
                    ResponseCode = $scope.triPOSSaleInfo._processor.hostResponseCode + "/" + $scope.triPOSSaleInfo._processor.hostResponseMessage;
                } else {
                    transStatus = "declined";
                    reason = $scope.triPOSSaleInfo._processor.processorResponseMessage;
                    ResponseCode = $scope.triPOSSaleInfo._processor.expressResponseCode + "/" + $scope.triPOSSaleInfo._processor.expressResponseMessage;
                }

                paymentObj = {
                    CustomerRef: {
                        value: CustomerId,
                        name: CustomerName
                    },
                    Line: Line,
                    TotalAmt: $scope.triPOSSaleInfo.approvedAmount,
                    TransType: 'triposipp350_' + payment_type,
                    ProcessorInfo: {
                        processorRawResponse: {
                            RawResponse: processorRawResponse,
                            MerchantId: $scope.triPOSSaleInfo.merchantId,
                            TerminalId: $scope.triPOSSaleInfo.terminalId,
                            ApprovalNumber: $scope.triPOSSaleInfo.approvalNumber,
                            EntryMode: $scope.triPOSSaleInfo.entryMode,
                            paymentType: $scope.triPOSSaleInfo.paymentType,
                            ResponseCode: ResponseCode,
                            PinVerified: $scope.triPOSSaleInfo.pinVerified
                        },
                        transactionId: $scope.triPOSSaleInfo.transactionId,
                        CardHolder: $scope.triPOSSaleInfo.cardHolderName,
                        CreditCardNumber: cardNumber,
                        CardType: $scope.triPOSSaleInfo.cardLogo,
                        last4Digits: last4Digits,
                        TransStatus: transStatus,
                        StatusMessage: reason
                    },
                    CustomerEmail: CustomerEmail,
                    DocNumber: DocNumber,
                    Type: "invoice"
                };
            }

            $scope.promise = InvoiceModel.CCPartialSale(paymentObj);
            $scope.promise.then(function (response) {
                $scope.disabledChargeButton = false;
                if (response.statuscode == 0) {
                    $scope.IsPaidInvoice = true;
                    $scope.totalBalance = 0;
                    $scope.payform = {};
                    $scope.isPaymentSuccess = true;
                    $scope.transactionResponse = response.data;
                    $scope.showEmailDialog = false;
                    if ($scope.transactionResponse.status == 'declined') {
                        Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    }
                    if ($scope.setting.InvoiceReceiptDialog == false && $scope.transactionResponse.status != 'declined') {
                        Clique.showToast(response.statusmessage, 'bottom right', 'success');
                        $state.go("triangular.invoice-list");
                    }

                    if ($scope.setting.InvoiceReceiptDialog == true) {
                        $scope.printDialog();
                    }
                } else if (response.statuscode == 1) {
                    $scope.boltProcessStatus = "";
                    $mdDialog.show({
                        parent: angular.element(document.body),
                        template: '<md-dialog aria-label="List dialog">' +
                            '  <md-dialog-content class="md-padding" palette-background="red:500">' +
                            '    <b>Transaction declined</b>' +
                            '    <p>' + response.statusmessage + '</p>' +
                            '  </md-dialog-content>' +
                            '</md-dialog>',
                        clickOutsideToClose: true,
                        escapeToClose: true

                    });
                    $timeout(function () {
                        $scope.checkoutForm.$setUntouched();
                        $scope.checkoutForm.$setPristine();
                    });
                    $scope.isPaymentSuccess = false;
                    $scope.transactionResponse = {};
                }
                $scope.showProgress = false;
            });
        }
        $scope.processBolt = function () {

            $scope.disabledChargeButton = true;
            var ChargeAmount = parseFloat($scope.totalAmount);
            $scope.showProgress = true;
            $scope.boltProcessStatus = "Please Complete transaction at Terminal."
            var bolt_type = localStorage.getItem('bolt_type');
            var params = {
                auth: $scope.boltConfig.auth,
                merchant_id: $scope.boltConfig.merchant_id,
                hsn: $scope.boltConfig.hsn,
                amount: ChargeAmount,
                type: (bolt_type == undefined || null) ? 'swipe' : bolt_type
            };
            $scope.promise = InvoiceModel.BoltReadCard(params);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.boltToken = response.data.token;
                    $scope.boltProcessStatus = "Authorizing Transaction..."
                    Sale('bolt');

                } else {
                    $scope.boltProcessStatus = response.statusmessage
                    $scope.showProgress = false;
                    $timeout(function () {
                        $scope.boltProcessStatus = "";
                        $scope.disabledChargeButton = false;
                    }, 5000);
                }

            });
        }
        $scope.processTriPOSiPP350 = function () {
            $scope.disabledChargeButton = true;
            $scope.showProgress = true;
            $scope.triPOSSaleInfo = "";
            var ChargeAmount = parseFloat($scope.totalAmount);
            var laneId = parseInt($scope.triPOSLaneInfo.ipLanes[0].laneId);
            var params = {
                laneId: laneId,
                transactionAmount: ChargeAmount,
                address: {
                    BillingAddress1: "",
                    BillingAddress2: "",
                    BillingCity: "",
                    BillingPostalCode: "",
                    BillingState: ""
                },
                cardHolderPresentCode: null,
                clerkNumber: "Clerk101",
                commercialCardCustomerCode: null,
                configuration: {
                    AllowPartialApprovals: false,
                    CheckForDuplicateTransactions: false,
                    CurrencyCode: "Usd",
                    MarketCode: "Retail",
                    PromptForSignature: null
                },
                convenienceFeeAmount: null,
                healthcare: null,
                lodging: null,
                referenceNumber: "",
                salesTaxAmount: null,
                shiftId: "ShiftA",
                ticketNumber: userInfo.id != undefined ? userInfo.id : '',
                tipAmount: null
            };

            //make sale request on device
            VantivTriPOSiPP350.makeSaleRequest(VantivTriPOSiPP350.config, params, function (res) {
                $scope.showProgress = false;
                $scope.disabledChargeButton = false;
                var response = res.data;
                $scope.triPOSSaleInfo = response;

                if ($scope.triPOSSaleInfo._hasErrors == true) {
                    $scope.triPOSSaleInfo.errorMessage = response._errors[0].developerMessage;
                    $timeout(function () {
                        $scope.triPOSSaleInfo = "";
                    }, 5000);

                } else {

                    Sale('triposipp350');
                }

            });
        }

        function fetchCustomerProfile(customer_id) {
            $scope.showProfileProgress = true;
            $scope.promise = InvoiceModel.ProfileGet({
                customer_id: customer_id
            });
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    if (response.data.total_item > 0) {
                        $scope.ccprofiles = response.data.item;
                        $scope.countCCProfile = 0;
                        $scope.countACHProfile = 0;
                        angular.forEach($scope.ccprofiles, function (profile, key) {
                            if (profile.card_type !== 'ECHK') {
                                $scope.countCCProfile++;
                            }
                            if (profile.card_type == 'ECHK') {
                                $scope.countACHProfile++;
                            }
                        });
                        // show ACH div if cc profile are null
                        if ($scope.countCCProfile == 0 && $scope.countACHProfile > 0 && $scope.activePaymentMethods.ach == true) {
                            $scope.changePaymentMode('ach');
                        }

                        $scope.paymentForm = {
                            CreditCardForm: true,
                            ProfileDropForm: true
                        };
                    } else {
                        $timeout(function () {
                            $scope.paymentForm = {
                                CreditCardForm: true,
                                ProfileDropForm: false
                            };
                        });
                    }
                    if ($scope.ccprofiles.length > 0) {
                        $scope.ccprofiles.splice(0, 0, JSON.parse('{"profile_id":0, "last_digits":"0"}'));
                    }
                }
                $scope.showProfileProgress = false;
            });
        }
        $scope.print = function () {
            var receipt_template = "transaction.print.html";
            var isTriposipp350 = ($scope.transactionResponse.trans_type).search("triposipp350");
            if (isTriposipp350 == 0) {
                receipt_template = "transaction.triposipp350.print.html";
            }

            printer.print('assets/' + receipt_template, {
                transactionResponse: $scope.transactionResponse,
                companyInfo: $scope.companyInfo
            });

        }

        $scope.printDialog = function () {
            var receipt_template = "transaction.print.html";
            var isTriposipp350 = ($scope.transactionResponse.trans_type).search("triposipp350");
            if (isTriposipp350 == 0) {
                receipt_template = "transaction.triposipp350.print.html";
            }

            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                templateUrl: 'assets/' + receipt_template,
                clickOutsideToClose: true,
                fullscreen: true,
                controller: DialogController
            }).then(function () {}, function () {
                if ($scope.openEmailReceipt == false) {
                    $state.go("triangular.invoice-list");
                }
            });

        }
        $scope.sendReceiptDialog = function () {
            $mdDialog.show({
                    controller: ReceiptController,
                    templateUrl: 'app/modules/statement/sendConfirmationDialog.html',
                    parent: angular.element(document.body),
                    scope: $scope.$new(),
                    clickOutsideToClose: true
                })
                .then(function (answer) {
                    $scope.openEmailReceipt = false;
                    $scope.printDialog();
                }, function () {
                    $scope.openEmailReceipt = false;
                    $scope.printDialog();
                });
        };
        $scope.emailReceipt = function (transData, tranType) {

            $scope.settings = {
                InvoiceContacts: {
                    sender_email: '',
                    sender_name: '',
                    cc_email: [],
                    bcc_email: [],
                    to_email: [],
                    save_email_erp: false,
                },
                subject: '',
                template_id: '',
                title: "Send Reciept"
            };
            $scope.openEmailReceipt = true;
            var customer_email = transData.customer_email;
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $scope.settings = response.data;
                    $scope.settings.title = "Send Receipt";
                    $scope.settings.transaction = transData;
                    $scope.settings.companyInfo = $scope.companyInfo.company;

                    $scope.settings.InvoiceContacts.to_email = [];
                    if (customer_email != "") {
                        $scope.settings.InvoiceContacts.to_email.push(customer_email);

                    }
                    $scope.settings.receipt_type = tranType;
                    $scope.sendReceiptDialog();
                }
            });
        };
        $scope.cancel = function () {
            $state.go("triangular.invoice-list");
        };

        $scope.showSwipe = function () {
            $mdDialog.show({
                    scope: $scope,
                    preserveScope: true,
                    skipHide: true,
                    controller: SwipeCardController,
                    templateUrl: 'app/modules/invoice/payment/swipecard.tmpl.html',
                    parent: angular.element(document.body),
                    //targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: false
                })
                .then(function () {}, function () {
                    $scope.swipeInfo = "";
                });
        }

    }

    function SwipeCardController($window, $scope, $mdDialog, $timeout) {
        $scope.swipeText = "Please swipe your card now.";
        $scope.swipeInfo = "";
        $scope.showSwiperProgress = false;
        $scope.showStatic = true;
        $scope.showAnimation = false;
        $scope.cancel = function () {
            $mdDialog.hide();
        };


        $scope.handle_swipe = function () {
            $scope.swipeText = "Please swipe your card now.";
            $timeout(function () {
                submitswipe()
            }, 400);

        }

        function hide_swipe() {
            $scope.swipeText = "Please swipe your card now.";
            $mdDialog.hide();
        }

        function swipe_fail() {
            $scope.showSwiperProgress = true;
            $timeout(function () {
                $scope.swipeText = "Card swipe failed. Please re-swipe.";
                $scope.showSwiperProgress = false;
                $scope.swipeInfo = "";
            }, 600);

        }


        function checknumber(x) {
            var testresult = false;
            var anum = /(^\d+$)|(^\d+\.\d+$)|(^[0-9 ]+$)/;
            return true;
        }

        function submitswipe() {
            $scope.swipeText = "Please swipe your card now.";
            var strSwipe = $scope.swipeInfo;
            var arr = strSwipe.split("^");
            if (strSwipe.indexOf("&") > 0) {
                var cHat = 0,
                    cAmp = 0;
                for (var i = 0, n = strSwipe.length; i < n; i++) {
                    if (strSwipe.charAt(i) == '^') cHat++;
                    else if (strSwipe.charAt(i) == '&') cAmp++;
                }
                if (cAmp > cHat) {
                    arr = strSwipe.split("&");
                }
            }
            var ccNbr = arr[0];
            var expMon = 0;
            var expYear = 0;
            var expYearTemp = 0;
            var ccname = "";
            var charFirst = strSwipe.substring(0, 1);
            if (charFirst == "%") {
                charFirst = strSwipe.substring(1, 2);
            }
            if ((charFirst == "B") || (charFirst == "b")) {
                ccNbr = ccNbr.substring(2, ccNbr.length);
                ccNbr = ccNbr; // trim(ccNbr);
                if (!checknumber(ccNbr)) {
                    swipe_fail();
                    return;
                }
            } else {
                swipe_fail();
                return;
            }
            if (arr.length > 1) {
                ccname = arr[1];
                var namearr = ccname.split("/");
                if (namearr.length > 1)
                    ccname = namearr[1] + " " + namearr[0]; // trim(namearr[1]) + " " + trim(namearr[0]);
                expYearTemp = arr[2].substring(0, 2);
                expMon = arr[2].substring(2, 4);
                var currentYear = new Date().getFullYear();
                currentYear = currentYear.toString();
                var expYear = currentYear.substring(0, 2) + expYearTemp;


            }


            $scope.payform = {
                cc2: '',
                cardnumber: "",
                cardholder: "",
                months: '',
                years: ''
            };

            $scope.payform = {
                cc2: '',
                cardnumber: ccNbr,
                cardholder: ccname,
                months: expMon,
                years: expYear,
                track2: $scope.swipeInfo
            };

            $scope.showStatic = false;
            $scope.showAnimation = true;
            $scope.swipeText = "Please swipe your card now.";
            $timeout(function () {
                hide_swipe();
            }, 2400);


        }

    }

    function DialogController($window, $scope, $mdDialog) {}

    function ReceiptController($timeout, $mdDialog, $filter, triSkins, $window, $rootScope, $scope, SettingModel, Clique, TransactionModel) {
        var vm = this;
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
        $scope.cancel = function () {
            //$scope.printDialog();
            $mdDialog.hide();
        }

        $scope.submit = function () {
            $scope.showProgress = true;
            $scope.disabledSubmitButton = true;
            var receiptData = {
                companyInfo: $scope.settings.companyInfo,
                transaction: $scope.settings.transaction,
                contact: $scope.settings.InvoiceContacts,
                receiptType: $scope.settings.receipt_type
            }
            vm.promise = TransactionModel.sendReceipt(receiptData);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {

                    Clique.showToast(response.statusmessage, 'bottom right', 'success');

                    $scope.showProgress = false;
                    $scope.openEmailReceipt = false;
                    $mdDialog.hide();
                } else {

                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    $scope.showProgress = false;
                }

            });
        }

        ////////////////

    }


})();
