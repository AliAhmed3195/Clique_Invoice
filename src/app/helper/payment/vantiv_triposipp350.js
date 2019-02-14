'use strict';

angular.module('invoice')
    .factory('VantivTriPOSiPP350', ['$rootScope', '$compile', '$http', '$timeout', '$q',
        function($rootScope, $compile, $http, $timeout, $q) {

            //http://localhost:8080/api/sale/
            var self = this;
            self.config = {
                tpAuthorizationCredential: "",
                tpAuthorizationSecret: "",
                serviceAddress: "",
                application_id: ""
            };

            self.makeSaleRequest = function(config, saleData, cb) {
                var deferred = $q.defer();

                var message = {
                    url: config.serviceAddress,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'tp-application-id': config.application_id,
                        'tp-application-name':'TriPOSProcessor',
                        'tp-application-version': '1.0.0',
                        'tp-authorization': 'Version=' + config.tpAuthorizationVersion + ', Credential=' + config.tpAuthorizationCredential,
                        'tp-return-logs': false,
                        'APPID': undefined,
                        'DEBUG': undefined,
                        'TOKEN': undefined,
                        'x-csrftoken': undefined
                    },
                    json: saleData
                };

                self.createAuthHeader(message, config.tpAuthorizationCredential, config.tpAuthorizationSecret, function(err, tpAuthHeader) {
                    if (err) return cb(err);
                    message.headers['tp-authorization'] = tpAuthHeader;
                    
                    var config = {
                        headers : message.headers
                    };
                   
                  console.log("---MAKE SALE REQUEST------");
                  console.log(message);
                  var commonHeaders=$http.defaults.headers.common;
                  $http.defaults.headers.common="";
                  $http({
                          url: message.url+"api/v1/sale",
                          method: message.method,
                          data: message.json,
                          headers: message.headers
                        })
                  .then(function(response) {
                      deferred.resolve(response);
                      $http.defaults.headers.common=commonHeaders;
                      return cb(response);      
                
                  })
                  .catch(function(response) {
                      console.log("--Make Sale RESPONSE---");
                      console.log(response);
                      deferred.reject(response);
                      var errors=[];
                      errors.push({developerMessage:"Service not available /api/v1/sale"});
                      var errorResponse={
                          _hasErrors:true,
                          _errors:errors
                        };
                      var newResponse={};
                      newResponse={
                        data:errorResponse,
                        header:{},
                        status:404,
                        statusText:"Resource not found"

                      };
                      $http.defaults.headers.common=commonHeaders;
                      return cb(newResponse);      
                    });

                  



                });
            }
            
            self.getLaneInfo = function(config, cb) {

                var deferred = $q.defer();
                var message = {
                    url: config.serviceAddress,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'tp-application-id': config.application_id,
                        'tp-application-name':'TriPOSProcessor',
                        'tp-application-version': '1.0.0',
                        'tp-authorization': 'Version=' + config.tpAuthorizationVersion + ', Credential=' + config.tpAuthorizationCredential,
                        'tp-return-logs': false,
                        'APPID': undefined,
                        'DEBUG': undefined,
                        'TOKEN': undefined,
                        'x-csrftoken': undefined,

                        
                    }
                };

                self.createAuthHeader(message, config.tpAuthorizationCredential, config.tpAuthorizationSecret, function(err, tpAuthHeader) {
                    if (err) return cb(err);
                    message.headers['tp-authorization'] = tpAuthHeader;
                    
                    var config = {
                        headers : message.headers
                    };
                  
                  //var commonHeaders=$http.defaults.headers.common;
                  //$http.defaults.headers.common="";
                  $http({
                          url: message.url+"api/v1/configuration/lanes/",
                          method: message.method,
                          data: "",
                          headers: message.headers
                        })
                  .then(function(response) {
                      //$http.defaults.headers.common=commonHeaders;
                      deferred.resolve(response);
                 
                      return cb(response);      
                
                  })
                  .catch(function(response) {
                      deferred.reject(response);
                  
                      var errors=[];
                      errors.push({developerMessage:"Service not available /api/v1/configuration/lane"});
                      var errorResponse={
                          _hasErrors:true,
                          _errors:errors
                        };
                      var newResponse={};
                      newResponse={
                        data:errorResponse,
                        header:{},
                        status:404,
                        statusText:"Resource not found"

                      };
                      
                      //$http.defaults.headers.common=commonHeaders;
                      
                      return cb(newResponse);      
                    });
                });
            }
            self.paymentAccount = function(config, cb) {

                var deferred = $q.defer();
                var message = {
                    url: config.serviceAddress,
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'tp-application-id': config.application_id,
                        'tp-application-name':'TriPOSProcessor',
                        'tp-application-version': '1.0.0',
                        'tp-authorization': 'Version=' + config.tpAuthorizationVersion + ', Credential=' + config.tpAuthorizationCredential,
                        'tp-return-logs': false,
                        'APPID': undefined,
                        'DEBUG': undefined,
                        'TOKEN': undefined,
                        'x-csrftoken': undefined,
                        
                        
                        
                    }
                };

                self.createAuthHeader(message, config.tpAuthorizationCredential, config.tpAuthorizationSecret, function(err, tpAuthHeader) {
                    if (err) return cb(err);
                    message.headers['tp-authorization'] = tpAuthHeader;
                    
                    var config = {
                        headers : message.headers
                    };
                  
                  //var commonHeaders=$http.defaults.headers.common;
                  //$http.defaults.headers.common="";
                  var params={
                    laneId:'1',
                    //vaultId:'1',
                    paymentAccountReferenceNumber:'1050119',
                    //updateCardData:false,
                  };
                  $http({
                          url: message.url+"/api/v1/paymentAccount/FBDBB2E7-1672-49EF-AD63-0E109304CB2E",
                          method: message.method,
                          data: params,
                          headers: message.headers
                        })
                  .then(function(response) {
                      //$http.defaults.headers.common=commonHeaders;
                      deferred.resolve(response);
                 
                      return cb(response);      
                
                  })
                  .catch(function(response) {
                      deferred.reject(response);
                  
                      var errors=[];
                      errors.push({developerMessage:"Service not available /api/v1/paymentAccount"});
                      var errorResponse={
                          _hasErrors:true,
                          _errors:errors
                        };
                      var newResponse={};
                      newResponse={
                        data:errorResponse,
                        header:{},
                        status:404,
                        statusText:"Resource not found"

                      };
                      
                      //$http.defaults.headers.common=commonHeaders;
                      
                      return cb(newResponse);      
                    });
                });
            }
            self.processVoidRefund = function(url, params, config, cb) {

                console.log("--Config---");
                console.log(config);
                var deferred = $q.defer();
                var message = {
                    url: config.serviceAddress,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'tp-application-id': config.application_id,
                        'tp-application-name':'TriPOSProcessor',
                        'tp-application-version': '1.0.0',
                        'tp-authorization': 'Version=' + config.tpAuthorizationVersion + ', Credential=' + config.tpAuthorizationCredential,
                        'tp-return-logs': false,
                        'APPID': undefined,
                        'DEBUG': undefined,
                        'TOKEN': undefined
                    }
                };

                self.createAuthHeader(message, config.tpAuthorizationCredential, config.tpAuthorizationSecret, function(err, tpAuthHeader) {
                    if (err) return cb(err);
                    message.headers['tp-authorization'] = tpAuthHeader;
                    
                    var config = {
                        headers : message.headers
                    };
                  
                  var commonHeaders=$http.defaults.headers.common;
                  $http.defaults.headers.common="";
                  $http({
                          url: url,
                          method: message.method,
                          data: params,
                          headers: message.headers
                        })
                  .then(function(response) {
                      deferred.resolve(response);
                      $http.defaults.headers.common=commonHeaders;
                      return cb(response);      
                
                  })
                  .catch(function(response) {
                      deferred.reject(response);
                  
                      var errors=[];
                      errors.push({developerMessage:"Service not available "+url});
                      var errorResponse={
                          _hasErrors:true,
                          _errors:errors
                        };
                      var newResponse={};
                      newResponse={
                        data:errorResponse,
                        header:{},
                        status:404,
                        statusText:"Resource not found"

                      };
                      $http.defaults.headers.common=commonHeaders;
                      return cb(newResponse);      
                    });
                });
            }
            
            self.createAuthHeader = function(message, developerKey, developerSecret, cb) {
                var algorithm = 'tp-hmac-md5';
                var nonce = self.guid();
                var requestDate = new Date().toISOString();
                console.log("Request Date");
                console.log(requestDate);

                var parsedUrl = self.urlParse(message.url);
                var canonicalUri = parsedUrl.path;
                var canonicalQueryStr = parsedUrl.query;
                var method = message.method;
                var bodyHash = self.getBodyHash(JSON.stringify(message.json));
                
                  // 1. Get the header information
                var canonicalHeaderInfo = self.getCanonicalHeaderInfo(message.headers);
                var canonicalSignedHeaders = canonicalHeaderInfo.canonicalSignedHeaders;
                var canonicalHeaderStr = canonicalHeaderInfo.canonicalHeaderStr;

                // 2. Calculate the request hash
                var requestHash = self.getCanonicalRequestHash(
                    method, canonicalUri, canonicalQueryStr, canonicalHeaderStr, canonicalSignedHeaders, bodyHash
                );

                // 3. Get the signature hash
                var keySignatureHash = self.getKeySignatureHash(requestDate, nonce + developerSecret);

                var unhashedSignature = algorithm.toUpperCase() + '\n' + requestDate + '\n' + developerKey + '\n' + requestHash;

                // 4. Get the actual auth signature
                var signature = self.getKeySignatureHash(keySignatureHash, unhashedSignature);

                // 5. Create the auth header
                var tpAuthorization = [
                    'Version=1.0',
                    'Algorithm=' + algorithm.toUpperCase(),
                    'Credential=' + developerKey,
                    'SignedHeaders=' + canonicalSignedHeaders,
                    'Nonce=' + nonce,
                    'RequestDate=' + requestDate,
                    'Signature='+''
                    //'Signature=' + signature
                ].join(',');

                return cb(null, tpAuthorization);
            }

            self.getBodyHash=function(body) {
                 return CryptoJS.MD5(self.utf8_encode(body));
             }

            self.getCanonicalHeaderInfo=function(headers) {
                  var canonicalSignedHeaders = [];
                  var canonicalHeaders = {};
                  var uniqHeaders = [];
                  _.each(headers, function(v, k) {
                    if(k.indexOf('tp-') === 0) return;
                    canonicalSignedHeaders.push(k);
                    if(uniqHeaders.indexOf(k) === -1) {
                      // uniq
                      uniqHeaders.push(k);
                      var headerHolder = {k: [v]};
                      canonicalHeaders[k] = [v];
                    } else {
                      // not uniq
                      canonicalHeaders[k].push(v);
                    }
                  });
                  canonicalSignedHeaders = canonicalSignedHeaders.sort().join(';');

                  //each canonicalHeader is its own line in a multiline string
                  var canonicalHeaderStr = '';
                  var canonicalHeaderArray = [];
                  _.each(canonicalHeaders, function(v, k) {
                    canonicalHeaderArray.push(k+':'+v.join(', '));
                  });

                  canonicalHeaderStr = canonicalHeaderArray.sort().join('\n');

                  return {
                    canonicalSignedHeaders: canonicalSignedHeaders,
                    canonicalHeaderStr: canonicalHeaderStr
                  }
                }

            self.getCanonicalRequestHash=function(method, uri, query, headerStr, signedHeaderStr, bodyHash) {
                  var canonicalRequest = method + '\n';
                  canonicalRequest += uri + '\n';
                  if(query === null) query = '';
                  canonicalRequest += query + '\n';
                  canonicalRequest += headerStr + '\n';
                  canonicalRequest += signedHeaderStr + '\n';
                  canonicalRequest += bodyHash;

                  return CryptoJS.MD5(self.utf8_encode(canonicalRequest));

                }

            self.getKeySignatureHash=function(key, data) {
                  
                 var enc_key = self.utf8_encode(key);
                 var enc_data = self.utf8_encode(data);
                 return CryptoJS.HmacMD5(enc_data, enc_key); 
            }


            self.urlParse = function(href) {
                var l = document.createElement("a");
                l.href = href;
                return l;
            };
            self.utf8_encode=function(s) {
              return unescape(encodeURIComponent(s));
            }

            self.utf8_decode=function(s) {
              return decodeURIComponent(escape(s));
            }
            self.ksort=function(obj){
              var keys = Object.keys(obj).sort()
                , sortedObj = {};

              for(var i in keys) {
                sortedObj[keys[i]] = obj[keys[i]];
              }

              return sortedObj;
            }
            self.rtrim = function (s) {
                if (s == undefined)
                    s = '\\s';
                return s.replace(new RegExp("[" + s + "]*$"), '');
            }
            self.guid=function() {
                  function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                      .toString(16)
                      .substring(1);
                  }
                  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }
            self.array_search=function(val, array) {
                  if(typeof(array) === 'array' || typeof(array) === 'object') {
                    var rekey;
                    for(var indice in array) {
                      if(array[indice] == val) {
                        rekey = indice;
                        break;
                      }
                    }
                    return rekey;
                  }
            }
            self.explode=function(s, separator, limit)
                {
                    var arr = s.split(separator);
                    if (limit) {
                        arr.push(arr.splice(limit-1, (arr.length-(limit-1))).join(separator));
                    }
                    return arr;
                }
            self.strrpos=function(haystack, needle, offset) {
                  var i = -1
                  if (offset) {
                    i = (haystack + '')
                      .slice(offset)
                      .lastIndexOf(needle) // strrpos' offset indicates starting point of range till end,
                    // while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
                    if (i !== -1) {
                      i += offset
                    }
                  } else {
                    i = (haystack + '')
                      .lastIndexOf(needle)
                  }
                  return i >= 0 ? i : false
                }
            return {
                config:self.config,
                makeSaleRequest:self.makeSaleRequest,
                getLaneInfo:self.getLaneInfo,
                paymentAccount:self.paymentAccount,
                processVoidRefund:self.processVoidRefund,
                createAuthHeader:self.createAuthHeader,
                getBodyHash:self.getBodyHash,
                getCanonicalHeaderInfo:self.getCanonicalHeaderInfo,
                getCanonicalRequestHash:self.getCanonicalRequestHash,
                getKeySignatureHash:self.getKeySignatureHash,
            };
        }
    ]);