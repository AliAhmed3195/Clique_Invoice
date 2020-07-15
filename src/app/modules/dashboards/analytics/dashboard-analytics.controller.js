(function() {
    'use strict';

    angular
        .module('dashboard')
        .controller('DashboardAnalyticsController', DashboardAnalyticsController);

    /* @ngInject */
    function DashboardAnalyticsController($filter, $scope,  $timeout, $mdToast, $rootScope, $state, DashboardModel, Clique,$mdDialog) {

        //remove invoice search
        sessionStorage.removeItem("invoice_search");
      
        var vm = this;
        vm.showInvoiceList = showInvoiceList;
        vm.getInvoiceStatistics = getInvoiceStatistics;
        vm.FilterDashboard = FilterDashboard;
        vm.validateDate = validateDate;
        $scope.showSubPieChart=true;
        var date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth();
        var sessionFromDate;
        var sessionToDate;
        if (typeof(Storage) !== undefined) {
            sessionFromDate = sessionStorage.getItem('fromDate');
            sessionToDate = sessionStorage.getItem('toDate');
        }
        // vm.promise = DashboardModel.GetTotalUnread();
        // vm.promise.then(function (response) {
        //     debugger;
        //    if(response.statuscode === 0) {
        //        console.log('count is ' , response.data)
        //        sessionStorage.setItem("count", response.data);
        //        localStorage.setItem("count", response.data);
        //    }
        // });

        vm.fromDate = (sessionFromDate != undefined ? new Date(sessionFromDate) : new Date(y, m, 1));
        vm.toDate = sessionToDate != undefined ? new Date(sessionToDate) : new Date(y, m + 1, 0);

        $scope.invoice = {
            statistics: {
                paid: 0,
                due: 0,
                overdue: 0
            },
            pieChart: {
                labels: ['PAID', 'Due', 'DUE'],
                data: [0, 0, 0]
            },
            lineChart: {
                label: [' ', ' ', ' ', ' ', ' '],
                data: [],
                series: ["Approved", "Declined"]
            },
            subPieChart1:{
                heading:"PROCESSED 0.00%",
            },
            subPieChart2:{
                heading:"DELIVERED 0.00%",
            },
            subPieChart3:{
                heading:"READ 0.00%",
            }
        };


        vm.options = {
            legend: {
                display: true
            },
            showTooltips: false,
            cutoutPercentage:60,
            responsive:true,
            maintainAspectRatio:true,
        };
        vm.statsQuery = {
            start_date: '',
            end_date: '',
        };

        vm.getInvoiceStatistics();

        $scope.$watch('vm.fromDate', function(newValue, oldValue) {

            $scope.minDate = vm.fromDate;
            $scope.maxDate = new Date(vm.fromDate.getFullYear(), 12, 0);

        });

        function FilterDashboard() {
            if (vm.fromDate.getTime() > vm.toDate.getTime()) {
                Clique.showToast('Start Date should be less than End Date', 'bottom right', 'error');
            } else {

                if (typeof(Storage) !== "undefined") {
                    sessionStorage.setItem("fromDate", vm.fromDate);
                    sessionStorage.setItem("toDate", vm.toDate);
                }
                if (getPaymentFromAndToDate(vm.fromDate, vm.toDate) == true) {
                    $state.reload();
                }
            }
        }

        function showInvoiceList(invoice_type) {
            $state.go('triangular.invoice-list', {
                type: invoice_type
            });
        }

        function getInvoiceStatistics() {
            var from_date = $filter('date')(vm.fromDate, "yyyy-MM-dd");
            var to_date = $filter('date')(vm.toDate, "yyyy-MM-dd");

            vm.statsQuery.start_date = from_date;
            vm.statsQuery.end_date = to_date;
            getPaymentFromAndToDate(vm.fromDate,vm.toDate);
    
            vm.promise = DashboardModel.GetInvoiceStatistics(vm.statsQuery);
            vm.promise.then(function(response) {
                if (response.statuscode == 0) {

                    $scope.invoice = response.data;
                    reFormatLineChart();
                    vm.subPieChartTitle = {
                            title1: $scope.invoice.subPieChart1.heading,
                            title2: $scope.invoice.subPieChart2.heading,
                            title3: $scope.invoice.subPieChart3.heading
                        }
                    if($scope.invoice.subPieChart1.heading=="PROCESSED 0.00%" &&
                       $scope.invoice.subPieChart2.heading=="DELIVERED 0.00%" &&
                       $scope.invoice.subPieChart3.heading=="READ 0.00%"
                       ){
                           $scope.showSubPieChart=false;
                        }
                    window.dispatchEvent(new Event('resize'));
                    //console.log($scope.invoice);
                } else {
                }
            });
             
            



        }
        function reFormatLineChart(){
            
            var psd=(vm.statsQuery.payment_from).split("-"); 
            var ped=(vm.statsQuery.payment_to).split("-"); 
         
            var start = new Date(psd[1]+"/01/"+psd[0]);
            var end = new Date(ped[1]+"/01/"+ped[0]);

            var lineChartLabel=[];
            var lineChartData = [];
            var lineChartseries=['Pageviews', 'Visits'];
            var monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
            var row=[];    
            var approved=[];
            var declined=[];

            var serverDataMonthsArr=$scope.invoice.lineChart.labels;
            var approvedData=$scope.invoice.lineChart.data[0];
            var declinedData=$scope.invoice.lineChart.data[1];
                        
               
            while(start <= end){
               
               var year=start.getFullYear();
               var month_name=monthNames[start.getMonth()];
               var full_month_name=month_name;
               lineChartLabel.push(full_month_name);
               var serverDataMonthsArr=$scope.invoice.lineChart.labels;
               if(serverDataMonthsArr.length > 0){
                   if (serverDataMonthsArr.indexOf(full_month_name) >= 0) {
                        var dataIndex=serverDataMonthsArr.indexOf(full_month_name);
                        var approved_value=approvedData[dataIndex];
                        var declined_value=declinedData[dataIndex];
                        approved.push(approved_value);
                        declined.push(declined_value);

                   }else{
                        approved.push(0);
                        declined.push(0);

                   }
                }
               var newDate = start.setMonth(start.getMonth() + 1);
               start = new Date(newDate);
            }

            lineChartData.push(approved);
            lineChartData.push(declined);

            $scope.invoice.lineChart.labels=lineChartLabel;
            $scope.invoice.lineChart.data=lineChartData;
        }
        //////////////
        function getPaymentFromAndToDate(from_date, to_date) {

            var new_from_date;
            var new_to_date;
            var i = 0;
            //Case 1
            if (from_date.getMonth() == to_date.getMonth() && from_date.getFullYear() == to_date.getFullYear()) {
                var month = from_date.getMonth()
                for (i = month; i > month - 5; i--) {
                    if (i == 1) break;
                }
                var newFromMonth = i;
                new_from_date = new Date(from_date.getFullYear(), newFromMonth)
                new_to_date = to_date
                //new_from_date = from_date
                //new_to_date = to_date
            } else if (from_date.getMonth() < to_date.getMonth() && from_date.getFullYear() == to_date.getFullYear()) {
                new_from_date = from_date
                new_to_date = to_date
            } else if (from_date.getMonth() < to_date.getMonth() && from_date.getFullYear() < to_date.getFullYear()) {
                new_from_date = from_date
                new_to_date = to_date
            } else {
                new_from_date = from_date
                new_to_date = to_date

            }

            var new_from_date = $filter('date')(new_from_date, "yyyy-MM");
            var new_to_date = $filter('date')(new_to_date, "yyyy-MM");

            vm.statsQuery.payment_from = new_from_date;
            vm.statsQuery.payment_to = new_to_date;

            return true;
        }

        function validateDate() {
        }
     
     

    }
})();