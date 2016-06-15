/**
 * Created by Rajinda on 5/31/2016.
 */

routerApp.controller('resourceCtrl', function ($rootScope, $scope, $log, $state, $filter, dataParser, jwtHelper, resourceService) {

    $scope.currentState = "";
    $scope.BreakRequest = function (reason) {

        var tokenPayload = jwtHelper.decodeToken(dataParser.userProfile.server.token);
        console.log(tokenPayload);
        resourceService.BreakRequest(tokenPayload.client, reason).then(function (response) {
            $scope.currentState = reason;

        }, function (error) {
            $log.debug("BreakRequest err");
        });

    };

    $scope.EndBreakRequest = function () {

        var tokenPayload = jwtHelper.decodeToken(dataParser.userProfile.server.token);

        resourceService.EndBreakRequest(tokenPayload.client, $scope.currentState).then(function (response) {
            $scope.currentState = "Available";
        }, function (error) {
            $log.debug("EndBreakRequest err");
        });

    };

    $scope.RegisterWithArds = function () {

        var tokenPayload = jwtHelper.decodeToken(dataParser.userProfile.server.token);

        resourceService.RegisterWithArds(tokenPayload.client).then(function (response) {

        }, function (error) {
            $log.debug("RegisterWithArds err");
        });

    };

    $scope.unregisterWithArds = function () {

        var tokenPayload = jwtHelper.decodeToken(dataParser.userProfile.server.token);

        resourceService.unregisterWithArds(tokenPayload.client).then(function (response) {

        }, function (error) {
            $log.debug("RegisterWithArds err");
        });

    };
});