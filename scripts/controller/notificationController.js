/**
 * Created by Rajinda on 4/26/2016.
 */

angular.module('veerySoftPhone')
    .controller('notificationController', function($scope, Notification) {

        $scope.primary = function() {
            Notification('Primary notification');
        };

        $scope.error = function() {
            Notification.error('Error notification');
        };

        $scope.success = function() {
            Notification.success('Success notification');
        };

        $scope.info = function() {
            Notification.info('Information notification');
        };

        $scope.warning = function() {
            Notification.warning('Warning notification');
        };

        // ==

        $scope.primaryTitle = function() {
            Notification({message: 'Primary notification', title: 'Primary notification'});
        };

        // ==

        $scope.errorTime = function() {
            Notification.error({message: 'Error notification 1s', delay: 1000});
        };

        $scope.successTime = function() {
            Notification.success({message: 'Success notification 20s', delay: 20000});
        };

        // ==

        $scope.errorHtml = function() {
            Notification.error({message: '<b>Error</b> <s>notification</s>', title: '<i>Html</i> <u>message</u>'});
        };

        $scope.successHtml = function() {
            Notification.success({message: 'Success notification<br>Some other <b>content</b><br><a href="https://github.com/alexcrack/angular-ui-notification">This is a link</a><br><img src="https://angularjs.org/img/AngularJS-small.png">', title: 'Html content'});
        };
    });