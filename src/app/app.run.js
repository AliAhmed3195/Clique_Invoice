(function () {
  'use strict';

  angular
    .module('app')
    .run(runFunction)
    .constant('api', '/some/api/info')
    .config(function ($mdDateLocaleProvider) {
      $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('MM/DD/YYYY');
      };
    })
    .service('dataService', function () {
      // private variable
      var _dataObj = {};

      // public API
      this.dataObj = _dataObj;
    })
    .directive('numberFormatter', ['$filter', function ($filter) {
      var decimalCases = 2,
        whatToSet = function (str) {
          /**
           * TODO:
           * don't allow any non digits character, except decimal seperator character
           */

          return str ? Number(str) : '';
        },
        whatToShow = function (num) {

          return $filter('number')(num, decimalCases);
        };

      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
          ngModel.$parsers.push(whatToSet);
          ngModel.$formatters.push(whatToShow);

          element.bind('blur', function () {
            /*if(ngModel.$modelValue > attr.max){
              element.val(whatToShow(attr.max))  
            }else{
               element.val(whatToShow(ngModel.$modelValue))  
            }*/
            element.val(whatToShow(ngModel.$modelValue))

          });
          element.bind('focus', function () {
            element.val(ngModel.$modelValue);
          });
        }
      };
    }])
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
    .directive
    ('creditCardType'
      , function () {
        var directive =
        {
          require: 'ngModel'
          , link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (value) {
              scope.ccinfo.type =
                (/^5[1-5]/.test(value)) ? "master"
                  : (/^4/.test(value)) ? "visa"
                    : (/^3[47]/.test(value)) ? 'amex'
                      : (/^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))/.test(value)) ? 'discover'
                        : undefined
              ctrl.$setValidity('inavalid', !!scope.ccinfo.type)
              return value
            })
          }
        }
        return directive
      }
    )
    .service('helper', function () {
      // private variable


      var checkHardwareModel = function (paymentObject, hardwareName) {

        
        if (paymentObject.hasOwnProperty('configuration')) {
          if (paymentObject.configuration.hasOwnProperty('hardware')) {
            if (paymentObject.configuration.hardware.hasOwnProperty(hardwareName)) {
              return true;
            }
          }
        }
        return false;
      }
      var getAutoIncrementInvoiceNo = function (docNumber) {
        var numberPattern = /\d+/g;

        var getNonNumberSegment = []
        var getNumbericSegment = [];
        if (docNumber.split(numberPattern) != null) {
          getNonNumberSegment = docNumber.split(numberPattern);
        }
        if (docNumber.match(numberPattern) != null) {
          getNumbericSegment = docNumber.match(numberPattern);
        }
        if (getNumbericSegment != null) {
          var last_digit = parseInt(getNumbericSegment[getNumbericSegment.length - 1]);
          last_digit = ++last_digit;
          getNumbericSegment[getNumbericSegment.length - 1] = last_digit.toString();
        }

        var newDocNumber = "";


        if (getNonNumberSegment.length > getNumbericSegment.length) {
          for (i = 0; i < getNonNumberSegment.length; i++) {
            newDocNumber += getNonNumberSegment[i];
            if (i < getNumbericSegment.length)
              newDocNumber += getNumbericSegment[i];
          }
        } else {

          for (i = 0; i < getNumbericSegment.length; i++) {
            newDocNumber += getNumbericSegment[i];
            if (i < getNonNumberSegment.length)
              newDocNumber += getNonNumberSegment[i];
          }
        }
        if (newDocNumber == "") {
          return "1";
        }
        return newDocNumber;

      }

      return {
        getAutoIncrementInvoiceNo: getAutoIncrementInvoiceNo,
        checkHardwareModel: checkHardwareModel

      };
    })
    .directive('stickyText', function ($mdSticky, $compile) {
      return {
        restrict: 'E',
        template: '<span>Sticky Text</span>',
        link: function (scope, element) {
          $mdSticky(scope, element);
        }
      }
    })
    .directive('scrolly', function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          var raw = element[0];
          console.log("---scroll-----");
          console.log(raw);
          element.bind('scroll', function () {
            var recordleft = parseInt(attrs.recordleft);
            /*console.log("---scroll-----");
            console.log(raw.scrollTop);
            console.log(raw.offsetHeight);
            console.log(raw.scrollHeight);*/
            /*console.log(scope.transactions.length);
            console.log(scope.tblData.length);*/
            //console.log(attrs.recordleft);


            //console.log('in scroll');
            //console.log(raw.scrollTop + raw.offsetHeight);


            //if (raw.scrollTop == 0) {
            if (
              (raw.scrollTop + raw.offsetHeight) == raw.scrollHeight
              &&
              recordleft > 0
            ) {
              raw.scrollTop = raw.scrollHeight - 700;
              //console.log("---new scroll-----");
              //console.log(raw.scrollTop);
              //raw.scrollTop=(raw.scrollTop + raw.offsetHeight)-1400;
              //raw.scrollHeight=0;
              scope.activated = true;
              scope.$apply(attrs.scrolly);
            } else {
              scope.activated = false;
            }
          });
        }
      };
    });



  /* @ngInject */
  function runFunction($rootScope, Clique, $state, $location, InvoiceModel, SettingModel, $http, DashboardModel) {
    var vm = this;
    // customer token 9c4f7039d8fc5117e92905642fa7f144ac66363f
    // admin token 82304a3318ef6fe6d58429a0301c2c5864a71c69
   //$http.defaults.headers.common.DEBUG = "Token 7c96ca80fabe419e1a1c23d6bf5cbf2d0f110f87"
    function redirectError() {
      $state.go('500');
    }
    getCount()
    // redirect all errors to permissions to 500
    var errorHandle = $rootScope.$on('$stateChangeError', redirectError);

    // remove watch on destroy
    $rootScope.$on('$destroy', function () {
      errorHandle();
    });

    // count for messages
    function getCount() {
      return Clique.callService('get', '/invoice/totalunreadcount/', '').then(handleSuccess, handleError);
    }
    // private functions
    function handleSuccess(res) {
      return res.data;
    }
    function handleError(error) {
      //console.log(error);
      return error;
    }
    // $http({

    //   method: 'GET',

    //   url: 'http://192.168.10.200:8000/v1/invoice/totalunreadcount/',


    //   }).then(function success(response) {

    //        console.log('count is a ' , response.data.data)

    //       $rootScope.msgCounter = response.data.data

    //      localStorage.setItem("count", $rootScope.msgCounter);



    //   }, function error(response) {


    //   });




    // vm.promise = DashboardModel.GetTotalUnread();
    // vm.promise.then(function (response) {
    //     debugger;
    //    if(response.statuscode === 0) {
    //        console.log('count is ' , response.data)
    //        sessionStorage.setItem("count", response.data);
    //        localStorage.setItem("count", response.data);
    //    }
    // });

    //navigator.onLine
    var savedCustomer = JSON.parse(localStorage.getItem("customers"));
    //alert(savedCustomer)
    //if(savedCustomer==null){
    //if(localStorage.getItem("authtoken")!=null){
    /*$rootScope.promise = InvoiceModel.GetCustomers();
    $rootScope.promise.then(function(response){
    if(response.statuscode==0){
        var total_count=response.data.total_count;
        var items=response.data.items;
        var customers=[];
       
        angular.forEach(items, function(value, key){
            var customer={
                id:value.Id,
                name:value.DisplayName
            };
            customers.push(customer)
        });
        if (typeof(Storage) !== "undefined") {
              localStorage.setItem("customers", JSON.stringify(customers));
            } 
        
    }
    });*/
    //}
    //}
  }

})();
