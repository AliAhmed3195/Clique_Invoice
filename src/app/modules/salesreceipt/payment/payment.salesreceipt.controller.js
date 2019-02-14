(function ()
{
    'use strict';

    angular
        .module('salesreceipt')
        .controller('PaymentSaleReceiptController', PaymentSaleReceiptController)
        .filter
          ( 'range'
          , function() {
              var filter =
                function(arr, lower, upper) {
                  for (var i = lower; i <= upper; i++) arr.push(i)
                  return arr
                }
              return filter
            }
        )
        .directive
          ( 'creditCardType'
          , function(){
              var directive =
                { require: 'ngModel'
                , link: function(scope, elm, attrs, ctrl){
                    ctrl.$parsers.unshift(function(value){
                      scope.ccinfo.type =
                        (/^5[1-5]/.test(value)) ? "master"
                        : (/^4/.test(value)) ? "visa"
                        : (/^3[47]/.test(value)) ? 'amex'
                        : (/^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))/.test(value)) ? 'discover'
                        : undefined
                      ctrl.$setValidity('invalid',!!scope.ccinfo.type)
                      return value
                    })
                  }
                }
              return directive
              }
        )
        .directive('autoFocus', function($timeout) {
            return {
                restrict: 'AC',
                link: function(_scope, _element) {
                    $timeout(function(){

                        _element[0].focus();
                    }, 0);
                }
            };
        });

    function PaymentSaleReceiptController($window,$scope, $rootScope,$mdDialog,SettingModel,InvoiceModel,$timeout,$locale,Clique,printer,$state,triBreadcrumbsService,dataService,VantivTriPOSiPP350,$filter)
    {

        $scope.innerHeight=$window.innerHeight+0;
        var vm=this;


        var x2js = new X2JS();

        $scope.currentYear = new Date().getFullYear();
        $scope.currentMonth = new Date().getMonth() + 1;
        $scope.months = $locale.DATETIME_FORMATS.MONTH;
        $scope.cardlogos=[
            {id:'visa',title:'Visa',src:"visa.png"},
            {id:'master',title:'Master',src:"mastercard.png"},
            {id:'discover',title:'Discover',src:"discover.png"},
            {id:'amex',title:'Amex',src:"amex.png"},
        ];
        $scope.paymentMode='creditcard';
        //$scope.paymentMode='ach';
        $scope.ccinfo = {type:undefined}
        $scope.showProgress=false;
        $scope.totalAmount=$scope.invoice.TotalAmt;
        $scope.isAmountInvalid=false;
        $scope.disabledChargeButton=false;
        $scope.showSwiperBox=false;
        $scope.invoiceIds=[];    //{}
        $scope.invoiceAmount=[];
        $scope.payform={};
        $scope.declined_message="";
        //$scope.declined_message="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries";
        $scope.companyInfo={};
        $scope.isPaymentSuccess=false;
        $scope.transactionResponse={};
        //$scope.pparams=pparams;
        $scope.ccprofiles={};
        //$scope.ccprofile={};
        $scope.ccprofile=JSON.parse('{"profile_id":0, "last_digits":"0"}');
        $scope.profile_id={};
        $scope.usedCardProfile=false;
        $scope.openEmailReceipt=false;
        //echeck
        $scope.requiredAccountNo=false;
        $scope.requiredBankaba=false;
        $scope.requiredAccountName=false;

        //creditcard
        $scope.requiredMonthField=true;
        $scope.requiredYearField=true;
        $scope.requiredCreditCardNumber=true;
        $scope.requiredCardHolderName=true;


        $scope.ccPattern=/^[0-9]+$/;

        /* Bolt Confuguration*/
        $scope.boltProcessStatus="";
        $scope.boltToken="";
        $scope.enableBolt=false;


        $scope.activePaymentMethods={
          creditcard:false,
          ach:false,
          bolt:false,
          tripos_ipp350:false,
          cash:false
        };

        $scope.boltConfig={
          auth:'',
          merchant_id:'',
          hsn:''
        };

        $scope.triPOSiPP350={
          developer_key:'',
          developer_secret:'',
          sevice_address:''
        };

		// fetch all settings
		getSettings();
		function getSettings() {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function(response) {
                if (response.statuscode == 0) {
                    $scope.setting=response.data;
                } else {
                }
            });
        }


        //debugger;
        if($scope.paymentInfo.configuration.hasOwnProperty('hardware')){

          //triPOSiPP350
          if($scope.paymentInfo.configuration.hardware.hasOwnProperty('triposipp350')){
                $scope.activePaymentMethods.tripos_ipp350=true;

                VantivTriPOSiPP350.config.serviceAddress=$scope.paymentInfo.configuration.hardware.triposipp350.service_address;
                VantivTriPOSiPP350.config.tpAuthorizationCredential=$scope.paymentInfo.configuration.hardware.triposipp350.developer_key;
                VantivTriPOSiPP350.config.tpAuthorizationSecret=$scope.paymentInfo.configuration.hardware.triposipp350.developer_secret;
                VantivTriPOSiPP350.config.application_id=parseInt($scope.paymentInfo.configuration.ApplicationID)

                //Get Lane Information
                $timeout(function(){
                   $scope.tripos_searchlane_progress=true;
                   VantivTriPOSiPP350.getLaneInfo(VantivTriPOSiPP350.config,function(res){
                      $scope.tripos_searchlane_progress=false;
                      var response=res.data;
                      $scope.triPOSLaneInfo=response;
                      $scope.triPOSLaneInfo._hasErrors;
                      if($scope.triPOSLaneInfo._hasErrors==true){
                        $scope.triPOSLaneInfo.errorMessage=response._errors[0].developerMessage;
                      }else{
                        $scope.showtriPOSLaneInfo=true;
                      }
                    });
                },2000);
            }
          //eof triPOSiPP350


          //Bolt CardConnect
          if($scope.paymentInfo.configuration.hardware.hasOwnProperty('bolt')){
              $scope.enableBolt=true;
              $scope.activePaymentMethods.bolt=true;

              $scope.boltConfig.auth=$scope.paymentInfo.configuration.hardware.bolt.auth;
              $scope.boltConfig.merchant_id=$scope.paymentInfo.configuration.hardware.bolt.merchant_id;


              var userInfo=Clique.getUserInfo();
              var user_id;
              if(userInfo!=null)
              if(userInfo.id!=null || userInfo.id!=undefined ){
                  user_id=userInfo.id;
              }

              //get user terminal////

              if($scope.paymentInfo.configuration.hardware.bolt.hasOwnProperty('terminals')){
                var terminals=$scope.paymentInfo.configuration.hardware.bolt.terminals;
                var fetchTerminals = true;
                if(user_id!=null){
                     angular.forEach(terminals, function(userData, terminal_id){
                        if(fetchTerminals) {
                          //console.log(userData.users);
                          var users=userData.users;
                          if(users.indexOf(user_id.toString()) !== -1) {
                              $scope.boltConfig.hsn=terminal_id;
                              fetchTerminals=false;
                          }
                        }
                    });
                }

              }
          }
        }
        /* Eof Bolt Confuguration*/

        switch($scope.paymentInfo.type){

            case "cardconnect":
                $scope.paymentMode='creditcard';
                $scope.activePaymentMethods.creditcard=true;
                $scope.activePaymentMethods.cash=false;
                if($scope.paymentInfo.hasOwnProperty('configuration')){
                  if($scope.paymentInfo.configuration.hasOwnProperty('supported_methods')){
                    if($scope.paymentInfo.configuration.supported_methods.hasOwnProperty('ach')){
                      $scope.activePaymentMethods.ach=$scope.paymentInfo.configuration.supported_methods.ach;
                    }
                  }
                }


            break;

            case "vantiv":
              if($scope.activePaymentMethods.tripos_ipp350)
                $scope.paymentMode='tripos_ipp350';
              else
                $scope.paymentMode='cash';

                $scope.activePaymentMethods.cash=true;

            break;

            case "paypal":
               $scope.paymentMode='cash';
               $scope.activePaymentMethods.cash=true;
            break;
         }


        $scope.changePaymentMode=function(type){

            $scope.ccprofile=JSON.parse('{"profile_id":0, "last_digits":"0"}');
            $scope.paymentMode=type;
            $scope.UpdateCCFields({"profile_id":0});

            switch(type){

              case "ach":

                 $scope.requiredAccountNo=true;
                 $scope.requiredBankaba=true;
                 $scope.requiredAccountName=true;

                 $scope.requiredMonthField=false;
                 $scope.requiredYearField=false;
                 $scope.requiredCreditCardNumber=false;
                 $scope.requiredCardHolderName=false;

              break;

              case "creditcard":

                  $scope.requiredAccountNo=false;
                  $scope.requiredBankaba=false;
                  $scope.requiredAccountName=false;


                  $scope.requiredMonthField=true;
                  $scope.requiredYearField=true;
                  $scope.requiredCreditCardNumber=true;
                  $scope.requiredCardHolderName=true;

              break;
            }
         }


        //fetch settng///
        $scope.promise = SettingModel.GetCompanyInfo();
        $scope.promise.then(function(response){
            if(response.statuscode==0){
                $scope.companyInfo=response.data;
            }
        });

        vm.customer_id=$scope.invoice.CustomerRef.value;

        //caculate total amount
        //$scope.totalAmount=100.00;

        //fetch customr profile
        fetchCustomerProfile(vm.customer_id);

        $scope.ProfileDelete=function(){

          var confirm = $mdDialog.confirm()
              .title("Are you sure you want to delete?")
              .textContent('')
              .ariaLabel('Confirmation')
              //.targetEvent(ev)
              .ok('Confirm')
              .cancel('Cancel');
          $mdDialog.show(confirm).then(function() {

            var params={
                id:$scope.profile_id
              };
            $scope.promise = InvoiceModel.ProfileDelete(params);
            $scope.promise.then(function(response){
                  if(response.statuscode==0){
                      Clique.showToast(response.statusmessage, 'bottom right', 'success');
                      //$state.reload();
                      $scope.ccprofile="";
                      $scope.UpdateCCFields(undefined);
                      fetchCustomerProfile(vm.customer_id);

                  }else{
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                  }
              });


          }, function() {

          });
        }

        $scope.UpdateCCFields=function(){

           var profile={};
           if($scope.ccprofile.profile_id!=""){
                profile=$filter('filter')($scope.ccprofiles, {'profile_id': $scope.ccprofile.profile_id})[0];
           }
           $scope.usedCardProfile=false;


           $scope.payform={
                    cc2:'',
                    cardnumber:"",
                    cardholder:"",
                    streetaddress:'',
                    zipcode:'',
                    bankaba:'',
                    account:'',
                    name:'',
                };

            if(profile.profile_id!=0 && profile.profile_id!=undefined){
                $scope.profile_id=profile.profile_id;
                $scope.payform={
                    cardnumber:"xxxxxxxxxxxx"+profile.last_digits,
                    cardholder:profile.cardholder_name,
                    bankaba:"xxxxxxxxxxxx"+profile.last_digits,
                    account:"xxxxxxxxxxxx",
                    name:profile.cardholder_name,

                };

                $scope.ccinfo = {type:angular.lowercase(profile.card_type)};
                $scope.usedCardProfile=true;

                $scope.requiredMonthField=false;
                $scope.requiredYearField=false;
                //$scope.ccPattern=/^[a-zA-Z0-9]*$/;
                $scope.ccPattern=/^[a-zA-Z0-9]*$/;


           }else{

                if($scope.paymentMode=='creditcard'){
                    $scope.requiredMonthField=true;
                    $scope.requiredYearField=true;
                    $scope.requiredAccountNo=false;
                    $scope.requiredBankaba=false;
                }else if($scope.paymentMode=='ach'){

                    $scope.requiredMonthField=false;
                    $scope.requiredYearField=false;

                    $scope.requiredAccountNo=true;
                    $scope.requiredBankaba=true;
                }
                //$scope.ccPattern=/[0-9-()]*[1-9][0-9-()]*/;
                $scope.ccPattern=/^[0-9]+$/;
                //$scope.ccPattern=/^[0-9]+$/;
                //$scope.ccPattern=/^(?=.*?[1-9])[0-9()-]+$/;

            }
        }
        $scope.submit = function(mode) {
            Sale(mode);
        };
        $scope.processBolt=function(){

                $scope.disabledChargeButton=true;
                var ChargeAmount=parseFloat($scope.totalAmount);
                $scope.showProgress=true;
                $scope.boltProcessStatus="Connecting Bolt P2PE......."

                var bolt_type=localStorage.getItem('bolt_type');

                var params={
                  auth:$scope.boltConfig.auth,
                  merchant_id:$scope.boltConfig.merchant_id,
                  hsn:$scope.boltConfig.hsn,
                  amount:ChargeAmount,
                  type:(bolt_type==undefined || null) ? 'swipe' : bolt_type
                };

                $scope.promise = InvoiceModel.BoltReadCard(params);
                $scope.promise.then(function(response){
                    if(response.statuscode==0){
                          $scope.boltToken=response.data.token;
                           $scope.boltProcessStatus="Process to CardConnect......"
                           Sale('bolt');
                           //$scope.CardConnectTokenAuthorize(token);

                    }else{
                      $scope.boltProcessStatus=response.statusmessage
                      $scope.showProgress=false;
                      $timeout(function(){
                        $scope.boltProcessStatus="";
                        $scope.disabledChargeButton=false;
                      },5000);
                    }

                });
        }
         $scope.processTriPOSiPP350=function(){
          $scope.disabledChargeButton=true;
          $scope.showProgress=true;
          $scope.triPOSSaleInfo="";
          var ChargeAmount=parseFloat($scope.totalAmount);
          var laneId=parseInt($scope.triPOSLaneInfo.ipLanes[0].laneId);
          var params=
              {
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
                  CheckForDuplicateTransactions: true,
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
                ticketNumber: "",
                tipAmount: null
            };

            //make sale request on device
             VantivTriPOSiPP350.makeSaleRequest(VantivTriPOSiPP350.config,params,function(res){
                $scope.showProgress=false;
                $scope.disabledChargeButton=false;
                var response=res.data;
                $scope.triPOSSaleInfo=response;

                if($scope.triPOSSaleInfo._hasErrors==true){
                  $scope.triPOSSaleInfo.errorMessage=response._errors[0].developerMessage;
                  $timeout(function(){
                        $scope.triPOSSaleInfo="";
                      },5000);

                }else{

                    Sale('triposipp350');
                }

              });
        }
        function Sale(mode){
            ////console.log($scope.ccprofile);
            $scope.disabledChargeButton=true;
            $timeout(function(){
                $scope.declined_message="";
            });
            $scope.showProgress=true;
            var paymentObj={};
            var customer_email;
            if($scope.invoice.BillEmail!=null){
                customer_email=$scope.invoice.BillEmail.Address;
            }
           if(mode=='creditcard'){
                if($scope.usedCardProfile){

                    paymentObj = {
                         paymentinfo: {
                             Amount: $scope.totalAmount,
                             Streetaddress: $scope.payform.streetaddress,
                             Zipcode: $scope.payform.zipcode,
                             TransType: 'profile_sale',
                             Type: 'salesreceipt',
                             ProfileId:$scope.profile_id,
                             Custom: {
                                 CustomerRef: {
                                     Id: $scope.invoice.CustomerRef.value,
                                     Name: $scope.invoice.CustomerRef.name,
                                     Email: customer_email
                                 },
                                 SalesReceipt: $scope.invoice
                             }
                         }
                     };

                }
                else{

                    paymentObj = {
                        paymentinfo: {
                            Amount: $scope.totalAmount,
                            Streetaddress: $scope.payform.streetaddress,
                            Zipcode: $scope.payform.zipcode,
                            TransType: 'sale',
                            Type: 'salesreceipt',
                            Cardinfo: {
                                Cardholder: $scope.payform.cardholder,
                                CreditCardNumber: $scope.payform.cardnumber,
                                Month: $scope.payform.months,
                                Year: $scope.payform.years,
                                CCV2: $scope.payform.cc2,
                                CardType:$scope.ccinfo.type,
                                CreateCardProfile: $scope.payform.card_profile
                            },
                            Custom: {
                                CustomerRef: {
                                    Id: $scope.invoice.CustomerRef.value,
                                    Name: $scope.invoice.CustomerRef.name,
                                    Email: customer_email
                                },
                                SalesReceipt: $scope.invoice
                            }
                        }
                    };
                }
            }else if(mode=='cash'){
                paymentObj = {
                         paymentinfo: {
                             Amount: $scope.totalAmount,
                             Streetaddress: $scope.payform.streetaddress,
                             Zipcode: $scope.payform.zipcode,
                             TransType: 'cash',
                             Type: 'salesreceipt',
                             Custom: {
                                 CustomerRef: {
                                     Id: $scope.invoice.CustomerRef.value,
                                     Name: $scope.invoice.CustomerRef.name,
                                     Email: customer_email
                                 },
                                 SalesReceipt: $scope.invoice
                             }
                         }
                     };

            }
            else if(mode=='ach'){
              if($scope.usedCardProfile){

                    paymentObj = {
                         paymentinfo: {
                             Amount: $scope.totalAmount,
                             Streetaddress: $scope.payform.streetaddress,
                             Zipcode: $scope.payform.zipcode,
                             TransType: 'profile_sale',
                             Type: 'salesreceipt',
                             ProfileId:$scope.profile_id,
                             Custom: {
                                 CustomerRef: {
                                     Id: $scope.invoice.CustomerRef.value,
                                     Name: $scope.invoice.CustomerRef.name,
                                     Email: customer_email
                                 },
                                 SalesReceipt: $scope.invoice
                             }
                         }
                     };

                }
                else{
                    paymentObj = {
                              paymentinfo: {
                                  Amount: $scope.totalAmount,
                                  Streetaddress: $scope.payform.streetaddress,
                                  Zipcode: $scope.payform.zipcode,
                                  TransType: 'ach_sale',
                                  Type: 'salesreceipt',
                                  Achinfo: {
                                      account:$scope.payform.account,
                                      name:$scope.payform.name,
                                      bankaba:$scope.payform.bankaba,
                                      CreateCardProfile: $scope.payform.card_profile
                                  },
                                  Custom: {
                                      CustomerRef: {
                                          Id: $scope.invoice.CustomerRef.value,
                                          Name: $scope.invoice.CustomerRef.name,
                                          Email: customer_email
                                      },
                                      SalesReceipt: $scope.invoice
                                  }
                              }
                          };
                }
            }
            else if(mode=='bolt'){

              paymentObj = {
                         paymentinfo: {
                             Amount: $scope.totalAmount,
                             TransType: 'bolt',
                             Type: 'salesreceipt',
                             Token:$scope.boltToken,
                             Custom: {
                                 CustomerRef: {
                                     Id: $scope.invoice.CustomerRef.value,
                                     Name: $scope.invoice.CustomerRef.name,
                                     Email: customer_email
                                 },
                                 SalesReceipt: $scope.invoice
                             }
                         }
                     };
            }
            else if(mode=='triposipp350'){
              var processorRawResponse="";
              var payment_type="";

              var xml2json=x2js.xml_str2json($scope.triPOSSaleInfo._processor.processorRawResponse);
              payment_type=($scope.triPOSSaleInfo.paymentType).toLowerCase();
              if(payment_type=='credit'){
                processorRawResponse=xml2json.CreditCardSaleResponse.Response;
              }else if(payment_type=='debit'){
                processorRawResponse=xml2json.DebitCardSaleResponse.Response;
              }else if(payment_type=='gift'){
                processorRawResponse=xml2json.GiftCardSaleResponse.Response;
              }
              var cardNumber=$scope.triPOSSaleInfo.accountNumber;
              var last4Digits = cardNumber.substr(cardNumber.length - 4);
              var transStatus;
              var reason="";
              var ResponseCode="";
              if($scope.triPOSSaleInfo.isApproved==true){
                transStatus="approved";
                ResponseCode=$scope.triPOSSaleInfo._processor.hostResponseCode+"/"+$scope.triPOSSaleInfo._processor.hostResponseMessage;
              }else{
                transStatus="declined";
                reason=$scope.triPOSSaleInfo._processor.processorResponseMessage;
                ResponseCode=$scope.triPOSSaleInfo._processor.expressResponseCode+"/"+$scope.triPOSSaleInfo._processor.expressResponseMessage;
              }

              paymentObj = {
                         paymentinfo: {
                             Amount: $scope.totalAmount,
                             TransType: 'triposipp350_'+payment_type,
                             Type: 'salesreceipt',
                             Custom: {
                                 CustomerRef: {
                                     Id: $scope.invoice.CustomerRef.value,
                                     Name: $scope.invoice.CustomerRef.name,
                                     Email: customer_email
                                 },
                                 ProcessorInfo:{
                                    processorRawResponse:{
                                      RawResponse:processorRawResponse,
                                      MerchantId:$scope.triPOSSaleInfo.merchantId,
                                      TerminalId:$scope.triPOSSaleInfo.terminalId,
                                      ApprovalNumber:$scope.triPOSSaleInfo.approvalNumber,
                                      EntryMode:$scope.triPOSSaleInfo.entryMode,
                                      paymentType:$scope.triPOSSaleInfo.paymentType,
                                      ResponseCode:ResponseCode,
                                      PinVerified:$scope.triPOSSaleInfo.pinVerified
                                    },
                                    transactionId:$scope.triPOSSaleInfo.transactionId,
                                    CardHolder:$scope.triPOSSaleInfo.cardHolderName,
                                    CreditCardNumber:cardNumber,
                                    CardType:$scope.triPOSSaleInfo.cardLogo,
                                    last4Digits:last4Digits,
                                    TransStatus:transStatus,
                                    StatusMessage:reason
                                  },
                                 SalesReceipt: $scope.invoice
                             }
                         }
                     };
            }

            $scope.promise = InvoiceModel.CCSale(paymentObj);
            $scope.promise.then(function(response) {
                $scope.disabledChargeButton=false;
                if(response.statuscode == 0){
                    $scope.IsPaidInvoice=true;
                    $scope.totalBalance=0;
                    $scope.payform = {};

                    $scope.transactionResponse=response.data;

                    $scope.showEmailDialog=false;
                    if($scope.transactionResponse.status=='declined'){
                      Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    }
					if($scope.setting.InvoiceReceiptDialog==false && $scope.transactionResponse.status!='declined' ){
						Clique.showToast(response.statusmessage, 'bottom right', 'success');
						 $state.reload();
					}

					if($scope.setting.InvoiceReceiptDialog==true){
					 $scope.isPaymentSuccess=true;
                   	 $scope.printDialog();
					}
                }
                else if(response.statuscode==1){
                   $scope.boltProcessStatus="";
                    $timeout(function(){
                        $scope.declined_message=response.statusmessage;
                        $scope.checkoutForm.$setUntouched();
                        $scope.checkoutForm.$setPristine();
                    });
                    $scope.isPaymentSuccess=false;
                    $scope.transactionResponse={};
                }
                $scope.showProgress=false;
            });
        }
        function fetchCustomerProfile(customer_id){
                $scope.ccprofiles={};
                $scope.showProfileProgress=true;
                $scope.promise = InvoiceModel.ProfileGet({customer_id:customer_id});
                $scope.promise.then(function(response){
                    if(response.statuscode==0){
                        if(response.data.total_item > 0){
                            $scope.ccprofiles=response.data.item;
                            $scope.paymentForm={
                                CreditCardForm:true,
                                ProfileDropForm:true
                            };

                        }else{
                            $timeout(function(){
                                    $scope.paymentForm={
                                            CreditCardForm:true,
                                            ProfileDropForm:false
                                    };
                                });
                        }
                        if($scope.ccprofiles.length > 0){
                          $scope.ccprofiles.splice(0, 0, JSON.parse('{"profile_id":0, "last_digits":"0"}'));
                        }
                    }
                    $scope.showProfileProgress=false;
                });
        }
        $scope.print=function(){
            var receipt_template="transaction.print.html";
            var isTriposipp350 = ($scope.transactionResponse.trans_type).search("triposipp350");
            if(isTriposipp350==0){
                receipt_template="transaction.triposipp350.print.html";
            }

            printer.print('assets/'+receipt_template, {transactionResponse:$scope.transactionResponse,companyInfo:$scope.companyInfo});

        }

       $scope.printDialog=function() {

            var receipt_template="transaction.print.html";
            var isTriposipp350 = ($scope.transactionResponse.trans_type).search("triposipp350");
            if(isTriposipp350==0){
                ///var transData=$scope.transactionResponse;
                //var payment_data=transData.payment_data.replace(/\'/g, '"');
                //transData.payment_data_json=JSON.parse(payment_data);
                //$scope.transactionResponse=transData;
                receipt_template="transaction.triposipp350.print.html";
            }


            $mdDialog.show({
                scope               : $scope,
                preserveScope       : true,
                parent: angular.element(document.body),
                //templateUrl         : 'app/modules/invoice/payment/trans.receipt.html',
                templateUrl         : 'assets/'+receipt_template,
                clickOutsideToClose : true,
                fullscreen          : true,
                controller          : DialogController
            }).then(function() {
                    //console.log("printDialog -> then");
                }, function() {
                    //console.log("printDialog -> else");
                    //if($scope.isPaymentSuccess==true && $scope.openEmailReceipt==false){
                      if($scope.openEmailReceipt==false){
                        //$state.go("triangular.salesreceipt");
                        $state.reload();
                    }
                });

        }
        $scope.sendReceiptDialog = function() {
          console.log("i am in sendReceiptDialog");
            $mdDialog.show({
                controller: ReceiptController,
                templateUrl: 'app/modules/statement/sendConfirmationDialog.html',
                parent: angular.element(document.body),
                scope: $scope.$new(),
                //targetEvent: ev,
                clickOutsideToClose: true
            })
            .then(function(answer) {
              $scope.openEmailReceipt=false;
              $scope.printDialog();
            }, function() {
              $scope.openEmailReceipt=false;
              $scope.printDialog();
            });
        };
        $scope.emailReceipt=function(transData,tranType){

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
                title:"Send Reciept"
            };
            $scope.openEmailReceipt=true;
            var customer_email=transData.customer_email;
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function(response) {
                if (response.statuscode == 0) {
                    $scope.settings = response.data;
                    $scope.settings.title="Send Receipt";
                    $scope.settings.transaction=transData;
                    $scope.settings.companyInfo=$scope.companyInfo.company;
                    $scope.settings.receipt_type=tranType;
                    $scope.settings.InvoiceContacts.to_email = [];
                    if (customer_email != "") {
                        $scope.settings.InvoiceContacts.to_email.push(customer_email);
                    }
                    $scope.sendReceiptDialog();
                }
            });
        };
        $scope.cancel = function() {
            //$state.go("triangular.salesreceipt");
            $mdDialog.hide();
        };

        $scope.showSwipe=function(){

           $scope.showSwiperBox=true;
           $scope.swipeInfo="";
           $scope.showStatic=true;
           $scope.showAnimation=false;
           $scope.swipeText="Please swipe your card now.";
           //angular.element('swipeInfo').focus();
           document.getElementById("swipeInfo").focus();
           //document.getElementById("#swipeInfo").focus();
           /*var position = $mdPanel.newPanelPosition().absolute().center();

            var config =
            {
                scope: $scope,
                attachTo: angular.element(document.body),
                controller: SwipeCardController,
                templateUrl: 'app/modules/salesreceipt/payment/swiper.panel.tmpl.html',
                hasBackdrop: true,
                panelClass: 'demo-dialog-example',
                //position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true
            };
            $mdPanel.open(config);*/


             /*var position = $mdPanel.newPanelPosition().absolute().center();

              var config = {
                attachTo: angular.element(document.body),
                controller: SwipeCardController,
                //controllerAs: 'ctrl',
                disableParentScroll: false,
                templateUrl: 'app/modules/salesreceipt/payment/swiper.panel.tmpl.html',
                hasBackdrop: true,
                panelClass: 'demo-dialog-example',
                position: position,
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true
              };

              $mdPanel.open(config);*/

              /*$mdToast.show({
                      scope: $scope,
                      hideDelay   : 3000,
                      position    : 'center center',
                      controller  : SwipeCardController,
                      templateUrl : 'app/modules/salesreceipt/payment/swiper.panel.tmpl.html'
                    });*/


       }

       /*Swipe Methods*/
        $scope.swipeText="Please swipe your card now.";
        $scope.swipeInfo="";
        $scope.showSwiperProgress=false;
        $scope.showStatic=true;
        $scope.showAnimation=false;
        $scope.cancel = function() {
            $mdDialog.hide();
        };

        $scope.handle_swipe=function() {
            $scope.swipeText="Please swipe your card now.";
            $timeout(function(){
              submitswipe()
            },400);

           /* //console.log($scope.swipeInfo);
            if (swipe_timer != null) {
                clearTimeout(swipe_timer);
            }
            swipe_timer = setTimeout("", 1000);
            //document.getElementById("h3_pleaseswipe").innerHTML = "Please wait...";*/
        }
        function hide_swipe() {
            //console.log("Hide Swipe");
            $scope.swipeText="Please swipe your card now.";
            $scope.showSwiperBox=false;
            //mdPanelRef && mdPanelRef.close();
        }

        function swipe_fail() {
             //console.log("Swipe Fail");
            $scope.showSwiperProgress=true;
            $timeout(function(){
              $scope.swipeText="Card swipe failed. Please re-swipe.";
              $scope.showSwiperProgress=false;
              $scope.swipeInfo="";
            },600);

        }


        function checknumber(x) {
            var testresult=false;
            var anum = /(^\d+$)|(^\d+\.\d+$)|(^[0-9 ]+$)/;
            /*if (anum.test(x))
                testresult = true;
            else {
                testresult = false;
            }
            return (testresult);*/
            ////console.log(anum.test(x));
            return true;
        }

        function submitswipe() {
            //console.log("Submit Swipe ");
            $scope.swipeText="Please swipe your card now.";
            var strSwipe = $scope.swipeInfo;
            var arr = strSwipe.split("^");
            if (strSwipe.indexOf("&") > 0) {
                var cHat = 0, cAmp = 0;
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
            }
            else {
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
                  var currentYear=new Date().getFullYear();
                  currentYear=currentYear.toString();
                  var expYear=currentYear.substring(0, 2)+expYearTemp;


            }


             $scope.payform={
                    cc2:'',
                    cardnumber:"",
                    cardholder:"",
                    months:'',
                    years:''
                };

            $scope.payform={
                    cc2:'',
                    cardnumber:ccNbr,
                    cardholder:ccname,
                    months:expMon,
                    years:expYear,
                    track2:$scope.swipeInfo
                };

            //$scope.swipeInfo="";

            $scope.showStatic=false;
            $scope.showAnimation=true;
            $scope.swipeText="Please swipe your card now.";
            $timeout(function(){
                hide_swipe();
            },2400);


        }


    }

    function DialogController($window,$scope, $mdDialog){

    }
    function ReceiptController($timeout, $mdDialog, $filter, triSkins, $window, $rootScope, $scope, SettingModel, Clique,TransactionModel) {
            var vm = this;
            $scope.disabledSubmitButton = false;
            $scope.showCCSIcon = 'zmdi zmdi-account-add';
            $scope.showCCS = false;

            $scope.toggleCCS = function() {
                $scope.showCCS = !$scope.showCCS;
                $scope.showCCSIcon = $scope.showCCS ? 'zmdi zmdi-account' : 'zmdi zmdi-account-add';
            }


            $scope.cancel = function() {
                $mdDialog.hide();
            }
            $scope.validateChip = function($chip, type) {
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
            $scope.cancel = function() {
              $mdDialog.hide();
            }

            $scope.submit = function() {
                $scope.showProgress = true;
                $scope.disabledSubmitButton=true;
                var receiptData={
                    companyInfo:$scope.settings.companyInfo,
                    transaction:$scope.settings.transaction,
                    contact:$scope.settings.InvoiceContacts,
                    receiptType:$scope.settings.receipt_type
                }
                vm.promise = TransactionModel.sendReceipt(receiptData);
                vm.promise.then(function(response) {
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
    function SwipeCardController($window,$scope,$timeout) {
        //this._mdPanelRef = mdPanelRef;

        $scope.swipeText="Please swipe your card now.";
        $scope.swipeInfo="";
        $scope.showSwiperProgress=false;
        $scope.showStatic=true;
        $scope.showAnimation=false;
        $scope.cancel = function() {
            //$mdDialog.hide();
        };

        $scope.handle_swipe=function() {
            $scope.swipeText="Please swipe your card now.";
            $timeout(function(){
              submitswipe()
            },400);

           /* //console.log($scope.swipeInfo);
            if (swipe_timer != null) {
                clearTimeout(swipe_timer);
            }
            swipe_timer = setTimeout("", 1000);
            //document.getElementById("h3_pleaseswipe").innerHTML = "Please wait...";*/
        }
        function hide_swipe() {
            //console.log("Hide Swipe");
            $scope.swipeText="Please swipe your card now.";
            //mdPanelRef && mdPanelRef.close();
        }

        function swipe_fail() {
             //console.log("Swipe Fail");
            $scope.showSwiperProgress=true;
            $timeout(function(){
              $scope.swipeText="Card swipe failed. Please re-swipe.";
              $scope.showSwiperProgress=false;
              $scope.swipeInfo="";
            },600);

        }


        function checknumber(x) {
            var testresult=false;
            var anum = /(^\d+$)|(^\d+\.\d+$)|(^[0-9 ]+$)/;
            /*if (anum.test(x))
                testresult = true;
            else {
                testresult = false;
            }
            return (testresult);*/
            ////console.log(anum.test(x));
            return true;
        }

        function submitswipe() {
            //console.log("Submit Swipe ");
            $scope.swipeText="Please swipe your card now.";
            var strSwipe = $scope.swipeInfo;
            var arr = strSwipe.split("^");
            if (strSwipe.indexOf("&") > 0) {
                var cHat = 0, cAmp = 0;
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
            }
            else {
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
                  var currentYear=new Date().getFullYear();
                  currentYear=currentYear.toString();
                  var expYear=currentYear.substring(0, 2)+expYearTemp;


            }


             $scope.payform={
                    cc2:'',
                    cardnumber:"",
                    cardholder:"",
                    months:'',
                    years:''
                };

            $scope.payform={
                    cc2:'',
                    cardnumber:ccNbr,
                    cardholder:ccname,
                    months:expMon,
                    years:expYear,
                    track2:$scope.swipeInfo
                };

            //$scope.swipeInfo="";

            $scope.showStatic=false;
            $scope.showAnimation=true;
            $scope.swipeText="Please swipe your card now.";
            $timeout(function(){
                hide_swipe();
            },2400);


        }
    }




})();
