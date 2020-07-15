(function () {
  'use strict';

  angular
    .module('thread')
    .controller('ThreadController', ThreadController)
    .factory('addNewRecursion', ['$rootScope', '$mdBottomSheet', function ($rootScope, $mdBottomSheet) {
      return {
        foo: function () {
          $mdBottomSheet.show({
            templateUrl: 'app/modules/recurring/recurring.edit.html',
            controller: 'GridBottomSheetCtrl',
            clickOutsideToClose: true,
            parent: angular.element(document.getElementById('invoice_detail_layout')),
          }).then(function (clickedItem) {

          });
        }
      };
    }])
    .filter('intervalType', function () {
      var type = ""
      return function (value) {
        switch (value) {

          case "QuadWeekly":
            type = "Quad Weekly";
            break
          case "SemiAnnually":
            type = "Semi Annually";
            break
          default:
            type = value;
            break

        }
        return type
      }
    })
    .filter("myfilter", function ($filter) {
      return function (items, from, to) {
        return $filter('filter')(items, "name", function (v) {
          var date = moment(v);
          return date >= moment(from) && date <= moment(to);
        });
      };
    });

  function ThreadController($scope, $rootScope, $timeout, $interval, $q, $http, $compile, Clique, ThreadModel, SettingModel, RecurringModel, $mdDialog, $mdToast, $element, $state, triTheming, $mdSidenav, $filter) {

    var vm = this;
    var color;
    // vm.chats = [];
    var chatGroupsBackup = null;
    vm.selectedMail = null;
    vm.reply = reply;
    // vm.gettimestamp = gettimestamp;
    vm.showMessage = showMessage;
    var customerName
    //  vm.returnColor = returnColor;

    console.log($rootScope.msgCounter, "$rootScope.msgCounter", $rootScope.msgCounter)
    console.log($rootScope)
    merchantChat()
    function merchantChat() {

      vm.promise = ThreadModel.GetAllMerchantChat()
      vm.promise.then(function (response) {
    console.log("getallmerchantchatresponse",response );

        // vm.chatData = response.data.data;
        if (response.statuscode === 0) {
          var chatDup = []
          vm.chats = response.data.data;
          for (var i = 0; i < vm.chats.length; i++) {
            debugger;
            $scope.colorgenerate = Math.floor(0x1000000 * Math.random()).toString(16);
            vm.chats[i].color = '#' + ('000000' + $scope.colorgenerate).slice(-6);
          }
        //  console.log('chat data', vm.chats)
          vm.chatGroups = [{
            name: $filter('triTranslate')('Today'),
            from: moment().startOf('day'),
            to: moment().endOf('day')
          }, {
            name: $filter('triTranslate')('Yesterday'),
            from: moment().subtract(1, 'days').startOf('day'),
            to: moment().subtract(1, 'days').endOf('day')
          },   {
            name: $filter('triTranslate')('This Week'),
            from: moment().subtract(7, 'days').startOf('day'),
            to: moment().subtract(2, 'days').endOf('day')
          },    {
            name: $filter('triTranslate')('Last Week'),
            from: moment().subtract(14, 'days').endOf('day'),
            to: moment().subtract(8, 'days').startOf('day')
          }, {
            name: $filter('triTranslate')('This Month'),
            from: moment().subtract(31, 'days').endOf('day'),
            to: moment().subtract(15, 'days').startOf('day')
          }, {
            name: $filter('triTranslate')('Last Month'),
            from: moment().subtract(61, 'days').endOf('day'),
            to: moment().subtract(32, 'days').startOf('day')
          }, {
            name: $filter('triTranslate')('2 Months Ago'),
            from: moment().subtract(91, 'days').endOf('day'),
            to: moment().subtract(62, 'days').startOf('day')
          }, {
            name: $filter('triTranslate')('3 Months Ago'),
            from: moment().subtract(180, 'days').endOf('day'),
            to: moment().subtract(92, 'days').startOf('day')
          },  {
            name: $filter('triTranslate')('This Year'),
            from: moment().subtract(365, 'days').endOf('day'),
            to: moment().subtract(181, 'days').startOf('day')
          }, {
            name: $filter('triTranslate')('Last Year'),
            from: moment().subtract(100, 'years').endOf('day'),
            to: moment().subtract(366, 'days').startOf('day')
          }
        
        
        
        ];

          angular.forEach(vm.chatGroups, function (group) {
            group.chats = $filter('ThreadGroup')(vm.chats, group);
         //   console.log("group chats",group.chats)
          });
          console.log('grp', vm.chatGroups)
          // create backup of emailGroups for search filtering
          chatGroupsBackup = angular.copy(vm.chatGroups);


        }


      });
    }

  //   function gettimestamp(){
  //     debugger;
  //   $scope.promise = ThreadModel.GetChatData();
  //   $scope.promise.then(function (response) {

  //     vm.messageData1 = response.data.data;
  //   });
  // }




    function reply($event) {
debugger;
      // if (vm.submitBtnDisable) {
      // If "shift + enter" pressed, grow the reply textarea
      var date = new Date();
      vm.datetime = $filter("date")(Date.now(), 'yyyy-MM-dd HH:mm:ss');
  // console.log("$scope.date", vm.datetime);

  // var unix_timestamp = 1588030651;
  // var date = new Date(unix_timestamp * 1000);
  // var date1 = date.getDate();
  // var Year = date.getFullYear();
  // var Month = date.getMonth() + 1;
  // var hours = date.getHours();
  // var minutes = "0" + date.getMinutes();
  // var seconds = "0" + date.getSeconds();

  // console.log("date", date);

  // vm.formattedTime = Year + '-' +  Month + '-' + date1 + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

  // console.log(formattedTime);

      if ($event && $event.keyCode === 13 && $event.shiftKey) {
        vm.textareaGrow = true;
        return;
      }

      if ($event.type == 'click') {
        if (vm.replyMessage === undefined) {
          resetReplyTextarea();
          return;
        } else {
          var message = {
            message: vm.replyMessage,
            timestamp: vm.datetime,
            is_customer: true
          };
          postChat(message);
          resetReplyTextarea();
        }
        // timestamp: new Date().toISOString(),
      }
      // Prevent the reply() for key presses rather than the"enter" key.
      if ($event && $event.keyCode !== 13) {
        return;
      }

      // Check for empty messages
      if (vm.replyMessage === '') {
        resetReplyTextarea();
        return;
      }

      // Message
      var message = {
        message: vm.replyMessage,
        timestamp: vm.datetime,
        is_customer: true
      };
      // Add the message to the chat
      // post chat 
      // timestamp: new Date().toISOString(),
      postChat(message);
      // pushMessage();
      // Update Contact's lastMessage
      // vm.contacts.getById(vm.chatContactId).lastMessage = message;
      // Reset the reply textarea
      resetReplyTextarea();
      // Scroll to the new message
      // scrollToBottomOfChat();
      // }
    }
    function resetReplyTextarea() {
      vm.replyMessage = '';
      // vm.textareaGrow = false;
    }
    function postChat(message) {
debugger;
      var postMessage = {
        sender_name: Clique.getUserName(),
        receiver_name: customerName,
        customer_name: customerName,
        customer_id: 'invoice_detail.CustomerRef.value',
        doc_number: vm.doc_number,
        message: message.message,
        color: color,
        customer_email: 'invoice_detail.BillEmail.Address',
        subject: "",
        is_customer: false,
        unread_count: 0,
        created_date : vm.datetime
      }
      $scope.promise = ThreadModel.PostChatData(postMessage);
   //   console.log("postMessage", postMessage);
      $timeout(function () {

        debugger;
        showMessage(postMessage);
        vm.promise = ThreadModel.GetTotalUnread();
        vm.promise.then(function (response) {

          if (response.statuscode === 0) {
        //    console.log('count is ', response.data)
            sessionStorage.clear();
            sessionStorage.setItem("count", response.data);
          }
        });
      }, 200);

    }
    function showMessage(value) {
      debugger;
   
    console.log("value", value);
      // const element = document.getElementById(id);
      // element.scrollIntoView({ block: 'end',  behavior: 'smooth' });

      color = value.color;
   ///   console.log('color is ', color)
      vm.colorsforheader = color;
    //  console.log('colors for header', vm.colorsforheader)
      vm.customer_name = value.customer_name
      vm.merchant_name = value.merchant_name;
      customerName = vm.customer_name;
      vm.doc_number = value.doc_number

   //   console.log($scope.MsgArr);
      $scope.promise = ThreadModel.GetChatData(value.doc_number);

      $scope.promise.then(function (response) {
         debugger;

        vm.merchant_name = response.data.data[0].merchant_name;
        vm.messageData = response.data.data;
       
        for (var i = 0; i < vm.messageData.length; i++) {
          vm.messageData[i].color = color;
        }
        // make unread count zero after click on an unread message
        unreadCountzero(value)
        // console.log('mesafes' ,  vm.messageData)/
      });
      // returnColor();
    }
    function unreadCountzero(value) {
       debugger;
      setTimeout(function() {
        debugger;
        $('#contentScroll').scrollTop($('#contentScroll')[0].scrollHeight);
      }, 200)
      vm.chats.find(function(x){
          if(x.doc_number == value.doc_number){
            x.unread_count = 0;
          }
      })
      // vm.chats.find(x => x.doc_number == value.doc_number).unread_count = 0;

    }

  }
})();
