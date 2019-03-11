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
            backgroundColor: '#3D60D3',
            pointBackgroundColor: '#3D60D3',
            borderColor: '#C56BA6',
            pointBorderColor: '#C56BA6',
        }, {
            pointBackgroundColor: 'rgb(57, 209, 226)',
            pointHoverBackgroundColor: 'rgba(151,187,205,1)',
            borderColor: '#24BAE8',
            pointBorderColor: '#24BAE8',
        }]
    }

})();
