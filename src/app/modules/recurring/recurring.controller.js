(function () {
    'use strict';

    angular
        .module('recurring')
        .controller('RecurringController', RecurringController)
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

    function RecurringController($scope, $rootScope, $timeout, $interval, $q, $http, $compile, Clique, InvoiceModel, SettingModel, RecurringModel, $mdDialog, $mdToast, $element, $state, triTheming, $mdSidenav, $filter) {

        var vm = this;
        vm.tblData = [];
        vm.getIntervalType = getIntervalType;
        vm.showRecurringHistory = showRecurringHistory;
        vm.recurringHistoryStatus = recurringHistoryStatus;
        vm.recurringRetry = recurringRetry;
        vm.recurringStatus = recurringStatus;
        vm.openSidebar = openSidebar;

        function openSidebar(navID) {

            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    // $log.debug("toggle " + navID + " is done");
                });
        }
        var myDate = new Date();
        $scope.fromdate = new Date(myDate);

        $scope.fromdate.setMonth(myDate.getMonth() - 1);
        console.log($scope.fromdate)
        $scope.resetForm = function () {
            console.log("wroking")
            $scope.StatusFilter = undefined
            $scope.searchCustomer = ''
        }

        vm.query = {
            order: '-Id',
            limit: 20,
            page: 1
        };

        vm.pieLabels = ['Succcess', 'Failed'];
        vm.pieOptions = {
            legend: {
                display: true
            },
            showTooltips: true
        };
        vm.pieData = [0, 0];



        $scope.notifications = [];
        $scope.recurring;
        $scope.showHistoryProgress = false;
        $scope.showProfileGetProgress = true;
        $scope.showProfileCard = false;
        $scope.filterRecurring = function (val) {
            $scope.state = val

            switch (val) {
                case 'All':
                    $scope.checkboxes = true
                    vm.tblData = originalData
                    break;
                case 'Completed':
                    $scope.checkboxes = false
                    vm.tblData = $filter('filter')(originalData, {
                        "IsCompleted": true
                    });
                    break;
                case 'Running':
                    $scope.checkboxes = false
                    vm.tblData = $filter('filter')(originalData, {
                        "IsCompleted": false
                    });
                    break;
                case 'Error':
                    $scope.checkboxes = false
                    vm.tblData = $filter('filter')(originalData,
                        function (value) {
                            return value.ErrorCount != 0;
                        }
                    );
                    break;
                default:
                    vm.tblData = originalData
            }
        }

        $scope.state = 'All'
        $scope.checkboxes = false
        $scope.checkboxHandler = function () {
            console.log("TCL: $scope.checkboxHandler -> checkboxHandler")
            if ($scope.checkboxes == true) {
                $scope.filterRecurring('All')
            }
        }
        $scope.states = ['All', 'Completed', 'Running', 'Error']
        var originalData = []

        getAllRecurring();
        vm.showProges = true

        function getAllRecurring(query) {
            vm.promise = RecurringModel.GetAllRecurrings(query);
            vm.promise.then(function (response) {
                if (response.statuscode == 0) {
                    vm.tblData = response.data.items;
                    originalData = vm.tblData
                    vm.showProges = false
                } else {}
            });
        }

        function getCompanyInfo() {
            $scope.promise = SettingModel.GetCompanyInfo();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    vm.setting.company = response.data.company;
                } else {}
            });
        }

        function getSettings() {
            $scope.promise = SettingModel.GetSettings();
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    vm.setting.invoice_contact = response.invoice_contact;
                } else {}
            });
        }
        $scope.ccinfo = {
            type: undefined
        }

        function getCustomerCardProfile() {


            $scope.customerProfile = {};
            if ($scope.recurringObject.CustomerId != null) {
                $scope.showProfileGetProgress = true;
                var customer_id = $scope.recurringObject.CustomerId;
                var profile_id = $scope.recurringObject.ProfileId;
                var customer = {
                    customer_id: customer_id
                }

                $scope.promise = InvoiceModel.ProfileGet(customer);
                $scope.promise.then(function (response) {
                    if (response.statuscode == 0) {
                        if (response.data.total_item > 0) {
                            var customerProfiles = response.data.item;
                            $scope.customerProfile = $filter('filter')(customerProfiles, {
                                'profile_id': profile_id
                            })[0];
                            var expiry = $scope.customerProfile.expiry;
                            var ccmm;
                            var ccyy;
                            if (expiry != undefined) {
                                ccmm = expiry.substring(0, 2);
                                ccyy = expiry.substring(2, 4);

                            }
                            vm.cardInfo = {
                                ccnumber: "xxxx-xxxx-xxxx-" + $scope.customerProfile.last_digits,
                                ccname: $scope.customerProfile.cardholder_name,
                                ccmm: ccmm,
                                ccyy: $scope.customerProfile.create_date
                            }
                            // setCustomerCardLayout(vm.cardInfo);
                            var card_type = angular.lowercase($scope.customerProfile.card_type).toString();
                            $scope.ccinfo = {
                                type: card_type
                            }
                            $scope.showProfileGetProgress = false;
                            $scope.showProfileCard = true;
                        } else {
                            $scope.showProfileCard = false;
                            $scope.showProfileGetProgress = false;
                        }
                    }

                });
            }
        }

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

        function setCustomerCardLayout(cardInfo) {
            var card = new Card({
                form: 'form',
                container: '.card-wrapper',
                placeholders: {
                    number: cardInfo.ccnumber,
                    name: cardInfo.ccname,
                    expiry: cardInfo.ccmm + '/' + cardInfo.ccyy,
                    cvc: ''
                },
                width: 250, // optional — default 350px
                formatting: true, // optional - default true
            });
            $scope.showProfileGetProgress = false;
            $scope.showProfileCard = true;
            $timeout(function () {

                angular.element('.ccnumber').focus()
                angular.element('.ccname').focus()
                angular.element('.ccnexpiry').focus()
                angular.element('.cccvc').focus()
                angular.element('.ccnumber').focus()

            }, 1000);
        }

        function getIntervalType(type) {
            switch (type) {
                case 'D':
                    return 'Monthly';
                    break;
                case 'W':
                    return 'Weekly';
                    break;
                case 'M':
                    return 'Monthly';
                    break;
                case 'Y':
                    return 'Yearly';
                    break;
            }
        }

        $scope.deleteRecurring = function (id) {
            var params = {
                id: id
            };
            $scope.promise = RecurringModel.DeleteRecurring(params);
            $scope.promise.then(function (response) {
                if (response.statuscode == 0) {
                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    getAllRecurring();
                } else {
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                }
            });
        }
        $scope.deleteRecurringConfirm = function (id) {

            var confirm = $mdDialog.confirm()
                .title('Are you sure you want delete?')
                .textContent('')
                .ariaLabel('Confirm Recurring')
                //.targetEvent(ev)
                .ok('Confirm!')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function () {
                $scope.deleteRecurring(id)
            }, function () {

            });
        };

        function getRecurringHistory() {

            //debugger;
            var recurring_id = $scope.recurringObject.Id;
            $scope.showHistoryProgress = true;
            $scope.promise = RecurringModel.GetRecurringHistory(recurring_id);
            $scope.promise.then(function (response) {
                $scope.showHistoryProgress = false;
                if (response.statuscode == 0) {
                    $scope.notifications = response.data.items;
                }
            });
        }

        function showRecurringHistory(navID, recurringObject) {

            $mdSidenav(navID)
                .toggle()
                .then(function () {

                    $scope.recurringObject = recurringObject;
                    vm.pieData = [$scope.recurringObject.OccurrencesCount, $scope.recurringObject.ErrorCount];
                    getRecurringHistory();
                    getCustomerCardProfile();
                });

            $mdSidenav(navID).onClose(function () {
                $scope.notifications = [];
                getAllRecurring();
            });
        }

        function recurringRetry(historyId) {
            $scope.showHistoryProgress = true;
            var params = {
                history_id: historyId
            }
            $scope.promise = RecurringModel.DoRecurringRetry(params);
            $scope.promise.then(function (response) {
                $scope.showHistoryProgress = false;
                if (response.statuscode == 0) {
                    Clique.showToast(response.statusmessage, 'bottom right', 'success');
                    getRecurringHistory();
                } else {
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                }
            });
        }

        function recurringStatus(recurring_id, status) {
            $scope.showHistoryProgress = true;
            var params = {
                status: status
            }
            $scope.promise = RecurringModel.RecurringStatus(recurring_id, params);
            $scope.promise.then(function (response) {
                $scope.showHistoryProgress = false;
                if (response.statuscode == 0) {
                    // Clique.showToast(response.statusmessage,'bottom right','success');
                    //getRecurringHistory();
                    if (status == 1) {
                        Clique.showToast("Recurring is started successfully", 'bottom right', 'success');
                        $scope.recurringObject.Status = true;
                    } else {
                        Clique.showToast("Recurring is paused successfully", 'bottom right', 'success');
                        $scope.recurringObject.Status = false;
                    }

                } else {
                    Clique.showToast(response.statusmessage, 'bottom right', 'error');
                }
            });
        }

        function recurringHistoryStatus(notification) {
            if (notification.is_payment_created == false) {
                return "System unable to charge customer's credit card";
            } else if (notification.is_invoice_created == false) {
                return "System unable to create invoice";
            } else if (notification.is_invoice_marked == false) {
                return "Invoice not synced";
            } else {
                return "No error found";
            }
        }




    }
})();
