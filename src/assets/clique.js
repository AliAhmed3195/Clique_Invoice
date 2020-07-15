//unminify.com/
//minifier.org/
(function () {
  'use strict';
  var appName = document.getElementsByTagName("html")[0].getAttribute("ng-app");
  if (appName == null) {
    alert("Seem like your ng-app is not defined")
  }
  angular.module(appName).constant("CliqueConstant", {
    date_mdy: "MM/dd/yyyy",
    date_timestamp: "'medium'"
  }).factory('Clique', Clique).filter('formatDate', function (dateFilter) {
    var formattedDate = '';
    return function (dt) {
      formattedDate = dateFilter(new Date(dt.split('-').join('/')), 'd/M/yyyy');
      return formattedDate
    }
  }).filter('ordinal', function () {
    var ordinal = "";
    return function (n) {
      ordinal = Math.floor(n / 10) === 1 ? 'th' : (n % 10 === 1 ? 'st' : (n % 10 === 2 ? 'nd' : (n % 10 === 3 ? 'rd' : 'th')));
      return n + ordinal
    }
  }).filter('transType', function () {
    var trans_type = ""
    return function (value) {
      switch (value) {
        case "sale":
          trans_type = "Sale";
          break;
        case "void":
          trans_type = "Void";
          break;
        case "refund":
          trans_type = "Refund";
          break;
        case "profile_delete":
          trans_type = "Profile Delete";
          break;
        case "profile_update":
          trans_type = "Profile Update";
          break;
        case "profile_refund":
          trans_type = "Profile Refund";
          break;
        case "profile_void":
          trans_type = "Profile Void";
          break;
        case "profile_sale":
          trans_type = "Profile Sale";
          break;
        case "bolt_sale":
          trans_type = "Bolt Sale";
          break;
        case "cash":
          trans_type = "Cash";
          break;
        case "ach_sale":
          trans_type = "Ach Sale";
          break;
        case "triposipp350_credit":
          trans_type = "Tripos Credit";
          break;
        case "triposipp350_debit":
          trans_type = "Tripos Debit";
          break;
        case "triposipp350_gift":
          trans_type = "Tripos Gift";
          break
      }
      return trans_type
    }
  }).filter('processType', function () {
    var process_type = ""
    return function (value) {
      switch (value) {
        case "invoice":
          process_type = "Invoice";
          break;
        case "salesreceipt":
          process_type = "Sale Receipt";
          break
        case "saleorder":
          process_type = "Sale Order";
          break
        case "receivepayment":
          process_type = "Receive Payment";
          break
      }
      return process_type
    }
  }).filter('parseInt', function () {
    return function (value) {
      return parseFloat(value)
    }
  });
  Clique.$inject = ['$mdToast', '$http', '$q', '$rootScope', '$cookieStore', '$location', '$window', '$cookies', '$mdDialog'];

  function Clique($mdToast, $http, $q, $rootScope, $cookieStore, $location, $window, $cookies, $mdDialog) {
    var service = {};
    var url;
    var localApiRoute = !0;
    var env = localStorage.getItem("env");
    var ip = localStorage.getItem("ip");
    var debug_token = localStorage.getItem("debug_token");
    var requestBin = localStorage.getItem("requestBin");
    var windowlocation = window.location;
    //console.log("--windowlocation--");


    switch (env) {
      case "localhost":
        url = "http://localhost/slim/paysync/public/";
        break;
      case "ahsanlocal":
        url = "http://ahsan.local:8000/";
        break;
      case "cliquelocal":
        url = "http://clique.local:8000/";
        break;
      case "staging":
        url = "https://staging.clique.center:8443/";
        break;
      case "ip":
        url = ip;
        break;
      default:
        url = "https://apps.clique.center/";
        if (windowlocation.origin != undefined) {
          url = windowlocation.origin + "/";
        }
        break
    }
    service.api = {
      url: url,
      version: "v1",
      debug: !1
    };
    service.topMenus = [{
      name: "My Profile",
      url: "/apps/settings/",
      icon: "icon-account"
    }, {
      name: "Change Password",
      url: "/apps/settings/changepassword",
      icon: "icon-lock"
    }, {
      name: "Logout",
      url: "/apps/account/logout",
      icon: "icon-logout"
    }];
    service.showToast = showToast;
    service.callService = callService;
    service.getUserName = getUserName;
    service.getUserInfo = getUserInfo;
   
    service.closeDialog = closeDialog;
    service.getServiceUrl = getServiceUrl;
    service.configApp = configApp;
    return service;

    function configApp() {
      var configObj = {}
      var favLink = document.getElementById('favIcon');
      if (window.location.href.indexOf("instantinvoice") != -1) {
        document.title = "InstantInvoice";
        configObj.appName = "InstantInvoice";
        favLink.href = "https://app.instantinvoice.com/apps/common/assets/images/instantinvoice.ico";
        configObj.appLogo = "https://app.instantinvoice.com/apps/common/assets/images/logo/instantinvoice.png";
        configObj.CPappLogo = "https://app.instantinvoice.com/apps/common/assets/images/logo/instantinvoice.png";
        configObj.qbFinAppLogo = "https://app.instantinvoice.com/apps/common/assets/images/maincircle.jpg";

        configObj.bgImg = "assets/images/backgrounds/registerbackground/bgimg.jpeg";
        configObj.bgImg1 = "assets/images/backgrounds/registerbackground/bgimg.jpeg";
        configObj.bgImg2 = "assets/images/backgrounds/registerbackground/bgimg.jpeg";
        configObj.appLogo = "http://instantinvoice.com/wp-content/themes/instantinvoice/images/logo.png";
      } else if (window.location.href.indexOf("clique") != -1) {
        document.title = "Clique";
        configObj.appName = "Clique";
        favLink.href = "https://apps.clique.center/apps/common/assets/images/clique.ico";
        configObj.appLogo = "https://apps.clique.center/apps/common/assets/images/logo/clique.png";
        configObj.CPappLogo = "https://apps.clique.center/apps/common/assets/images/logo/cliqueWithoutCardconnect.png";
        configObj.qbFinAppLogo = "https://apps.clique.center/apps/common/assets/images/maincircle.png";

        configObj.bgImg = "assets/images/backgrounds/registerbackground/new3.jpg";
        configObj.bgImg1 = "assets/images/backgrounds/registerbackground/new1.jpg";
        configObj.bgImg2 = "assets/images/backgrounds/registerbackground/new2.jpg";
        // configObj.bgImg5 = "";      
      } else {
        document.title = "Clique";
        configObj.appName = "Clique";
        favLink.href = "https://apps.clique.center/apps/common/assets/images/clique.ico";
        configObj.appLogo = "https://apps.clique.center/apps/common/assets/images/logo/clique.png";
        configObj.CPappLogo = "https://apps.clique.center/apps/common/assets/images/logo/cliqueWithoutCardconnect.png";
        configObj.qbFinAppLogo = "https://apps.clique.center/apps/common/assets/images/maincircle.png";

        configObj.bgImg = "assets/images/backgrounds/registerbackground/new3.jpg";
        configObj.bgImg1 = "assets/images/backgrounds/registerbackground/new1.jpg";
        configObj.bgImg2 = "assets/images/backgrounds/registerbackground/new2.jpg";
      }
      return configObj
    }



    
    function closeDialog() {
      console.log("Close event fire")
    }

    function showToast(message, position, type) {
      switch (message) {
        case 'unauthorized':
          break;
        default:
          var messageClass = (type == 'success' ? 'green' : 'red');
          var style = "";
          if (type == 'success') {
            style = "background-color:rgba(105, 98, 98, 0.87);"
          } else if (type == 'error') {
            style = "background-color:#E53935;"
          } else if (type == 'info') {
            style = "background-color:rgba(105, 98, 98, 0.87);"
          } else {
            style = "background-color:rgba(105, 98, 98, 0.87);"
          }
          $mdToast.show({
            template: '<md-toast class="md-toast" >' + '<div  class="' + messageClass + ' md-toast-content ' + type + '"  style="' + style + '">' + message + '</div>' + '</md-toast>',
            hideDelay: 2000,
            position: 'top right'
          });
          break
      }
    }

    function callService(method, endPoint, params, appContentType) {
      var deferred = $q.defer();
      var apiUrl = service.api.url + service.api.version + endPoint;
      var applicationType;
      if (appContentType == "") {
        appContentType = "json"
      }
      var debug = {
        params: '',
        status: '',
        url: apiUrl,
        header: '',
        data: ''
      }
      var l_app_id = localStorage.getItem("app_id");
      var s_app_id = sessionStorage.getItem("app_id");
      var mytokeen = localStorage.getItem("token");
      var app_id = "";
      if (s_app_id != undefined) {
        app_id = s_app_id;
      } else {
        app_id = l_app_id;
      }
      var mode = localStorage.getItem("mode");
      var env = localStorage.getItem("env");
      if (app_id != undefined) {
        $http.defaults.headers.common.APPID = app_id
      }
      //console.log(service.api.url);
      if (
        service.api.url != 'https://apps.clique.center/' &&
        service.api.url != 'https://staging.clique.center:8443/' &&
        service.api.url != 'http://staging.clique.center:8080/' &&
        service.api.url != 'https://staging.clique.center/' &&
        service.api.url != 'http://staging.clique.center/'

      ) {
        /*if (mode == "QA") {
            $http.defaults.headers.common.DEBUG = "Token 973af70cb2c43b587da457954f68957a45e8af67"
        } else {
            $http.defaults.headers.common.DEBUG = "Token 9c4f7039d8fc5117e92905642fa7f144ac66363f"
        }*/
        var localAuth = $cookies.get("LOCALAUTH");
        console.log("-----localAuth---");
        console.log(localAuth);
        if (localAuth != undefined) {
          $http.defaults.headers.common.DEBUG = "Token " + localAuth;
        } else {
          // 9c4f7039d8fc5117e92905642fa7f144ac66363f merchant
          //  for customer 9c4f7039d8fc5117e92905642fa7f144ac66363f // ahsan sys
          //  for admin 82304a3318ef6fe6d58429a0301c2c5864a71c69 // ammad sys
          $http.defaults.headers.common.DEBUG = "Token 9c4f7039d8fc5117e92905642fa7f144ac66363f"
        }
      }
      switch (method) {
        case "get":
          $http.get(apiUrl,{
    headers: {'channelid': '123456', 'Authorization' : 'Token '+mytokeen}
}).then(function (response) {
            deferred.resolve(response);
            debug.data = response.data;
            debug.status = "Success"
          }).catch(function (response) {
            var error = {
              statuscode: 1,
              status: response.status,
              statusmessage: "unauthorized"
            };
            deferred.reject(error);
            serviceError(response);
            debug.data = error;
            debug.status = "ERROR"
          });
          if (requestBin != null) {
            console.log(requestBin);
            $http.get(requestBin).then(function (response) {
              console.log("---Completed: Request Bin Get Request---")
            }).catch(function (response) {
              console.log("---Error: Request Bin Get Request---")
            })
          }
          break;
        case "post":
          var postParams
          switch (appContentType) {
            case "form":
              postParams = {
                transformRequest: angular.identity,
                headers: {
                  'Content-Type': undefined,
          'channelid' : '123456',
          'Authorization' : 'Token '+mytokeen
                }
              };
              break;
            case "json":
              postParams = {
                headers: {
                  'Content-Type': 'application/json',
          'channelid' : '123456',
          'Authorization' : 'Token '+mytokeen
                }
              };
              break;
          }
          $http.defaults.headers.common['x-csrftoken'] = $cookies.get("csrftoken");
          debug.params = params;
          $http.post(apiUrl, params, {
            headers: {'channelid': '123456', 'Authorization' : 'Token '+mytokeen}
        }).then(function (response) {
            deferred.resolve(response);
            debug.data = response.data;
            debug.status = "Success"
          }).catch(function (response) {
            var error = {
              statuscode: 1,
              status: response.status,
              statusmessage: "unauthorized"
            };
            deferred.reject(error);
            serviceError(response);
            debug.data = error;
            debug.status = "ERROR"
          });
          break
      }
      if (service.api.debug == !0) {
        console.log("API:", endPoint);
        console.log(debug);
        console.log($http.defaults)
      }
      return deferred.promise
    }

    function serviceError(response) {
      var error_msg = " Error: " + response.status + " : " + response.statusText;
      switch (response.status) {
        case 500:
          showToast(error_msg, "bottom right", "error")
          break;
        case 401:
          var popupInit = sessionStorage.getItem('popupInit');
          if (popupInit == null || popupInit == undefined) {
            sessionStorage.setItem('popupInit', !0);
         
          }
          break;
        case 404:
          showToast(error_msg, "bottom right", "error");
          break;
        default:
          showToast(error_msg, "bottom right", "error");
          break
      }
    }

    function getServiceUrl() {
      return service.api.url + service.api.version;
    }

    function getUserInfo() {
      if ($cookies.get("USERINFO") != null) {
        var userInfo = JSON.parse(decodeURI($cookies.get("USERINFO")));
        console.log(userInfo.is_admin);
        return userInfo
      } else {
        return null
      }
    }

    function getUserName() {
      var cliqueSession = getUserInfo();
      if (cliqueSession != null) {
        if (cliqueSession.name != "") {
          return cliqueSession.name
        } else {
          return cliqueSession.username
        }
      } else {
        return 'John Smith'
      }
    }
  }
})()