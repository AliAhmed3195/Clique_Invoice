(function () {
    'use strict';
    angular
        .module('invoice')
        .controller('InvoiceCreateController', Controller)
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
        })
        .directive('chooseFile', function() {
            return {
              link: function (scope, elem, attrs) {
                var button = elem.find('button');
                var input = angular.element(elem[0].querySelector('input#fileInput'));
                button.bind('click', function() {
                  input[0].click();
                });
                input.bind('change', function(e) {
                  scope.$apply(function() {
                    var files = e.target.files;
                    if (files[0]) {
                      scope.fileName = files[0].name;
                    } else {
                      scope.fileName = null;
                    }
                  });
                });
              }
            };
          })
        .filter('customInfo', function () {

            return function (input, optional1) {
                var output;
                if (input != "") {
                    output = input + ' ' + optional1;
                }
                return output;
            }
        });

    function Controller(triLayout, $window, triLoaderService, $filter, $log, $scope, $timeout, $interval, $q, $http, $compile, Clique, InvoiceModel, SettingModel, $mdDialog, $mdToast, $element, $stateParams, triBreadcrumbsService, $state, $mdBottomSheet, $rootScope, $mdSidenav, $anchorScroll, $location, dataService, helper, Countries) {
    
        $scope.disabledSubmitButton = false;
        $scope.showApiProgress = true;
        $scope.apiProgressValue = 9;
        $scope.showInvoiceContent = false;
        $scope.showRecEndDateError = false;
       
        
        triBreadcrumbsService.reset();
        var breadcrumbs = [{
            active: false,
            icon: "zmdi zmdi-chart",
            name: 'Create Invoice.',
            priority: 2,
            state: "triangular.invoice-list",
            template: "app/triangular/components/menu/menu-item-link.tmpl.html",
            type: "link",

        }];
        angular.forEach(breadcrumbs, function (breadcrumb, key) {
            triBreadcrumbsService.addCrumb(breadcrumb);
        });


        var vm = this;
        vm.valuecheck = valuecheck;
        vm.Changecheckbox = Changecheckbox;
        vm.indexTaxArray = indexTaxArray
        var unique = [];
        $scope.sortableOptions = {
            'ui-floating': true
        };
        $scope.showRecurringOptions = false;
        $scope.createInvoiceBtnTitle = "Create Invoice";
      

    



if($rootScope.accounttype == 'Standalone'){
     
    vm.invoice_data = JSON.parse('{"TotalAmt":0.00,"TxnDate":"","Line":[{"Amount":0.00,"DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"ItemRef":{"value":"","name":"", "Taxable":""},"Qty":1}},{"Amount":0.00,"DetailType":"DiscountLineDetail","DiscountLineDetail":{"PercentBased":true,"DiscountPercent":0.00,"DiscountAccountRef":{}}},{"Amount":0.00,"DetailType":"SubTotalLineDetail","SubTotalLineDetail":{}}],"TxnTaxDetail":{"TxnTaxCodeRef":{"value":""},"TotalTax":0.00,"TaxLine":[{"Amount":0.00,"DetailType":"TaxLineDetail","TaxLineDetail":{"TaxRateRef":{"value":"0"},"PercentBased":true,"TaxPercent":0,"NetAmountTaxable":0.00}}]},"CustomerRef":{"value":"0","name":""},"CustomerMemo":{"value":""},"SalesTermRef":{"value":"0"},"DueDate":"","BillEmail":{"Address":""}, "InvoiceTaxRateRef":{"value":"", "rate":"","name": ""} }');
}
else{
        vm.invoice_data = JSON.parse('{"TotalAmt":0.00,"TxnDate":"","Line":[{"Amount":0.00,"DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"ItemRef":{"value":"","name":""},"Qty":1}},{"Amount":0.00,"DetailType":"DiscountLineDetail","DiscountLineDetail":{"PercentBased":true,"DiscountPercent":0.00,"DiscountAccountRef":{}}},{"Amount":0.00,"DetailType":"SubTotalLineDetail","SubTotalLineDetail":{}}],"TxnTaxDetail":{"TxnTaxCodeRef":{"value":""},"TotalTax":0.00,"TaxLine":[{"Amount":0.00,"DetailType":"TaxLineDetail","TaxLineDetail":{"TaxRateRef":{"value":"0"},"PercentBased":true,"TaxPercent":0,"NetAmountTaxable":0.00}}]},"CustomerRef":{"value":"0","name":""},"CustomerMemo":{"value":""},"SalesTermRef":{"value":"0"},"DueDate":"","BillEmail":{"Address":""}, "InvoiceTaxRateRef":{"value":"", "rate":"","name": ""} }');
        
}  

        var invoice_id = "";
        var taxratelist = [];
        vm.itemSelected = itemSelected;
        
        $scope.invoice = vm.invoice_data;
        $scope.customers = [];
        $scope.taxArray = [];
        $scope.items = [];
        $scope.categories = [];
        $scope.taxRate = [];
        $scope.statustype = [];
        $scope.taxCode = [];
        $scope.taxRateDetail = [];
        $scope.lastInvoiceDocNumber = "";
        $scope.HavingClassObj = false
        $scope.preferences;
        $scope.invoiceTerm;
        $scope.Taxtype;
        $scope.TaxtypeType;
        $scope.TaxtypeCustomName;
        $scope.IncTax;
        $scope.Amounttax;
        $scope.updateTotalonTax ;
        $scope.items = [];
        $scope.itemtaxable ;
        $scope.checkbox ;
        $scope.disablecheck = [];
       $scope.totalchecked = [];
      




        var taxRatelist = [];
        $scope.discountTypes = [{
            value: false,
            text: 'Discount Value'
        },
        {
            value: true,
            text: 'Discount Percent'
        },
        ];
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
        setsDate();
      
        initCustomerInfo();
        vm.simulateQuery = true;
        // Recurring new work
        vm.frequency = 'invoice';
        vm.payment = '';
        vm.oneTime = true;

        //search Customer Fields
        vm.selectedCustomer = null;
        vm.searchCustomer = null;
        vm.customerSearch = customerSearch;
        vm.selectedCustomerChange = selectedCustomerChange;
        $scope.toggleRight = buildToggler('right');
        $scope.HaveClass = false
        //search item fuelds
        vm.selectedProduct = [];
        vm.searchProduct = [];
        vm.itemSearch = itemSearch;
        vm.selectedItemChange = selectedItemChange;
         vm.totalcheckedboxes = totalcheckedboxes;
        vm.disablebutton = disablebutton;
        vm.disablebutton1 = disablebutton1;
        vm.getTotalItems = getTotalItems;
        $scope.showProgress = false;
        disablebutton();
        vm.sno = 1;
        vm.InvoiceSno = InvoiceSno;
        $scope.payment = 'one-time';
        $scope.options = [
            {
                name: 'Something Cool',
                value: 'something-cool-value'
            },
            {
                name: 'Something Else',
                value: 'something-else-value'
            }
        ];

        $scope.selectedOption = $scope.options[0];

        triLayout.setOption('sideMenuSize', 'icon');

        $scope.$watch('apiProgressValue',
            function (newValue, oldValue) {
                if (newValue >= 100) {
                    $scope.showApiProgress = false;
                    $scope.showInvoiceContent = true;
                    setTaxRateDetails();
                   
                    if ($scope.preferences.SalesFormsPrefs.CustomTxnNumbers == true) {
                       
                        $scope.invoice.DocNumber = helper.getAutoIncrementInvoiceNo($scope.lastInvoiceDocNumber);
                    }

                    if ($stateParams.action == 'recurring') {
                        //faisalsharif
                        var invoice_detail = JSON.parse(sessionStorage.getItem("invoice_detail"));
                        
                        var isDiscountLineExist = false;
                        $scope.invoice.SalesTermRef.value = invoice_detail.SalesTermRef.value;

                     //   $scope.invoice.InvoiceTaxRateRef.value = 

                        $scope.invoice.CustomerMemo = invoice_detail.CustomerMemo;
                        $scope.invoice.TxnDate = "";
                        $scope.setTax();
                        $scope.setTerm();
                      //  $scope.setsDate();
                        $scope.invoice.TotalAmt = invoice_detail.TotalAmt;

                        $scope.invoice.Line = [];
                        $scope.invoice.TxnTaxDetail = invoice_detail.TxnTaxDetail;
                     console.log("invoice_detail", invoice_detail);
                     //   debugger;
                        angular.forEach(invoice_detail.Line, function (item, key) {
                            switch (item.DetailType) {
                                case 'SalesItemLineDetail':
                                    var salesItem = JSON.parse('{"Amount":0,"DetailType":"SalesItemLineDetail","SalesItemLineDetail":{"ItemRef":{"value":"","name":""},"Qty":1,"UnitPrice":0,"TaxCodeRef":{"value":"NON"}},"Description":""}');
                            
                                    console.log("item.SalesItemLineDetail.ItemRef.name",item);
                                    salesItem.Amount = item.Amount;
                                    salesItem.Description = item.Description;
                               //      SalesItemLineDetail.ItemRef.Taxable == item.Taxable;

                                    salesItem.SalesItemLineDetail.ItemRef.name = item.SalesItemLineDetail.ItemRef.name;
                                    salesItem.SalesItemLineDetail.ItemRef.value = item.SalesItemLineDetail.ItemRef.value;
                                    salesItem.SalesItemLineDetail.Qty = item.SalesItemLineDetail.Qty;
                                    salesItem.SalesItemLineDetail.ClassRef.value = item.SalesItemLineDetail.ClassRef.value;
                                    salesItem.SalesItemLineDetail.TaxCodeRef.value = item.SalesItemLineDetail.TaxCodeRef.value;
                                    salesItem.SalesItemLineDetail.UnitPrice = item.SalesItemLineDetail.UnitPrice;
                                    salesItem.SalesItemLineDetail.Description = item.SalesItemLineDetail.Description;
                                    // salesItem.SalesItemLineDetail.Taxable = 

                                    console.log("salesItem.SalesItemLineDetail.Description", salesItem.SalesItemLineDetail.Description);
            
                                    $scope.invoice.Line.push(salesItem);

                                    if (key == 0) {
                                        vm.searchProduct[0] = item.SalesItemLineDetail.ItemRef.name;


                                    } else {
                                        vm.searchProduct.push(item.SalesItemLineDetail.ItemRef.name);
                                    }
                                    break;
                                   console.log("$scope.invoice", $scope.invoice) ;
                                case 'SubTotalLineDetail':
                                
                                    var SubTotalLineDetail = JSON.parse('{"Amount":0.00,"DetailType":"SubTotalLineDetail","SubTotalLineDetail":{}}');
                                    var Amount = parseFloat(item.Amount);
                                    SubTotalLineDetail.Amount = Amount;
                                    $scope.invoice.Line.push(SubTotalLineDetail);

                                    //$scope.invoice.Line[key] = SubTotalLineDetail;
                                    break;
                                case 'DiscountLineDetail':
                                    var discountInfo = JSON.parse('{"Amount":0,"DetailType":"DiscountLineDetail","DiscountLineDetail":{"PercentBased":false,"DiscountPercent":0,"DiscountAccountRef":{}}}');
                                    discountInfo.Amount = item.Amount;
                                    discountInfo.DiscountLineDetail.PercentBased = item.DiscountLineDetail.PercentBased;
                                    discountInfo.DiscountLineDetail.DiscountPercent = item.DiscountLineDetail.DiscountPercent;
                                    $scope.invoice.Line.push(discountInfo);
                                    isDiscountLineExist = true;
                                    break;
                            }
                        });

                        if (isDiscountLineExist == false) {
                            var discountLine = JSON.parse('{"Amount":0.00,"DetailType":"DiscountLineDetail","DiscountLineDetail":{"PercentBased":true,"DiscountPercent":0.00,"DiscountAccountRef":{}}}');
                            $scope.invoice.Line.push(discountLine);

                        }
                        // $scope.setTax();                       


                        if (invoice_detail.BillEmail != null) {
                            if (invoice_detail.BillEmail.Address != null) {
                                 $scope.invoice.BillEmail.Address = invoice_detail.BillEmail.Address
                            }
                        }

                        vm.searchCustomer = $scope.invoice.CustomerRef.name;
                        var Customer = {
                            Active: true,
                            PrimaryEmailAddr: {
                                Address: $scope.invoice.BillEmail.Address
                            },
                            DisplayName: $scope.invoice.CustomerRef.name,
                            Id: $scope.invoice.CustomerRef.value
                        };

                        vm.selectedCustomer = Customer;
                        getCustomerCardProfile();
                        $scope.enableRecurring();
                    }
                }
            }
        );

        //     MORE OPTIONS 
        function buildToggler(navID) {
            return function () {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            };
        }



        // ******************************
        // customer methods
        // ******************************
        function customerSearch(query) {
            var results = query ? $scope.customers.filter(createFilterFor(query)) : $scope.customers,
                deferred;
            if (vm.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(customer) {

                var DisplayName = angular.lowercase(customer.DisplayName).toString();
                return ((DisplayName).indexOf(lowercaseQuery) === 0);
            };
        }

        function initCustomerInfo() {
            vm.customerInfo = {
                id: '',
                name: '',
                email: '',
                phone: '',
                website: '',
                company_name: '',
                notes: '',
                billing: {
                    line1: '',
                    city: '',
                    countryCode: '',
                    postal_code: '',
                    country: ''

                },
                shipping: {
                    line1: '',
                    city: '',
                    countryCode: '',
                    country: ''
                }
            }
        }

        function selectedCustomerChange(customer) {
            debugger;

            if (vm.selectedCustomer != null && $scope.showProfileGetProgress == false) {
                document.getElementById('recurringOptions').style.margin = "6px 0 0 0";
            }  if (vm.selectedCustomer != null && $scope.isCCProfileCreated != false) {
                document.getElementById('recurringOptions').style.margin = "-72px 0 0 0";
            }  
              else {
                document.getElementById('recurringOptions').style.margin = "0 0 0 0";
            }
            if (customer != null || customer != undefined) {
                initCustomerInfo();
                vm.customerInfo.id = customer.Id;
                vm.customerInfo.name = customer.DisplayName;
                vm.customerInfo.company_name = customer.CompanyName;
                vm.customerInfo.website = customer.WebAddr != null ? customer.WebAddr.URI : '';
                vm.customerInfo.phone = customer.PrimaryPhone != null ? customer.PrimaryPhone.FreeFormNumber : '';
                vm.customerInfo.email = customer.PrimaryEmailAddr != null ? customer.PrimaryEmailAddr.Address : '';4
             

                if (customer.ShipAddr != null) {
                    vm.customerInfo.shipping.line1 = customer.ShipAddr.Line1;
                    vm.customerInfo.shipping.city = customer.ShipAddr.City;
                    vm.customerInfo.shipping.countryCode = customer.ShipAddr.CountrySubDivisionCode;
                    vm.customerInfo.shipping.country = customer.ShipAddr.Country;
                }
                if (customer.BillAddr != null) {
                    vm.customerInfo.billing.line1 = customer.BillAddr.Line1;
                    vm.customerInfo.billing.city = customer.BillAddr.City;
                    vm.customerInfo.billing.countryCode = customer.BillAddr.CountrySubDivisionCode;
                    vm.customerInfo.billing.postal_code = customer.BillAddr.PostalCode;
                    vm.customerInfo.billing.country = customer.BillAddr.Country;
                }
                $scope.showBillingInfo = true;
               $scope.invoice.CustomerRef.value = customer.Id;
               $scope.invoice.CustomerRef.name = customer.DisplayName;

                $scope.invoice.BillEmail.Address = customer.PrimaryEmailAddr != null ? customer.PrimaryEmailAddr.Address : '';
              
                //get Customer profile for Recurring
                getCustomerCardProfile();

            } if(customer == undefined) {
                $scope.isCCProfileCreated = false;
            }

        }


        $scope.$on('add-customer-event', function (ev, customer) {
            $scope.customers.push(customer.data);
            vm.selectedCustomer = customer.data;
        });
        $scope.addNewCustomer = function () {
            $mdDialog.show({
                locals: {
                    customerData: vm.searchCustomer,
                    Countries: Countries
                },
                controller: CustomerDialogController,
                templateUrl: 'app/modules/invoice/createnew/customer.addnew.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: true,
                fullscreen: true
            })
                .then(function (answer) { }, function () { });
        }


        $scope.addNewTax = function () {
            $mdDialog.show({
            
                controller: TaxDialogController,
                templateUrl: 'app/modules/invoice/createnew/tax.addnew.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: true,
                fullscreen: true
            })
                .then(function (answer) { }, function () { });
        }
       






        // ******************************
        // item methods
        // ******************************
        function itemSearch(query) {
            var results = query ? $scope.items.filter(createFilterForItem(query)) : $scope.items,
                deferred;
            if (vm.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function createFilterForItem(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(item) {
                var Name = angular.lowercase(item.Name).toString();
                return ((Name).indexOf(lowercaseQuery) === 0);
            };

        }

        function selectedItemChange(item, key) {
       console.log('items is',item);
debugger;

       if($rootScope.accounttype == 'Standalone'){
           $scope.invoice.Line[key].SalesItemLineDetail.ItemRef.Taxable = item.Taxable;
       }
            $scope.invoice.Line[key].SalesItemLineDetail.ItemRef.value = item.Id;
            $scope.invoice.Line[key].SalesItemLineDetail.ItemRef.name = item.FullyQualifiedName;
            $scope.invoice.Line[key].Description = item.Description;
        //    console.log("$scope.invoice.Line[key]",$scope.invoice.Line);

            $scope.invoice.Line[key].SalesItemLineDetail.UnitPrice = parseFloat(item.UnitPrice);
            $scope.invoice.Line[key].Amount = parseFloat($scope.invoice.Line[key].SalesItemLineDetail.Qty * $scope.invoice.Line[key].SalesItemLineDetail.UnitPrice);
            indexTaxArray();
            $scope.calculateTotal();
           
// if ($scope.invoice.Line[key].SalesItemLineDetail.ItemRef.Taxable ==true){
//   debugger;
//     //  vm.checkBoxModela = true;
// }

            if (item.Taxable == true) {
                // debugger;
                $scope.invoice.Line[key].SalesItemLineDetail.TaxCodeRef = {}
                $scope.invoice.Line[key].SalesItemLineDetail.TaxCodeRef.value = 'TAX'
                $scope.calculateTotal();
                // vm.istaxselected = true;
            } else {
                // debugger;
                $scope.invoice.Line[key].SalesItemLineDetail.TaxCodeRef = {}
                $scope.invoice.Line[key].SalesItemLineDetail.TaxCodeRef.value = 'NON'
                // vm.istaxselected = true;
            }
        }
     

        function totalcheckedboxes(valuecheckbox){
            if(valuecheckbox == true){
                $scope.totalchecked.push(valuecheckbox);
        }
        else if (valuecheckbox == false){
            $scope.totalchecked.length = $scope.totalchecked.length -1;
        }
        console.log("$scope.totalchecked lenght",$scope.totalchecked.length);
        console.log("total check box",$scope.totalchecked );
    }


   function disablebutton(value, valuetaxableitem){

       if(value==true){
    $scope.disablecheck.push(value);
     $scope.totalchecked.push(valuetaxableitem);
       }
      console.log("$scope.totalchecked lenght",$scope.disablecheck.length);
     console.log("$scope.totalchecked",$scope.totalchecked);

    $scope.itemtaxable = value; 
    


    if( $scope.itemtaxable == true && vm.istaxselected == undefined && $scope.checkbox==true){
        setTimeout(function(){
    Clique.showToast("You have selected taxable item(s), please select a Tax Rates", "bottom right", "error");
        }, 2000);


   }

   disablebutton1();

   }
   function disablebutton1(value){
    $scope.checkbox = value;
    console.log("valueeechekcboox", $scope.checkbox);
    if(  vm.istaxselected == undefined &&  $scope.itemtaxable == true && $scope.checkbox == undefined || (vm.istaxselected == undefined &&  $scope.itemtaxable == false && $scope.checkbox == true ) || vm.istaxselected == undefined &&  $scope.itemtaxable == true && $scope.checkbox == true ){
        setTimeout(function(){
            Clique.showToast("You have selected taxable item(s), please select a Tax Rate", "bottom right", "error");
                }, 2000);
}


   }



        function ClassItemChange(item, key) {
            $scope.invoice.Line[key].SalesItemLineDetail.ClassRef = item

        }
        $scope.addItem = function () {
            var items = $filter('filter')($scope.invoice.Line, {
                'DetailType': 'SalesItemLineDetail'
            });
            var totalItem = parseInt(items.length)

            var itemObject = {
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

        $scope.removeItem = function (item, index) {

            vm.counter--;
            var totalItems = parseInt(getTotalItems());
            if (totalItems > 1) {
                $scope.invoice.Line.splice(index, 1);
                vm.selectedProduct.splice(index, 1);
                vm.searchProduct.splice(index, 1);

            } else {

                vm.selectedProduct.splice(index, 1);
                vm.searchProduct.splice(index, 1);
            }
            $scope.calculateTotal();
        };

        $scope.$on('add-item-event', function (ev, item) {

            $scope.items.push(item.data);
            vm.selectedProduct[item.index] = item.data;
        });

        $scope.addNewItem = function (itemName, index) {
            $mdDialog.show({
                locals: {
                    itemData: itemName,
                    index: index
                },
                controller: ItemDialogController,
                templateUrl: 'app/modules/invoice/createnew/item.addnew.html',
                parent: angular.element(document.body),
                targetEvent: null,
                clickOutsideToClose: true,
                fullscreen: true
            })
                .then(function (answer) { }, function () { });
        }

        function InvoiceSno() {
            return vm.sno++;
        }

        vm.counter = 0;
        $scope.getId = function () {
            vm.counter++;
            return vm.counter;
        }
        vm.istaxselected;
        $scope.taxisselected ;
        
        valuecheck();
      function valuecheck(value){
      //  $scope.taxisselected.push(value)
     console.log(value);
      $scope.taxisselected =value;
      vm.checkBoxModela =  value
       vm.istaxselected = $scope.taxisselected  
        //  console.log("the length is" , vm.istaxselected);

      }

     function Changecheckbox(value, $index){
       //  vm.indexdata = $index;
    //    debugger;
    vm.i = $index;

         vm.changecheckboxitem =  value[$index].Taxable;

      
    } 
     
     


      

        function indexTaxArray(value, ind) {

            // console.log(value);
          debugger; 
            if(ind != undefined) {
             //   debugger;
                // console.log('invoice line', $scope.invoice.Line)
                // // $scope.invoice.Line
                // // console.log('invoice line index', $scope.invoice.Line[index])
             //   console.log("the checkbox is", value)
                $scope.invoice.Line.map(function(el, index) {
                    if(ind === index) {
                        var o = Object.assign({}, el);
                         o.tax = value;
                         $scope.invoice.Line[ind] = o;
                        //  el = o;  
                         return;
                    } 
                    
                })
             //   console.log('invoice line', $scope.invoice.Line)
                $scope.calculateTotal(value, ind)
                // console.log('values are' , o)
                // console.log('invoice line index', $scope.invoice.Line[index])
            }
        }
        function onlyUnique(value, index, self) { 
            return self.indexOf(value) === index;
        }
      //  $scope.checkBoxModel = false;
      
        $scope.calculateTotal = function (value,index) 
    { 
        console.log("ali",value);
        debugger;
        var total = 0;
        var tax = 0;
        var discount = 0;
        var amount = 0;
        var subTotalIndex;
        // $scope.Taxtype = value;
        
        angular.forEach($scope.invoice.Line, function (item, key) {
            debugger;
            switch (item.DetailType) {
                case 'SalesItemLineDetail':
                // amount = item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice; 
             
                    //  if($scope.checkBoxModel == undefined ){
                        
                    //     amount = item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice; 
                    // } 
                   
               //     console.log("value taxtype",$scope.Taxtype);
                    
                    if(item.SalesItemLineDetail.ItemRef.Taxable == true) {
                        if('tax' in item  && item.tax == false ) {
                            amount = item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice; 
                        }

                        else {
                            if($scope.Taxtype == undefined){
                            amount = (item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice);
                        }
                      else { amount = (item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice) + 
                            ((item.SalesItemLineDetail.UnitPrice*item.SalesItemLineDetail.Qty)*($scope.Taxtype/100));
                      }
                    }
                       
                    }

                    else if ( 'tax' in item && item.tax == true  ){ 
                       
                        amount = (item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice) + 
                        ((item.SalesItemLineDetail.UnitPrice*item.SalesItemLineDetail.Qty)*($scope.Taxtype/100));
                       
                    }


                    // else if (value == true && key === index) {
                        
                    // }
                    else{
                        amount = item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice; 
                        
                    }
                    // console.log( amount)
                    if (amount > 0) {
                        total += parseFloat(amount);
                    }

                    break;
                case 'SubTotalLineDetail':
                    subTotalIndex = key;
                    break;

            }
        
        });
        ///update subtotal
        debugger;
        $scope.invoice.Line[subTotalIndex]['Amount'] = parseFloat(total);
        $scope.calculateTax();
        $scope.calculateDiscount();
        
     
        var tax = parseFloat($scope.invoice.TxnTaxDetail.TotalTax);
        var discountIndex = parseInt(getLineTypeIndex('DiscountLineDetail'));
        var discount = parseFloat($scope.invoice.Line[discountIndex].Amount);


        total = total - discount;
        if (tax > 0) {
            total = total + tax;
        }

        
        $scope.invoice.TotalAmt = parseFloat(total);
        // console.log("the amt is",$scope.invoice.TotalAmt);
    }
  


 


        function getTotalItems() {
            var i = 0
            angular.forEach($scope.invoice.Line, function (item, key) {
                switch (item.DetailType) {
                    case 'SalesItemLineDetail':
                        i++;
                        break;
                }
            });
            return i;
        }
        $scope.calculateTax = function () {
          
            var subTotal = 0;
            angular.forEach($scope.invoice.Line, function (item, key) {
                debugger;
                switch (item.DetailType) {
                    case 'SalesItemLineDetail':
                        if (item.SalesItemLineDetail.TaxCodeRef != null && item.SalesItemLineDetail.TaxCodeRef.value == 'TAX') {
                            // var amount = (item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice)+ ((item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice)*($scope.Taxtype/100));
                             var amount = item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice;
                            subTotal += parseFloat(amount);
                        }
                        break;
                }

            });

            if (subTotal > 0) {

                //debugger;
                var taxCodeInfo = "";
                var taxCodeRefId = $scope.invoice.TxnTaxDetail.TaxLine[0].TaxLineDetail.TaxRateRef.value;
                var taxRate;
                var taxRateName = "";
                var taxRateValue = 0;
                var result = 0;

                if (taxCodeRefId > 0) {
                    taxCodeInfo = $filter('filter')($scope.taxRateDetail, {
                        'Id': taxCodeRefId
                    })[0];
                    taxRateName = taxCodeInfo.Name;
                    taxRateValue = taxCodeInfo.RateValue;

                }
                if (taxRateValue > 0) {
                    result = parseFloat((subTotal * taxRateValue) / 100);
                }

            }

            if (taxCodeRefId != "0") {
                // debugger;
                $scope.invoice.TxnTaxDetail.TxnTaxCodeRef.value = taxCodeRefId;
            } else {
                // debugger;
                $scope.invoice.TxnTaxDetail.TxnTaxCodeRef.value = "";
            }
            if (taxRateValue > 0) {
                $scope.invoice.TxnTaxDetail.TaxLine[0].TaxLineDetail.TaxPercent = taxRateValue;
            } else {
                $scope.invoice.TxnTaxDetail.TaxLine[0].TaxLineDetail.TaxPercent = 0;
            }
            if (result > 0) {
                $scope.invoice.TxnTaxDetail.TotalTax = result;
                $scope.invoice.TxnTaxDetail.TaxLine[0].Amount = result;
            } else {
                $scope.invoice.TxnTaxDetail.TotalTax = undefined;
                $scope.invoice.TxnTaxDetail.TaxLine[0].Amount = undefined;
            }
        }
    
      
        $scope.updateTotalonTax = function(value){
            // vm.indexTaxArray();
//debugger;
$scope.Taxtype = value.Rate;
//console.log("$scope.Taxtype111", $scope.Taxtype);
            
            $scope.calculateTotal();
           
        }
       
     
       

        $scope.calculateTaxS = function () {
         //   debugger;
            var subTotal = 0;
            angular.forEach($scope.invoice.Line, function (item, key) {
              //  console.log('items availbale', $scope.invoice.Line);
                switch (item.DetailType) {
                    case 'SalesItemLineDetail':
                        
                            var amount = (item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice)+ ((item.SalesItemLineDetail.Qty * item.SalesItemLineDetail.UnitPrice)*($scope.Taxtype/100));
                            subTotal += parseFloat(amount);
                      
                        break;
                }

            });

            if (subTotal > 0) {

                //debugger;
          
                var taxRateValue = $scope.Taxtype.Rate;
        

              
                if (taxRateValue > 0) {
                    result = parseFloat((subTotal * taxRateValue) / 100);
                }
                if (result > 0) {
                    $scope.invoice.TxnTaxDetail.TotalTax = result;
                    $scope.invoice.TxnTaxDetail.TaxLine[0].Amount = result;
                } else {
                    $scope.invoice.TxnTaxDetail.TotalTax = undefined;
                    $scope.invoice.TxnTaxDetail.TaxLine[0].Amount = undefined;
                }
            }

          
        }


  

        $scope.calculateDiscount = function () {
          debugger;
            var discountIndex = parseInt(getLineTypeIndex('DiscountLineDetail'));
            var discountInfo = $scope.invoice.Line[discountIndex].DiscountLineDetail;
            var isPercentBased = discountInfo.PercentBased;
            var discountValue = 0;
            if (isPercentBased) {
                discountValue = parseFloat(discountInfo.DiscountPercent);

            } else {
                discountValue = parseFloat($scope.invoice.Line[discountIndex].Amount);
            }

            var subTotalIndex = parseInt(getLineTypeIndex('SubTotalLineDetail'));
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
                    if (discountedAmount >= 0) {
                        $scope.invoice.Line[discountIndex].Amount = parseFloat(discountedAmount);
                    } else {
                        $scope.invoice.Line[discountIndex].Amount = 0;
                    }
                }

            } else {
                $scope.invoice.Line[discountIndex].Amount = 0.00;
            }

            //
        }

        function getLineTypeIndex(type) {
            var index;
            angular.forEach($scope.invoice.Line, function (item, key) {
                if (item.DetailType == type) {
                    index = parseInt(key);

                }
            });
            return index;
        }
        $scope.setTerm= function () {
 //debugger;
            var term_id = $scope.invoice.SalesTermRef.value;
            // console.log("term_id", term_id);
            if (term_id != 0) {
                var term = $filter('filter')($scope.invoiceTerm, {
                    'Id': term_id
                })[0];
                var DueDays = term.DueDays;

                // console.log(" DueDays" ,DueDays );
                var date = new Date();
                // console.log(" date" ,date );

                var y = date.getFullYear();
                var m = date.getMonth();
                var d = date.getDate();
                //debugger;
                if ($scope.invoice.TxnDate == "") {
                    $scope.invoice.TxnDate = new Date(y, m, d);
                    // console.log(" $scope.invoice.TxnDate" , $scope.invoice.TxnDate );
                }
                var TxnDate = $scope.invoice.TxnDate;
                $scope.invoice.DueDate = new Date(TxnDate.getFullYear(), TxnDate.getMonth(), TxnDate.getDate() + DueDays);
                // console.log(" $scope.invoice.DueDate" , $scope.invoice.DueDate );
            }
        }

       function setsDate() { 
        /// debugger;
            var date = new Date();
            $scope.date = $filter("date")(Date.now(), 'MM-dd-yyyy');
        //    console.log( "the date is",$scope.date);
            $scope.invoice.TxnDate =  $scope.date;
            $scope.invoice.DueDate = $scope.date;
            // console.log( "the date invoice is",$scope.invoice.TxnDate);
            // console.log( "the duedate invoice is",$scope.invoice.DueDate);
         

            // $scope.CurrentDate = new Date();
        }








        $scope.setTax= function (value,value1,value2) {
           
            //debugger;
            $scope.Taxtype=value;
            $scope.TaxtypeType= value1;
            $scope.TaxtypeCustomName = value2 ;
// console.log("0",$scope.Taxtype);
//console.log("1",$scope.TaxtypeType);

            if(value1 == '1'){
                $scope.TaxtypeCustomName = 'VAT';
            }
            else if (value1 == '2'){
                $scope.TaxtypeCustomName = 'GST';
            }
            else{
                $scope.TaxtypeCustomName = value2;
            }
              //  $scope.IncTax =  $scope.Amounttax * ($scope.Taxtype/100);                
                    // $scope.IncTax = item.Amount * (Taxtype/100) 

            //  console.log("The VALUE IS", item.Amount);

    // console.log("The VALUE IS",  $scope.Taxtype);
    // console.log("The VALUE IS",  $scope.TaxtypeType);
    // console.log("The VALUE IS", $scope.TaxtypeCustomName);

        }







      
        // $scope.calculateTotalTax =function (){

        // }

        // $scope.toggleDisablingDropdown = function(){
        //   //  $scope.isDisable = $scope.checkBoxModel;
        // };
        // $scope.checkmodela = true;

        // $scope.updateCheckBox = function (value) { 
          
        //    if(value != 'undefined'){
        //        $scope.checkmodela = false;

        //    }
        // }









        //Fetch last invoice
        $scope.promise = InvoiceModel.GetLastInvoice();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.lastInvoiceDocNumber = response.data[0].DocNumber;

                });
            }
        });

        //Fetch Prefrences
        $scope.promise = SettingModel.GetPreferences();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.preferences = response.data.Preferences[0];
                    $scope.HaveClassObj = $scope.preferences.AccountingInfoPrefs.ClassTrackingPerTxnLine
                    if ($scope.HaveClassObj == true) {
                        $scope.HavingClassObj = true
                    } else {
                        $scope.HavingClassObj = false
                    }
                    console.log()

                });
            }
        });


        //Fetch Customers
        $scope.promise = InvoiceModel.GetCustomers();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.customers = response.data.items;
                    //$scope.customers=loadAll();
                });
            }
        });
        //Fetch Classes



        $scope.promise = InvoiceModel.GetClasses();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.ClassesItems = response.data.item;
                    $scope.ClassesItemslength = response.data.length;

                    if ($scope.ClassesItemslength > 0) {
                        $scope.HaveClass = true

                        // console.log($scope.ClassesItems)
                    } else {
                        $scope.HaveClass = false

                    }

                });

            }
        });
        $scope.SelectedClass = []
        $scope.ClassDataGet = function (SelectedClass, $index) {
            // console.log($index)
            $rootScope.ClassRef = {
                "name": SelectedClass.Name,
                "type": "",
                "value": SelectedClass.Id
            }
            $rootScope.ClassRefName = SelectedClass.Name
            $rootScope.ClassRefId = SelectedClass.Id
        //    console.log($rootScope.ClassRef)
            // ClassItemChange($rootScope.ClassRef,$index)

        }


        //Fetch Items
        $scope.promise = InvoiceModel.GetItems();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    // console.log(response.data.items.length);
                    $scope.apiProgressValue += 13;
                    for(var i=0; i<response.data.items.length; i++){
                        if(response.data.items[i].Active){
                            // debugger;
                    $scope.items.push(response.data.items[i]);
                        }
                        else{}
                    }
                    
                });
                
            }
            // console.log($scope.items);
        });
       
        //Fetch Tax
        $scope.promise = InvoiceModel.GetTaxRate();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.taxRate = response.data.items;
                   // console.log("$scope.taxRate", $scope.taxRate);
                   
                 //   $scope.taxname;
              //      console.log("the  is",$scope.taxRate);
                    myCallack($scope.taxRate);
                });
            }
        });
   
     //   console.log("the  yhd", $scope.taxRate)

        
        function myCallack(valuetax) {
            $rootScope.taxvalue =valuetax;
        //    console.log("bbbee", $rootScope.taxvalue);
          }

        // $scope.taxname = function()
        // {
        //    var data =[];
        
        //    for(var i = 0;i < $scope.taxRate.length;i++)
        //        for(var j = 0;j < $scope.taxRate[i].items.length;j++)
        //            data.push($scope.taxRate[i].items[j].Type);
        
        //     return data;
        // }



      
        $scope.promise = InvoiceModel.GeterpStatus();
        $scope.promise.then(function (response) {
            // $scope.setDate();
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.statustype = response.data;
                    $scope.statustypeforqb = $scope.statustype;
                    console.log("$",$scope.statustypeforqb.erp.type);
                    
                 //   $scope.taxname;
                 //  console.log("the tax rate isss", $scope.statustype);

                });
            }
        });



        



        //Fetch TaxCode
        $scope.promise = InvoiceModel.GetTaxCode();
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.taxCode = response.data.items;
                    //console.log($scope.taxCode);
                });
            }
        });

        function setTaxRateDetails() {
            //Getting tax code
            if ($scope.taxCode.length > 0) {
                var taxCodeName;
                var taxCodeId;
                angular.forEach($scope.taxCode, function (taxCodeInfo, key) {

                    if (taxCodeInfo.SalesTaxRateList != null && taxCodeInfo.Active == true) {

                        var RateValue = 0;
                        angular.forEach(taxCodeInfo.SalesTaxRateList.TaxRateDetail, function (TaxRateDetail, key) {
                            var TaxRateRef = TaxRateDetail.TaxRateRef;
                            var taxRate = $filter('filter')($scope.taxRate, {
                                'Id': TaxRateRef.value
                            }, true)[0];
                            if (taxRate != undefined) {
                                RateValue += parseFloat(taxRate.RateValue);
                            }

                        });

                        var NewTaxCode = {
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
        $scope.promise.then(function (response) {
            if (response.statuscode == 0) {
                $timeout(function () {
                    $scope.apiProgressValue += 13;
                    $scope.invoiceTerm = response.data.items;


                   // console.log("the termi is",  $scope.invoiceTerm);

                    if ($scope.invoiceTerm.length > 0) {
                        $scope.invoice.SalesTermRef.value = $scope.invoiceTerm[0].Id;
                      //   $scope.invoice.SalesTermRef.name = term.name;
                        $scope.setTerm();
                     //   $scope.setsDate();
                    }



                });
            }
        });

        // validate recurring intervale validation
        $scope.validateRecurringInterval = function () {
            var date = new Date($scope.Recurring.StartDate);
            $scope.showRecEndDateError = false;
            $scope.disabledSubmitButton = false;
            switch ($scope.Recurring.Interval.Mode) {
                case "Weekly":
                    $scope.Recurring.EndDate = new Date(date.setDate(date.getDate() + 7));
                    break;
                case "Biweekly":
                    $scope.Recurring.EndDate = new Date(date.setDate(date.getDate() + 14));
                    break;
                case "QuadWeekly":
                    $scope.Recurring.EndDate = new Date(date.setDate(date.getDate() + 28));
                    break;
                case "Monthly":
                    $scope.Recurring.EndDate = new Date(date.setMonth(date.getMonth() + 1));
                    break;
                case "Bimonthly":
                    $scope.Recurring.EndDate = new Date(date.setMonth(date.getMonth() + 2));
                    break;
                case "Quarterly":
                    $scope.Recurring.EndDate = new Date(date.setMonth(date.getMonth() + 3));
                    break;
                case "SemiAnnually":
                    $scope.Recurring.EndDate = new Date(date.setMonth(date.getMonth() + 6));
                    break;
                case "Annually":
                    $scope.Recurring.EndDate = new Date(date.setFullYear(date.getFullYear() + 1));
                    break;
                case "Biennially":
                    $scope.Recurring.EndDate = new Date(date.setFullYear(date.getFullYear() + 2));
                    break;
                default:
                    $scope.Recurring.EndDate = new Date();
            }
        };

        // Validate Recurring End Date
        $scope.validateRecuringEndDate = function () {
            $scope.showRecEndDateError = false;
            $scope.disabledSubmitButton = false;
            var EndDateDay = new Date($scope.Recurring.EndDate);
            switch ($scope.Recurring.Interval.Mode) {
                case "Weekly":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 7 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "Biweekly":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 14 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "QuadWeekly":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 28 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "Monthly":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 30 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "Bimonthly":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    console.log(Days);
                    if (Days % 60 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "Quarterly":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 120 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "SemiAnnually":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 180 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "Annually":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 365 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                case "Biennially":
                    var Days = Math.round(($scope.Recurring.EndDate - $scope.Recurring.StartDate) / (1000 * 60 * 60 * 24));
                    if (Days % 720 != 0) {
                        $scope.showRecEndDateError = true;
                        $scope.disabledSubmitButton = true;
                    }
                    break;
                default:

            }
        };

        function itemSelected() {
       //     console.log('value' ,  vm.selectedCustomer.customerInfo.customer_id);
   
       }







        $scope.loadingProgress = function () {
            return $timeout(function () {
                //
            }, 650);
        };

    
           
        $scope.createInvoice = function () {

            //debugger;
            var error = false;

            $scope.invoice.TxnDate = $filter('date')($scope.invoice.TxnDate, "yyyy-MM-dd");
            $scope.invoice.DueDate = $filter('date')($scope.invoice.DueDate, "yyyy-MM-dd");


            if ($scope.invoice.TotalAmt <= 0) {
                error = true;
                Clique.showToast("Invoice total should be greater than zero", "bottom right", "error");
            } else if ($scope.showRecurringOptions == true) {

                if ($scope.CCProfileResponse.profile_id == null) {
                    error = true;
                    Clique.showToast("Please configure customer payment information", "bottom right", "error");
                    $location.hash('payment_error');
                    $anchorScroll();
                }
            }

            if (error == false) {

                $scope.disabledSubmitButton = true;
                $scope.showProgress = true;


                if ($scope.showRecurringOptions) {
                    // $location.hash('recurring');
                    // $anchorScroll();
                    ///save recuring template///
                    var recurringParams = {
                        RecurringParams: $scope.Recurring,
                        InvoiceParams: $scope.invoice,
                        ProfileParams: {
                            profile_id: $scope.CCProfileResponse.profile_id
                        }
                    }
                    $scope.promise = InvoiceModel.createRecurringInvoice(recurringParams);
                    $scope.promise.then(function (response) {
                        if (response.statuscode == 0) {

                            Clique.showToast(response.statusmessage, "bottom right", "success");
                            $state.go('triangular.recurring');
                        } else {
                            Clique.showToast(response.statusmessage, "bottom right", "error");
                        }
                        $scope.showProgress = false;
                        $scope.disabledSubmitButton = false;

                    });
                } else {
                    // debugger;
                 //   $scope.invoice.TxnTaxDetail.TxnTaxCodeRef.value = "";
                    ///create only invoice////

                    console.log("$scope.invoice",$scope.invoice);
                    $scope.promise = InvoiceModel.createInvoice($scope.invoice);
                   

                    console.log("$scope.invoice",$scope.invoice);
                    $scope.invoice.InvoiceTaxRateRef.value = $scope.TaxtypeType;
                    $scope.invoice.InvoiceTaxRateRef.rate = $scope.Taxtype;
                    $scope.invoice.InvoiceTaxRateRef.name = $scope.TaxtypeCustomName;

                    $scope.promise.then(function (response) {
                       
                        if (response.statuscode == 0) {
 console.log("$scope.invoicetrue",$scope.invoice);
                            Clique.showToast(response.statusmessage, "bottom right", "Invoice Created Succesfully");
                            $state.go('triangular.invoice-list');
                        } else {
                            Clique.showToast(response.statusmessage, "bottom right", "error");
                            console.log("$scope.invoiceelse",$scope.invoice);
                        }
                        $scope.showProgress = false;
                        $scope.disabledSubmitButton = false;
                    });
                }


            }
        }
  
        function CustomerDialogController($window, $scope, $mdDialog, customerData, Countries) {


            $scope.hideDialogActions = false;
            $scope.customer = {};
            $scope.customer.DisplayName = customerData;
       //     console.log("the value of customer is", $scope.customer.DisplayName);

            $scope.loadCountries = function () {
                return $timeout(function () {
                    $scope.countries = Countries
                }, 650);
            };
            $scope.setCustomerShipping = function () {
                if ($scope.sameAsBilling == true) {
                    $scope.customer.ShipAddr = $scope.customer.BillAddr;
                } else {
                    $scope.customer.ShipAddr = {
                        Line1: "",
                        City: "",
                        Country: "",
                        CountrySubDivisionCode: "",
                        PostalCode: ""
                    }
                }
            }
            $scope.addNewCustomer = function (task) {
                if ($scope.sameAsBilling == true) {
                    $scope.customer.ShipAddr = $scope.customer.BillAddr;
                }
                $scope.showProgress = true;
                $scope.hideDialogActions = true;

                vm.promise = InvoiceModel.AddCustomer($scope.customer);
                vm.promise.then(function (response) {
                    if (response.statuscode == 0) {
                        Clique.showToast(response.statusmessage, 'bottom right', 'success');
                        $rootScope.$broadcast('add-customer-event', {
                            data: response.data
                        });
                    } else {
                        Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    }
                    $mdDialog.hide();
                });
            };
        }

        function ItemDialogController($window, $scope, $mdDialog, itemData, index) {
          
         
            $scope.hideDialogActions = false;
            $scope.item = {};
            $scope.item.Name = itemData;
            $scope.account_income = [];
            $scope.account_expense = [];
            $scope.account_asset = [];
            $scope.enableMoreInventoryFields = false;
            $scope.item.Taxable = true;
            $scope.item.Active = true;

            setsDate();
        
            $scope.adddecimalplacesitem =  function (value) {
                debugger;
                $scope.item.UnitPrice  = parseFloat(value).toFixed(2);
               
            }


            function setsDate() { 
         
                // var date = new Date();
                $scope.Date = $filter("date")(Date.now(), 'MM-dd-yyyy');
                console.log( "the date is",$scope.Date);
                $scope.item.InvStartDate =  $scope.Date;
              
                console.log( "the date invoice is",$scope.item.InvStartDate);
                // console.log( "the duedate invoice is",$scope.invoice.DueDate);
             
    
                // $scope.CurrentDate = new Date();
            }


            $scope.promise = InvoiceModel.GeterpStatus();
            $scope.promise.then(function (response) {
                // $scope.setDate();
                if (response.statuscode == 0) {
                    $timeout(function () {
                        $scope.apiProgressValue += 13;
                        $scope.statustype = response.data;
    
                     //   $scope.taxname;
                     //  console.log("the tax rate isss", $scope.statustype);
    
                    });
                }
            });



            //if($rootScope.account==undefined){
            $scope.promise = SettingModel.GetAccount();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    $timeout(function () {
                        $rootScope.account = response.data.items;
                        $scope.account = $rootScope.account;
                        if ($scope.account.length > 0) {

                            $scope.account_expense = $filter('filter')($scope.account, {
                                'AccountType': 'Cost of Goods Sold'
                            }, true);
                            $scope.account_income = $filter('filter')($scope.account, {
                                'AccountType': 'Income'
                            }, true);
                            $scope.account_asset = $filter('filter')($scope.account, {
                                'AccountType': 'Other Current Asset'
                            }, true);


                            $scope.item.IncomeAccountRef = {
                                value: $scope.account_income[0].Id
                            };
                            $scope.item.AssetAccountRef = {
                                value: $scope.account_asset[0].Id
                            };
                            $scope.item.ExpenseAccountRef = {
                                value: $scope.account_expense[0].Id
                            };


                        }
                    });
                }
            });


            if ($rootScope.categories == undefined) {
                $scope.promise = InvoiceModel.GetCategories();
                $scope.promise.then(function (response) {
                    if (response.statuscode == 0) {
                        $timeout(function () {
                            $rootScope.categories = response.data.items;
                            $scope.categories = $rootScope.categories;
                        });
                    }
                });
            } else {
                $scope.categories = $rootScope.categories;
            }

            $scope.$watch('item.ParentRef.value',
                function (newValue, oldValue) {
                    if (newValue != undefined) {
                        $scope.item.SubItem = true;
                    } else {
                        $scope.item.SubItem = false;
                        $scope.item.ParentRef = undefined;
                    }
                }
            );
            $scope.$watch('item.Type',
                function (newValue, oldValue) {

                    if (newValue == 'Inventory') {
                        $scope.enableMoreInventoryFields = true;
                        $scope.item.AssetAccountRef = {
                            value: $scope.account_asset[0].Id
                        };
                        $scope.item.TrackQtyOnHand = true;
                    } else {
                      
                        $scope.enableMoreInventoryFields = false;
                        $scope.item.QtyOnHand = undefined;
                    $scope.item.InvStartDate = $scope.item.InvStartDate;
                        $scope.item.AssetAccountRef = undefined;
                        $scope.item.TrackQtyOnHand = false;
                    }
                }
            );

            $scope.addNew = function (task) {
                $scope.showProgress = true;
                $scope.hideDialogActions = true;

                vm.promise = InvoiceModel.AddItem($scope.item);
                vm.promise.then(function (response) {
                    if (response.statuscode == 0) {
                        Clique.showToast(response.statusmessage, 'bottom right', 'success');
                        $rootScope.$broadcast('add-item-event', {
                            data: response.data,
                            index: index
                        });
                    } else {
                        Clique.showToast(response.statusmessage, 'bottom right', 'error');
                    }
                    $mdDialog.hide();
                });
            };
        }

        function TaxDialogController($window, $scope,  $rootScope,  $mdDialog, TaxModel ){

            $scope.item = {};
            $scope.item.Active = true;
           




            $scope.adddecimalplacestax =  function (value) {
                debugger;
                $scope.item.Rate  = parseFloat(value).toFixed(2);
               
            }



            $scope.addNewTax = function (task) {
                //   debugger;
                   // if($scope.item.id > 0) {
                   // //   Edit work 
                   // } else  {
                   //     //  save
                   // }
                   $scope.showProgress = true;
                   $scope.hideDialogActions = true;
                  
                   //addtax post data
                   vm.promise = TaxModel.AddTax($scope.item);
                   vm.promise.then(function (response) {
                $scope.myarray = [];
                $scope.myarray = response

            //       console.log("The responce 1 is", $scope.item);
                       if (response.statuscode == 0) {
            //       console.log("The responce2 is", response);
                    //      debugger;
                        //   $scope.taxRate.push($scope.item);
                  //      $scope.taxRate.push(response.data);
                           Clique.showToast(response.statusmessage, 'bottom right', 'Tax Created Successfully');
                           $rootScope.$broadcast('add-item-event', {
                               data: response.data,
                              
                           });
                       }
                       
                       
                       else {
                           Clique.showToast(response.statusmessage, 'bottom right', 'error');
                       }
                    //    console.log("the taxrate1", $rootScope.taxvalue);
                    //   $rootScope.taxvalue.push(response.data)
                    $rootScope.taxvalue.push(response.data)
                       $mdDialog.hide();
                   });
               };


            

               
        $scope.cancel = function () {
            
            $mdDialog.cancel();
        }
        $scope.hide = function () {
            $mdDialog.hide();
        }




        }

        // ******************************
        // Recurring methods
        // ******************************
        $scope.Recurring = {
            //Type:'Scheduled',
            //Days:0,
            Interval: {
                Mode: 'Daily'
                //Every:1,
                //On:'day',
                //Of:'1'
            }

        };

        $scope.intervals = $scope.intervals || [{
            value: 'Daily',
            name: 'Daily'
        },
        {
            value: 'Weekly',
            name: 'Weekly (Every seven days)'
        },
        {
            value: 'Biweekly',
            name: 'Biweekly (Every fourteen days)'
        },
        {
            value: 'QuadWeekly',
            name: 'Quad Weekly (Every twenty-eight days)'
        },
        {
            value: 'Monthly',
            name: 'Monthly (By calendar month)'
        },
        {
            value: 'Bimonthly',
            name: 'Bimonthly (Every two calendar months)'
        },
        {
            value: 'Quarterly',
            name: 'Quarterly (Every three calendar months)'
        },
        {
            value: 'SemiAnnually',
            name: 'Semi-annually (Every six calendar months)'
        },
        {
            value: 'Annually',
            name: 'Annually'
        },
        {
            value: 'Biennially',
            name: 'Biennially (Every two years)'
        },

        ];

        $scope.dailyends = $scope.dailyends || [{
            value: 'none',
            name: 'None'
        },
        {
            value: 'by',
            name: 'By'
        },
        {
            value: 'after',
            name: 'After'
        }

        ];

        $scope.weeks = $scope.weeks || [{
            value: 'mon',
            name: 'Monday'
        },
        {
            value: 'tue',
            name: 'Tuesday'
        },
        {
            value: 'wed',
            name: 'Wednesday'
        },
        {
            value: 'thu',
            name: 'Thursday'
        },
        {
            value: 'fri',
            name: 'Friday'
        },
        {
            value: 'sat',
            name: 'Saturday'
        },
        {
            value: 'sun',
            name: 'Sunday'
        },

        ];
        $scope.monthoptions = $scope.monthoptions || [{
            value: 'day',
            name: 'Day'
        },
        {
            value: '1st',
            name: 'First'
        },
        {
            value: '2nd',
            name: 'Second'
        },
        {
            value: '3rd',
            name: 'Third'
        },
        {
            value: '4rth',
            name: 'Fourth'
        },
        {
            value: 'last',
            name: 'Last'
        }

        ];
        var totaldaysInMonth = daysInMonth();
        $scope.months = countNumberOfDays(totaldaysInMonth);

        $scope.monthdropdownlists = $scope.monthdropdownlists || [{
            value: 1,
            name: 'January'
        },
        {
            value: 2,
            name: 'February'
        },
        {
            value: 3,
            name: 'March'
        },
        {
            value: 4,
            name: 'April'
        },
        {
            value: 5,
            name: 'May'
        },
        {
            value: 6,
            name: 'June'
        },
        {
            value: 7,
            name: 'July'
        },
        {
            value: 8,
            name: 'August'
        },
        {
            value: 9,
            name: 'September'
        },
        {
            value: 10,
            name: 'October'
        },
        {
            value: 11,
            name: 'November'
        },
        {
            value: 12,
            name: 'December'
        }
        ];

        $scope.restValue = function () {
            $scope.Recurring = {};
        };

        function daysInMonth() {

            var today = new Date();
            var month = today.getMonth() + 1;
            var numberofday = new Date(today.getFullYear(), month, 0).getDate();
            return numberofday;
        }

        function countNumberOfDays(days) {
            $scope.month = [];
            for (var i = 1; i <= 28; i++) {
                $scope.month.push(i);
            }
            $scope.month.push('last');
            var months = $scope.month;
            return months;
        }
        $scope.onChange = function (monthoption) {
            if ((monthoption.value != 0) && (monthoption != 0)) {
                $scope.showMonthDays = true;
            } else {
                var totaldaysInMonth = daysInMonth();
                $scope.months = countNumberOfDays(totaldaysInMonth);
                $scope.showMonthDays = false;
            }
        };

        // if (vm.selectedCustomer != null) {
        //     document.getElementById('recurringOptions').style.margin = "-72px 0 0 0";
        // } else {
        //     document.getElementById('recurringOptions').style.margin = "0 0 0 0";
        // }
        $scope.enableRecurring = function () {
          //  debugger;
            if (vm.selectedCustomer != null &&  $scope.showProfileGetProgress == false) {
                document.getElementById('recurringOptions').style.margin = "6px 0 0 0";
            }
            if (vm.selectedCustomer != null &&  $scope.isCCProfileCreated != false) {
                document.getElementById('recurringOptions').style.margin = "-72px 0 0 0";
            }
             else {
                document.getElementById('recurringOptions').style.margin = "0px 0 0 0";
            }

            $scope.showRecurringOptions = true;
            $scope.requiredRecurringEndDate = false;
            $scope.requiredRecurringOccurences = true;
            $scope.showRecurringOptions = true;
            $scope.createInvoiceBtnTitle = "Create Recurring";
            // $location.hash('recurring');
            // $anchorScroll();
            $scope.Recurring = {
                //Type:'Scheduled',
                Name: '',
                //Days:0,
                Interval: {
                    Mode: 'Daily'
                    //Every:1,
                    //On:'day',
                    //Of:'1'
                },
                End: 'after',
                StartDate: new Date(),
                EndDate: new Date()
            };
        }
        $scope.disableRecurring = function () {
            
            document.getElementById('recurringOptions').style.margin = "0 0 0 0";
            $scope.Recurring = {
                //Type:'Scheduled',
                Name: '',
                //Days:0,
                Interval: {
                    Mode: 'Daily'
                    //Every:1,
                    //On:'day',
                    //Of:'1'
                },
                //End : 'after',
                //StartDate: new Date()
            };
            $scope.showRecurringOptions = false;
            $scope.requiredRecurringEndDate = false;
            $scope.requiredRecurringOccurences = false;

            $scope.createInvoiceBtnTitle = "Create Invoice";
            $location.hash('invoice');
            $anchorScroll();
        }



        $scope.$watch('Recurring.Interval.Mode',
            function (newValue, oldValue) {
                //console.log("---");
                switch (newValue) {
                    case 'D':
                        $scope.Recurring.Interval = {
                            Mode: 'D',
                            Every: 1
                        }
                        break;
                    case 'W':
                        $scope.Recurring.Interval = {
                            Mode: 'W',
                            Every: 1,
                            On: 'mon'
                        }
                        break;
                    case 'M':
                        $scope.Recurring.Interval = {
                            Mode: 'M',
                            Every: 1,
                            On: 'day',
                            Of: '1'
                        }
                        break;
                    case 'Y':
                        $scope.Recurring.Interval = {
                            Mode: 'Y',
                            Every: 1,
                            On: '1'

                        }
                        break;
                }
            }
        );
        $scope.$watch('Recurring.Interval.On',
            function (newValue, oldValue) {
                if ($scope.Recurring.Interval.Mode == 'M') {
                    if (newValue != 'day') {
                        $scope.Recurring.Interval = {
                            Mode: 'M',
                            Every: 1,
                            On: newValue,
                            Of: 'mon'
                        }
                    } else {
                        $scope.Recurring.Interval = {
                            Mode: 'M',
                            Every: 1,
                            On: 'day',
                            Of: '1'
                        }
                    }
                }

            }
        );
        $scope.$watch('Recurring.End',
            function (newValue, oldValue) {

                if (newValue == 'by') {
                    $scope.requiredRecurringEndDate = true;
                    $scope.requiredRecurringOccurences = false;
                } else if (newValue == 'after') {
                    $scope.requiredRecurringEndDate = false;
                    $scope.requiredRecurringOccurences = true;
                } else {
                    $scope.requiredRecurringEndDate = false;
                    $scope.requiredRecurringOccurences = false;
                }


            }
        );


        // ******************************
        // Payment Methods
        // ******************************

        $scope.CCProfileResponse = {};
        $scope.isCCProfileCreated = false;
        $scope.customerSelectedProfileIndex = 0;
        $scope.showProfileGetProgress = false;
        $scope.ccprofiles = [];

        function getCustomerCardProfile() {
           // debugger;
            if ($scope.invoice.CustomerRef != null) {
                $scope.showProfileGetProgress = true;
                var customer_id = $scope.invoice.CustomerRef.value;
                var customer = {
                    customer_id: customer_id
                }
                $scope.CCProfileResponse = {};
                $scope.isCCProfileCreated = false;

                $scope.promise = InvoiceModel.ProfileGet(customer);
                $scope.promise.then(function (response) {
                    if (response.statuscode == 0) {
                      //  debugger;
                        if (response.data.total_item > 0) {
                           // debugger;
                            $scope.CCProfileResponse = response.data.item[0];
                            $scope.ccprofiles = response.data.item;
                            $scope.isCCProfileCreated = true;
                            if (vm.selectedCustomer != null &&  $scope.showProfileGetProgress == false) {
                                document.getElementById('recurringOptions').style.margin = "6px 0 0 0";
                            }
                            if (vm.selectedCustomer != null &&  $scope.isCCProfileCreated != false) {
                                document.getElementById('recurringOptions').style.margin = "-72px 0 0 0";
                            }
                             else {
                                document.getElementById('recurringOptions').style.margin = "0px 0 0 0";
                            }
                        }
                    }
                    $scope.showProfileGetProgress = false;
                });
            }
        }

        $scope.setupPayment = function () {

            $scope.promise = SettingModel.GetPaymentInfo();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    if (response.data.total_count > 0) {
                        $scope.paymentInfo = response.data.items[0];
                    }
                }
            });

            $mdDialog.show({
                locals: {
                    pparams: {
                        mode: 'profileadd',
                        customer_id: $scope.invoice.CustomerRef.value
                    }
                },
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                templateUrl: 'app/modules/invoice/payment/recurring_profile.html',
                clickOutsideToClose: true,
                fullscreen: true,
                controller: ProfileCreateDialogController
            }).then(function () {
                //if(!$scope.cancelProfile)
                //$scope.legalDocumentDialog();
            }, function () {

            });

        }


        $scope.legalDocumentDialog = function () {
            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                templateUrl: 'app/modules/invoice/legaldocument/legaldocument.html',
                clickOutsideToClose: true,
                fullscreen: true,
                controller: 'LegalDocumentController'
            });
        }


        $scope.cancelInvoice = function () {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Are you sure you want to cancel without save?')
                .ariaLabel('Lucky day')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                $state.go('triangular.invoice-list');
            }, function () { });
        }

        function ProfileCreateDialogController($window, $scope, $mdDialog, pparams) {
            /*fab controller*/
            vm.fabDirections = ['up', 'down', 'left', 'right'];
            vm.fabDirection = vm.fabDirections[2];
            vm.fabAnimations = ['md-fling', 'md-scale'];
            vm.fabAnimation = vm.fabAnimations[1];
            vm.fabStatuses = [false, true];
            vm.fabStatus = vm.fabStatuses[0];
            vm.share = true;
            /*eof fab controller*/

            $scope.activePaymentMethods = {
                creditcard: false,
                ach: false,
                // bolt: false,
                // tripos_ipp350: false,
                // cash: false
            };
            $scope.paymentMode = 'creditcard'
            $scope.changePaymentMode = function (type) {
                // resetChargeAmount()
                // $scope.ccprofile = JSON.parse('{"profile_id":0, "last_digits":"0"}');
                $scope.paymentMode = type;
                // $scope.UpdateCCFields({
                //     "profile_id": 0
                // });

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
                         //   console.log("i am here")
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









            $scope.cancelProfile = false;
            //creditcard
            $scope.requiredMonthField = true;
            $scope.requiredYearField = true;
            $scope.requiredCreditCardNumber = true;
            $scope.requiredCardHolderName = true;
            $scope.currentYear = new Date().getFullYear();
            $scope.payform = {};
            $scope.declined_message = "";
            $scope.ccPattern = /^[0-9]+$/;
            $scope.ccinfo = {
                type: undefined
            }

            $scope.selectProfile = function (profile_index) {
                $scope.CCProfileResponse = $scope.ccprofiles[profile_index];
                $mdDialog.hide();
            }
            $scope.submit = function (mode) {
                CreateProfile(mode);
            };

            function CreateProfile(mode) {
           //   debugger;

                $scope.disabledChargeButton = true;
                $timeout(function () {
                    $scope.declined_message = "";
                });
                $scope.showProgress = true;
                if ($scope.paymentMode == 'ach') {
                    var paymentObj = {

                        paymentinfo: {
                            TransType: "profile_add",
                            Type: "profileadd",
                            Achinfo: {
                                account: $scope.payform.account,
                                name: $scope.payform.name,
                                bankaba: $scope.payform.bankaba,
                            },
                            Custom: {
                                CustomerRef: {
                                    Id: $scope.invoice.CustomerRef.value,
                                    Name: $scope.invoice.CustomerRef.name
                                }
                            }
                        }
                    }
                } else {
                    var paymentObj = {
                        paymentinfo: {
                            Streetaddress: $scope.payform.streetaddress,
                            Zipcode: $scope.payform.zipcode,
                            TransType: 'profile_add',
                            Type: 'profileadd',
                            Cardinfo: {
                                Cardholder: $scope.payform.cardholder,
                                CreditCardNumber: $scope.payform.cardnumber,
                                Month: $scope.payform.months,
                                Year: $scope.payform.years,
                                CCV2: $scope.payform.cc2,
                                CardType: $scope.ccinfo.type,
                                CreateCardProfile: $scope.payform.card_profile
                            },
                            Custom: {
                                CustomerRef: {
                                    Id: $scope.invoice.CustomerRef.value,
                                    Name: $scope.invoice.CustomerRef.name

                                }
                            }
                        }
                    };
                }
                $scope.promise = InvoiceModel.ProfileAdd(paymentObj);
                $scope.promise.then(function (response) {
                //    debugger;
                    $scope.disabledChargeButton = false;
                    if (response.statuscode == 0) {
                        $scope.payform = {};
                        $scope.isPaymentSuccess = true;
                        $scope.showEmailDialog = false;
                        $scope.ccprofiles.push(response.data);
                        $scope.CCProfileResponse = response.data;
                        $scope.isCCProfileCreated = true;
                        if (vm.selectedCustomer != null &&  $scope.showProfileGetProgress == false) {
                            document.getElementById('recurringOptions').style.margin = "6px 0 0 0";
                        }
                        if (vm.selectedCustomer != null &&  $scope.isCCProfileCreated != false) {
                            document.getElementById('recurringOptions').style.margin = "-72px 0 0 0";
                        }
                         else {
                            document.getElementById('recurringOptions').style.margin = "0px 0 0 0";
                        }
                        Clique.showToast(response.statusmessage, "bottom right", "success");
                        $mdDialog.hide();

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
                            //$scope.declined_message=response.statusmessage;
                            $scope.checkoutForm.$setUntouched();
                            $scope.checkoutForm.$setPristine();
                        });
                        $scope.isPaymentSuccess = false;
                        $scope.transactionResponse = {};
                    }
                    $scope.showProgress = false;
                });
            }
            $scope.cancel = function () {
                $scope.cancelProfile = true;
                $mdDialog.hide();
            }

        }

    }

})();
