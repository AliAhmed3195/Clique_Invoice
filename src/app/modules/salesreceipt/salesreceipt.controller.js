(function() {
    'use strict';
    angular
        .module('salesreceipt')
        .controller('SalesReceiptController', Controller)
        .filter('customInfo', function() {

            return function(input, optional1) {
            var output;
            if(input!=""){
                output=input+' '+optional1;
            }
            return output;
          }
        });

        function Controller(triLayout,$window,triLoaderService,$filter,$log,$scope, $timeout, $interval, $q, $http, $compile, Clique, InvoiceModel, SettingModel, $mdDialog, $mdToast, $element, $stateParams, triBreadcrumbsService, $state, $mdBottomSheet, $rootScope, $mdSidenav,$anchorScroll,$location,dataService,$mdPanel,helper,Countries) {


        //slide left panel

        $scope.showApiProgress=true;
        $scope.apiProgressValue=9;
        $scope.showInvoiceContent=false;



        triBreadcrumbsService.reset();
        var breadcrumbs = [{
            active: false,
            icon: "zmdi zmdi-chart",
            name: 'Create Invoice.' ,
            priority: 2,
            state: "triangular.invoice-list",
            template: "app/triangular/components/menu/menu-item-link.tmpl.html",
            type: "link",

        }];
        angular.forEach(breadcrumbs, function(breadcrumb, key) {
            triBreadcrumbsService.addCrumb(breadcrumb);
        });


        var vm = this;


        $scope.sortableOptions={'ui-floating': true};
        $scope.showRecurringOptions=false;
        $scope.createInvoiceBtnTitle="Create Sales Receipt";


        var invoice_data= JSON.parse('{"TotalAmt":0.00,"TxnDate":"","Line":[{"Amount":0.00,"DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"ItemRef":{"value":"","name":""},"Qty":1}},{"Amount":0.00,"DetailType":"DiscountLineDetail","DiscountLineDetail":{"PercentBased":true,"DiscountPercent":0.00,"DiscountAccountRef":{}}},{"Amount":0.00,"DetailType":"SubTotalLineDetail","SubTotalLineDetail":{}}],"TxnTaxDetail":{"TxnTaxCodeRef":{"value":""},"TotalTax":0.00,"TaxLine":[{"Amount":0.00,"DetailType":"TaxLineDetail","TaxLineDetail":{"TaxRateRef":{"value":"0"},"PercentBased":true,"TaxPercent":0,"NetAmountTaxable":0.00}}]},"CustomerRef":{"value":"0","name":""},"CustomerMemo":{"value":""},"SalesTermRef":{"value":"0"},"DueDate":"","BillEmail":{"Address":""}}');
        var invoice_id = "";
        $scope.invoice = invoice_data;
        $scope.customers = [];
        $scope.items = [];
        $scope.categories=[];

        $scope.preferences;
        $scope.invoiceTerm;
        $scope.discountTypes = [{
                value: false,
                text: 'Discount Value'
            },
            {
                value: true,
                text: 'Discount Percent'
            },
        ];

        $scope.lastSalesReceiptDocNumber="";


        initCustomerInfo();
        vm.simulateQuery=true;

        //search Customer Fields
        vm.selectedCustomer  = null;
        vm.searchCustomer    = null;
        vm.customerSearch   = customerSearch;
        vm.selectedCustomerChange=selectedCustomerChange;

        //search item fuelds
        vm.selectedProduct=[];
        vm.searchProduct=[];
        vm.itemSearch   = itemSearch;
        vm.selectedItemChange=selectedItemChange;
        vm.getTotalItems=getTotalItems;
        $scope.showProgress=false;

        //$scope.invoiceSno=1;
        vm.sno=1;
        vm.InvoiceSno=InvoiceSno;

        triLayout.setOption('sideMenuSize', 'icon');

        $scope.taxRate = [];
        $scope.taxCode = [];
        $scope.taxRateDetail = [];

         $scope.$watch('apiProgressValue',
          function(newValue, oldValue) {
               if(newValue>=100){
                    $scope.showApiProgress=false;
                    $scope.showInvoiceContent=true;
                    setTaxRateDetails();

                    if($scope.preferences.SalesFormsPrefs.CustomTxnNumbers==true){
                        $scope.invoice.DocNumber=helper.getAutoIncrementInvoiceNo($scope.lastSalesReceiptDocNumber);
                    }
                }
          }
        );


        // ******************************
        // customer methods
        // ******************************
        function customerSearch (query) {
            var results = query ? $scope.customers.filter( createFilterFor(query) ) : $scope.customers,
            deferred;
            if (vm.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(customer) {

            var DisplayName=angular.lowercase(customer.DisplayName).toString();
            return ((DisplayName).indexOf(lowercaseQuery) === 0);
          };
        }

        function initCustomerInfo(){
            vm.customerInfo={
                id:'',
                name:'',
                email:'',
                phone:'',
                website:'',
                company_name:'',
                notes:'',
                billing:{
                    line1:'',
                    city:'',
                    countryCode:'',
                    postal_code:'',
                    country:''

                },
                shipping:{
                    line1:'',
                    city:'',
                    countryCode:'',
                    country:''
                }
            }
        }
        function selectedCustomerChange(customer){
                if(customer!=null || customer!=undefined){
                     initCustomerInfo();
                     vm.customerInfo.id=customer.Id;
                     vm.customerInfo.name=customer.DisplayName;
                     vm.customerInfo.company_name=customer.CompanyName;
                     vm.customerInfo.website=customer.WebAddr!=null ? customer.WebAddr.URI : '';
                     vm.customerInfo.phone=customer.PrimaryPhone!=null ? customer.PrimaryPhone.FreeFormNumber : '';
                     vm.customerInfo.email=customer.PrimaryEmailAddr!=null ? customer.PrimaryEmailAddr.Address : '';

                    if(customer.ShipAddr!=null){
                         vm.customerInfo.shipping.line1=customer.ShipAddr.Line1;
                         vm.customerInfo.shipping.city=customer.ShipAddr.City;
                         vm.customerInfo.shipping.countryCode=customer.ShipAddr.CountrySubDivisionCode;
                         vm.customerInfo.shipping.country=customer.ShipAddr.Country;
                    }
                    if(customer.BillAddr!=null){
                         vm.customerInfo.billing.line1=customer.BillAddr.Line1;
                         vm.customerInfo.billing.city=customer.BillAddr.City;
                         vm.customerInfo.billing.countryCode=customer.BillAddr.CountrySubDivisionCode;
                         vm.customerInfo.billing.postal_code=customer.BillAddr.PostalCode;
                         vm.customerInfo.billing.country=customer.BillAddr.Country;
                    }
                    $scope.showBillingInfo=true;
                    $scope.invoice.CustomerRef.value=customer.Id;
                    $scope.invoice.CustomerRef.name=customer.DisplayName;
                    $scope.invoice.BillEmail.Address=customer.PrimaryEmailAddr!=null ? customer.PrimaryEmailAddr.Address : '';

                    //get Customer profile for Recurring
                    getCustomerCardProfile();

                }

        }

        $scope.$on('add-customer-event', function(ev, customer){
            $scope.customers.push(customer.data);
            vm.selectedCustomer=customer.data;
        });
        $scope.addNewCustomer = function() {
            $mdDialog.show({
                  locals:{
                    customerData: vm.searchCustomer,
                    Countries: Countries
                    },
                  controller: CustomerDialogController,
                  templateUrl: 'app/modules/invoice/createnew/customer.addnew.html',
                  parent: angular.element(document.body),
                  targetEvent: null,
                  clickOutsideToClose:true,
                  fullscreen: true
                })
                .then(function(answer) {
                }, function() {
                });
        }


        // ******************************
        // item methods
        // ******************************
        function itemSearch (query) {
              var results = query ? $scope.items.filter( createFilterForItem(query) ) : $scope.items,
              deferred;
              if (vm.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }
        function createFilterForItem(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(item) {
                var Name=angular.lowercase(item.Name).toString();
                return ((Name).indexOf(lowercaseQuery) === 0);
          };

        }
        function selectedItemChange(item,key){

                 $scope.invoice.Line[key].SalesItemLineDetail.ItemRef.value=item.Id;
                 $scope.invoice.Line[key].SalesItemLineDetail.ItemRef.name=item.FullyQualifiedName;
                 $scope.invoice.Line[key].Description=item.Description;
                 $scope.invoice.Line[key].SalesItemLineDetail.ClassRef.value = item.SalesItemLineDetail.ClassRef.value;
                 $scope.invoice.Line[key].SalesItemLineDetail.UnitPrice=parseFloat(item.UnitPrice);
                 $scope.invoice.Line[key].Amount=parseFloat($scope.invoice.Line[key].SalesItemLineDetail.Qty*$scope.invoice.Line[key].SalesItemLineDetail.UnitPrice);
                 $scope.calculateTotal();
        }
        $scope.addItem = function() {
            var items=$filter('filter')( $scope.invoice.Line, {'DetailType':'SalesItemLineDetail'});
            var totalItem=parseInt(items.length)

            var itemObject={
                Amount: 0,
                Description: "",
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                    ItemRef: {
                        value: "0",
                        name: ""
                    },
                    UnitPrice: 0.00,
                    Qty: 1,
                    TaxCodeRef: {
                        value: "NON"
                    }
                }
            };
            $scope.invoice.Line.splice(totalItem, 0, itemObject);

            //$scope.invoice.Line.push();
        }

        $scope.removeItem = function(item,index) {

            vm.counter--;
            var totalItems=parseInt(getTotalItems());
            if(totalItems > 1)
            {
                $scope.invoice.Line.splice(index, 1);
                vm.selectedProduct.splice(index,1);
                vm.searchProduct.splice(index,1);

            }else{

                vm.selectedProduct.splice(index,1);
                vm.searchProduct.splice(index,1);
            }
            $scope.calculateTotal();
        };

        $scope.$on('add-item-event', function(ev, item){

            $scope.items.push(item.data);
            vm.selectedProduct[item.index]=item.data;
        });

        $scope.addNewItem = function(itemName,index) {
            $mdDialog.show({
                  locals:{itemData: itemName,index:index},
                  controller: ItemDialogController,
                  templateUrl: 'app/modules/invoice/createnew/item.addnew.html',
                  parent: angular.element(document.body),
                  targetEvent: null,
                  clickOutsideToClose:true,
                  fullscreen: true
                })
                .then(function(answer) {
                }, function() {
                });
        }

        function InvoiceSno(){

            return vm.sno++;
        }

        vm.counter=0;
        $scope.getId = function () {
            vm.counter++;
            return vm.counter;
        }
        $scope.calculateTotal = function() {

            var total = 0;
            var tax = 0;
            var discount = 0;
            var amount =0;
            //debugger;


            var subTotalIndex;

            angular.forEach($scope.invoice.Line, function(item, key) {
                switch(item.DetailType){
                    case 'SalesItemLineDetail':
                        amount = item.SalesItemLineDetail.Qty*item.SalesItemLineDetail.UnitPrice;
                        if(amount > 0){
                            total += parseFloat(amount);
                        }

                    break;
                    case 'SubTotalLineDetail':
                        subTotalIndex=key;
                    break;

                }

            });
            ///update subtotal
            $scope.invoice.Line[subTotalIndex]['Amount']=parseFloat(total);
            $scope.calculateTax();
            $scope.calculateDiscount();

            var tax = parseFloat($scope.invoice.TxnTaxDetail.TotalTax);
            var discountIndex=parseInt(getLineTypeIndex('DiscountLineDetail'));
            var discount = parseFloat($scope.invoice.Line[discountIndex].Amount);


            total=total-discount;
            if(tax > 0){
                total=total+tax;
            }


            $scope.invoice.TotalAmt = parseFloat(total);

        }
        function getTotalItems(){
             var i=0
            angular.forEach($scope.invoice.Line, function(item, key) {
                switch(item.DetailType){
                    case 'SalesItemLineDetail':
                         i++;
                    break;
                }
            });
            return i;
        }
        $scope.calculateTax = function() {
            var subTotal = 0;
            angular.forEach($scope.invoice.Line, function(item, key) {
                switch(item.DetailType){
                    case 'SalesItemLineDetail':
                        if(item.SalesItemLineDetail.TaxCodeRef!=null && item.SalesItemLineDetail.TaxCodeRef.value=='TAX'){
                            var amount = item.SalesItemLineDetail.Qty*item.SalesItemLineDetail.UnitPrice;
                            subTotal += parseFloat(amount);
                        }
                    break;
                }

            });

            if (subTotal > 0) {

                var taxCodeInfo="";
                var taxCodeRefId=$scope.invoice.TxnTaxDetail.TaxLine[0].TaxLineDetail.TaxRateRef.value;
                var taxRate;
                var taxRateName="";
                var taxRateValue=0;
                var result=0;

                if(taxCodeRefId > 0){
                    taxCodeInfo=$filter('filter')($scope.taxRateDetail, {'Id':taxCodeRefId})[0];
                    taxRateName=taxCodeInfo.Name;
                    taxRateValue=taxCodeInfo.RateValue;

                    //Getting tax code
                }
                if(taxRateValue > 0){
                    result = parseFloat((subTotal * taxRateValue) / 100);
                }

            }

            if(taxCodeRefId!="0"){
                $scope.invoice.TxnTaxDetail.TxnTaxCodeRef.value=taxCodeRefId;
            }else{
                $scope.invoice.TxnTaxDetail.TxnTaxCodeRef.value="";
            }
            if(taxRateValue > 0){
                $scope.invoice.TxnTaxDetail.TaxLine[0].TaxLineDetail.TaxPercent=taxRateValue;
            }else{
                $scope.invoice.TxnTaxDetail.TaxLine[0].TaxLineDetail.TaxPercent=0;
            }
            if(result > 0){
                $scope.invoice.TxnTaxDetail.TotalTax=result;
                $scope.invoice.TxnTaxDetail.TaxLine[0].Amount=result;
            }else{
                $scope.invoice.TxnTaxDetail.TotalTax=undefined;
                $scope.invoice.TxnTaxDetail.TaxLine[0].Amount=undefined;
            }


        }

        $scope.calculateDiscount = function() {

            var discountIndex=parseInt(getLineTypeIndex('DiscountLineDetail'));
            var discountInfo=$scope.invoice.Line[discountIndex].DiscountLineDetail;
            var isPercentBased=discountInfo.PercentBased;
            var discountValue=0;
            if (isPercentBased) {
                discountValue=parseFloat(discountInfo.DiscountPercent);

            }else{
                discountValue=parseFloat($scope.invoice.Line[discountIndex].Amount);
            }

            var subTotalIndex=parseInt(getLineTypeIndex('SubTotalLineDetail'));
            var subTotal = parseFloat($scope.invoice.Line[subTotalIndex].Amount);

            var discountedAmount;

            if (subTotal > 0) {
                if (isPercentBased) {
                    discountedAmount = parseFloat((subTotal * discountValue) / 100);
                } else {
                    discountedAmount = parseFloat(discountValue);
                    $scope.invoice.Line[discountIndex].DiscountLineDetail.DiscountPercent = "";
                }

                if (discountedAmount > subTotal) {
                    $scope.invoice.Line[discountIndex].Amount = 0.00;
                } else {
                    if(discountedAmount>=0){
                        $scope.invoice.Line[discountIndex].Amount = parseFloat(discountedAmount);
                    }else{
                        $scope.invoice.Line[discountIndex].Amount = 0;
                    }
                }

            } else {
                $scope.invoice.Line[discountIndex].Amount = 0.00;
            }

            //
        }

        function getLineTypeIndex(type){
            var index;
           angular.forEach($scope.invoice.Line, function(item, key) {
                if(item.DetailType==type){
                    index=parseInt(key);

                }
            });
            return index;
        }
        $scope.setTerm=function(){

            var term_id=$scope.invoice.SalesTermRef.value;
            if(term_id!=0){
                var term=$filter('filter')($scope.invoiceTerm, {'Id':term_id})[0];
                var DueDays = term.DueDays;
                var date = new Date();
                var y = date.getFullYear();
                var m = date.getMonth();
                var d = date.getDate();
                if($scope.invoice.TxnDate==""){
                    $scope.invoice.TxnDate = new Date(y, m, d);
                }
                var TxnDate = $scope.invoice.TxnDate;
                $scope.invoice.DueDate = new Date(TxnDate.getFullYear(), TxnDate.getMonth(), TxnDate.getDate()+DueDays);
            }
        }


        $scope.promise = SettingModel.GetPaymentInfo();
        $scope.promise.then(function(response){
            if(response.statuscode==0){
                if(response.data.total_count > 0){
                    $scope.paymentInfo=response.data.items[0];
                    $rootScope.paymentInfo=$scope.paymentInfo;
                }

            }
        });


        //Fetch last invoice
        $scope.promise = InvoiceModel.GetLastSalesReceipt();
        $scope.promise.then(function(response) {
            if (response.statuscode == 0) {
                $timeout(function() {
                    $scope.apiProgressValue+=13;
                    $scope.lastSalesReceiptDocNumber=0;
                    if(response.data!=null){
                        $scope.lastSalesReceiptDocNumber = response.data[0].DocNumber;
                    }


                });
            }
        });

        //Fetch Prefrences
        $scope.promise = SettingModel.GetPreferences();
        $scope.promise.then(function(response) {
            if (response.statuscode == 0) {
                $timeout(function() {
                    $scope.apiProgressValue+=13;
                    $scope.preferences = response.data.Preferences[0];
                    $scope.HaveClassObj = $scope.preferences.AccountingInfoPrefs.ClassTrackingPerTxnLine
                    if($scope.HaveClassObj == true){
                        $scope.HavingClassObj = true
                    }
                    else{
                        $scope.HavingClassObj = false
                    }

                });
            }
        });


        //Fetch Customers
        $scope.promise = InvoiceModel.GetCustomers();
        $scope.promise.then(function(response) {
            if (response.statuscode == 0) {
                $timeout(function() {
                    $scope.apiProgressValue+=13;
                    $scope.customers = response.data.items;
                    //$scope.customers=loadAll();
                });
            }
        });

        //Fetch Items
        $scope.promise = InvoiceModel.GetItems();
        $scope.promise.then(function(response) {
            if (response.statuscode == 0) {
                $timeout(function() {
                    $scope.apiProgressValue+=13;
                    $scope.items = response.data.items;
                });
            }
        });


          //Fetch Classes



          $scope.promise = InvoiceModel.GetClasses();
          $scope.promise.then(function(response) {
              if (response.statuscode == 0) {
                  $timeout(function() {
                      $scope.apiProgressValue+=13;
                      $scope.ClassesItems = response.data.item;
                      $scope.ClassesItemslength = response.data.length;

                      if($scope.ClassesItemslength > 0){
                          $scope.HaveClass = true

                          console.log($scope.ClassesItems)
                        }
                        else{
                          $scope.HaveClass = false

                        }

                  });

              }
          });
          $scope.SelectedClass = []
          $scope.ClassDataGet = function(SelectedClass,$index){
              console.log($index)
            $rootScope.ClassRef =
              {  "name": SelectedClass.Name,
                   "type": "",
                   "value": SelectedClass.Id
                  }
              $rootScope.ClassRefName =  SelectedClass.Name
              $rootScope.ClassRefId = SelectedClass.Id
                  console.log($rootScope.ClassRef)
               // ClassItemChange($rootScope.ClassRef,$index)

          }

          // end classes

        //Fetch Tax
        $scope.promise = InvoiceModel.GetTaxRate();
        $scope.promise.then(function(response) {
            if (response.statuscode == 0) {
                $timeout(function() {
                    $scope.apiProgressValue+=13;
                    $scope.taxRate = response.data.items;

                });
            }
        });

        //Fetch TaxCode
        $scope.promise = InvoiceModel.GetTaxCode();
        $scope.promise.then(function(response) {
            if (response.statuscode == 0) {
                $timeout(function() {
                    $scope.apiProgressValue+=13;
                    $scope.taxCode = response.data.items;
                    //console.log($scope.taxCode);
                });
            }
        });

        function setTaxRateDetails(){
            if($scope.taxCode.length > 0){
                var taxCodeName;
                var taxCodeId;
                angular.forEach($scope.taxCode, function(taxCodeInfo, key){

                    if(taxCodeInfo.SalesTaxRateList!=null && taxCodeInfo.Active==true){

                            var RateValue=0;
                            angular.forEach(taxCodeInfo.SalesTaxRateList.TaxRateDetail, function(TaxRateDetail, key){
                                var TaxRateRef=TaxRateDetail.TaxRateRef;
                                var taxRate=$filter('filter')($scope.taxRate, {'Id':TaxRateRef.value},true)[0];
                                if(taxRate!=undefined){
                                    RateValue+=parseFloat(taxRate.RateValue);
                                }

                            });
                            var NewTaxCode={
                                    Id: taxCodeInfo.Id,
                                    RateValue: RateValue,
                                    Name: taxCodeInfo.Name
                                };
                            $scope.taxRateDetail.push(NewTaxCode);
                    }
                });
            }
        }


        //Fetch Term
        $scope.promise = InvoiceModel.GetTerm();
        $scope.promise.then(function(response) {
            if (response.statuscode == 0) {
                $timeout(function() {
                    $scope.apiProgressValue+=13;
                    $scope.invoiceTerm = response.data.items;

                    if($scope.invoiceTerm.length> 0){
                       $scope.invoice.SalesTermRef.value=$scope.invoiceTerm[0].Id;
                       $scope.setTerm();
                    }



                });
            }
        });

         $scope.loadingProgress = function() {
            return $timeout(function() {
             //
            }, 650);
          };

        $scope.createInvoice=function(ev){
            var error=false;


            if($scope.invoice.TotalAmt<=0){
                error=true;
                Clique.showToast("Invoice total should be greater than zero","bottom right","error");
            }
            if(error==false){


                $scope.showProgress=true;
                $scope.paymentSaleReceipt(ev);

            }
        }

        function CustomerDialogController($window,$scope, $mdDialog,customerData,Countries) {

            $scope.hideDialogActions=false;
            $scope.customer={};
            $scope.customer.DisplayName=customerData;


            $scope.loadCountries = function() {
                return $timeout(function() {
                  $scope.countries = Countries
                }, 650);
            };


            $scope.setCustomerShipping=function(){
                if($scope.sameAsBilling==true){
                    $scope.customer.ShipAddr=$scope.customer.BillAddr;
                }else{
                    $scope.customer.ShipAddr={Line1:"",City:"",Country:"",CountrySubDivisionCode:"",PostalCode:""}
                }
            }
            $scope.addNewCustomer = function(task) {
                if($scope.sameAsBilling==true){
                    $scope.customer.ShipAddr=$scope.customer.BillAddr;
                }
                $scope.showProgress=true;
                $scope.hideDialogActions=true;

                vm.promise = InvoiceModel.AddCustomer($scope.customer);
                vm.promise.then(function(response){
                if(response.statuscode==0){
                    Clique.showToast(response.statusmessage,'bottom right','success');
                    $rootScope.$broadcast('add-customer-event', {data: response.data});
                }
                else{
                    Clique.showToast(response.statusmessage,'bottom right','error');
                }
                $mdDialog.hide();
                });
            };
        }
        function ItemDialogController($window,$scope, $mdDialog,itemData,index) {

            $scope.hideDialogActions=false;
            $scope.item={};
            $scope.item.Name=itemData;
            $scope.account_income=[];
            $scope.account_expense=[];
            $scope.account_asset=[];
            $scope.enableMoreInventoryFields=false;

            //if($rootScope.account==undefined){
                $scope.promise = SettingModel.GetAccount();
                $scope.promise.then(function(response) {
                    if (response.statuscode == 0) {
                        $timeout(function() {
                            $rootScope.account = response.data.items;
                            $scope.account=$rootScope.account;
                            if($scope.account.length > 0){

                                $scope.account_expense=$filter('filter')($scope.account, {'AccountType':'Cost of Goods Sold'},true);
                                $scope.account_income=$filter('filter')($scope.account, {'AccountType':'Income'},true);
                                $scope.account_asset=$filter('filter')($scope.account, {'AccountType':'Other Current Asset'},true);


                                $scope.item.IncomeAccountRef={
                                    value:$scope.account_income[0].Id
                                };
                                $scope.item.AssetAccountRef={
                                    value:$scope.account_asset[0].Id
                                };
                                $scope.item.ExpenseAccountRef={
                                    value:$scope.account_expense[0].Id
                                };


                            }
                        });
                    }
                });

            if($rootScope.categories==undefined){
                $scope.promise = InvoiceModel.GetCategories();
                $scope.promise.then(function(response) {
                    if (response.statuscode == 0) {
                        $timeout(function() {
                            $rootScope.categories = response.data.items;
                            $scope.categories=$rootScope.categories;
                        });
                    }
                });
            }else{
                $scope.categories=$rootScope.categories;
            }

            $scope.$watch('item.ParentRef.value',
              function(newValue, oldValue) {
                    if(newValue!=undefined){
                        $scope.item.SubItem=true;
                    }else{
                        $scope.item.SubItem=false;
                        $scope.item.ParentRef=undefined;
                    }
              }
            );
            $scope.$watch('item.Type',
              function(newValue, oldValue) {
                    if(newValue=='Inventory'){
                        $scope.enableMoreInventoryFields=true;
                        $scope.item.AssetAccountRef={
                            value:$scope.account_asset[0].Id
                        };
                        $scope.item.TrackQtyOnHand=true;
                    }
                    else {
                        $scope.enableMoreInventoryFields=false;
                        $scope.item.QtyOnHand=undefined;
                        $scope.item.InvStartDate=undefined;
                        $scope.item.AssetAccountRef=undefined;
                        $scope.item.TrackQtyOnHand=false;
                    }
                  }
            );

            $scope.addNew = function(task) {
                $scope.showProgress=true;
                $scope.hideDialogActions=true;

                vm.promise = InvoiceModel.AddItem($scope.item);
                vm.promise.then(function(response){
                if(response.statuscode==0){
                    Clique.showToast(response.statusmessage,'bottom right','success');
                    $rootScope.$broadcast('add-item-event', {data: response.data,index:index});
                }
                else{
                    Clique.showToast(response.statusmessage,'bottom right','error');
                }
                $mdDialog.hide();
                });
            };
        }





        // ******************************
        // Payment Methods
        // ******************************


        $scope.paymentSaleReceipt=function(ev) {

            $mdDialog.show({
                scope               : $scope,
                preserveScope       : true,
                parent: angular.element(document.body),
                templateUrl         : 'app/modules/salesreceipt/payment/payment.dialog.html',
                clickOutsideToClose : false,
                fullscreen          : true,
                targetEvent         : ev,
                controller          : 'PaymentSaleReceiptController'
            }).then(function() {
                }, function() {
                    if($scope.isPaymentSuccess==true){
                    }

                });
        }

        $scope.CCProfileResponse={};
        $scope.isCCProfileCreated=false;
        $scope.customerSelectedProfileIndex=0;
        $scope.showProfileGetProgress=false;

        function getCustomerCardProfile(){
            if($scope.invoice.CustomerRef!=null){
                $scope.showProfileGetProgress=true;
                var customer_id=$scope.invoice.CustomerRef.value;
                var customer={
                    customer_id:customer_id
                }
                $scope.CCProfileResponse={};
                $scope.isCCProfileCreated=false;

                $scope.promise = InvoiceModel.ProfileGet(customer);
                $scope.promise.then(function(response){
                    if(response.statuscode==0){
                        if(response.data.total_item > 0){

                            $scope.CCProfileResponse=response.data.item[0];
                            $scope.isCCProfileCreated=true;
                        }
                    }
                    $scope.showProfileGetProgress=false;
                });
            }
        }



        $scope.cancelInvoice=function(){
           var confirm = $mdDialog.confirm()
                      .title('Confirm')
                      .textContent('Are you sure you want to cancel without save?')
                      .ariaLabel('Lucky day')
                      .ok('Yes')
                      .cancel('No');

                $mdDialog.show(confirm).then(function() {
                    $state.go('triangular.dashboard-analytics');
                }, function() {
                });
        }

    }

})();
