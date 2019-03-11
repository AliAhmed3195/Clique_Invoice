(function () {
    'use strict';

    angular
        .module('app')
        .config(config);

    /* @ngInject */
    function config(ChartJsProvider) {
        // Configure all charts to use material design colors
        ChartJsProvider.setOptions({
            colours: [
                '#4285F4', // blue
                '#DB4437', // red
                '#F4B400', // yellow
                '#0F9D58', // green
                '#AB47BC', // purple
                '#00ACC1', // light blue
                '#FF7043', // orange
                '#9E9D24', // browny yellow
                '#5C6BC0' // dark blue
            ],
            responsive: true
        });
        Chart.defaults.global.colors = [{
            // backgroundColor: 'rgb(61, 96, 211 , 0.7)',
            pointBackgroundColor: 'rgb(48, 100, 184)',
            borderColor: '#C56BA6',
            pointBorderColor: '#C56BA6',
        }, {
            backgroundColor: 'rgb(211, 241, 250, 0.7)',
            pointBackgroundColor: 'rgb(35, 185, 232, 0.9)',
            pointHoverBackgroundColor: 'rgba(151,187,205,1)',
            borderColor: '#24BAE8',
            pointBorderColor: '#24BAE8',
        }, {
            backgroundColor: 'rgb(61, 96, 211,0.7)',
            pointBackgroundColor: 'rgb(237, 80, 150)',
            pointHoverBackgroundColor: 'rgba(151,187,205,1)',
            borderColor: '#24BAE8',
            pointBorderColor: '#24BAE8',
        }]
    }

})();
