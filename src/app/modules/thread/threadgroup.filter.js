(function() {
    'use strict';

    angular
        .module('thread')
        .filter('ThreadGroup', ThreadGroup);

    function ThreadGroup() {
        return filterFilter;

        ////////////////

        function filterFilter(emails, emailGroup) {
            return emails.filter(function(email) {
                var emailDate = moment(email.timestamp, moment.ISO_8601);
                
                if(emailDate.isAfter(emailGroup.from) && emailDate.isBefore(emailGroup.to)) {
                    // console.log(email)
                    // console.log(emailGroup.from,"emailGroup.from")
                    return email;
                }
            });
        }
    }

})();