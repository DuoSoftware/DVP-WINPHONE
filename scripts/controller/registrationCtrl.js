/**
 * Created by Rajinda on 4/6/2016.
 */

'use strict'
routerApp.controller('registrationCtrl', function ($rootScope, $scope, $state, $base64, $http, jwtHelper, dataParser,Notification, resourceService) {


    $scope.profile = {};
    $scope.profile.displayName = "";
    $scope.profile.authorizationName = "";
    $scope.profile.publicIdentity = "";//sip:bob@159.203.160.47
    $scope.profile.server = {};
    $scope.profile.server.domain = "";
    $scope.profile.server.websocketUrl = "";//wss://159.203.160.47:7443
    $scope.profile.server.outboundProxy = "";
    $scope.profile.server.enableRtcwebBreaker = false;
    $scope.profile.server.password = null;
    $scope.profile.server.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ3YXJ1bmFAZHVvc29mdHdhcmUuY29tIiwianRpIjoiMTk2N2E5MjItNmIyOS00NDgxLWI2MWUtOTMwZjVmMDA3ZDM3Iiwic3ViIjoiZTBlNTNhOWUtZjNkZi00MTZjLWFmZWItYzI2ZDVhZWIwYWY2IiwiZXhwIjoxNDY1MzEyMTQ2LCJ0ZW5hbnQiOiIxIiwiY29tcGFueSI6IjMiLCJjbGllbnQiOiIxIiwic2NvcGUiOlt7InJlc291cmNlIjoiYXJkc3Jlc291cmNlIiwiYWN0aW9ucyI6WyJyZWFkIiwid3JpdGUiLCJkZWxldGUiXX0seyJyZXNvdXJjZSI6InJlYWQifSx7InJlc291cmNlIjoid3JpdGUifSx7InJlc291cmNlIjoiZGVsZXRlIn0seyJyZXNvdXJjZSI6InJlc291cmNlIiwiYWN0aW9ucyI6WyJhcmRzcmVzb3VyY2UiLCJyZWFkIiwid3JpdGUiLCJkZWxldGUiLCJyZXNvdXJjZSJdfV0sImlhdCI6MTQ2NDcwNzM0Nn0.brIo8b6per6a1Djm4armChkS4L2O6T40HSrlj-scwcg";

    $scope.Register = function () {


        var url = "http://localhost:3636/oauth/token";
        var encoded = $base64.encode("ae849240-2c6d-11e6-b274-a9eec7dab26b:6145813102144258048");
        var config = {
            headers: {
                'Authorization': 'Basic ' + encoded
            }
        };

        var data = {
            "grant_type": "password",
            "username": $scope.profile.userName,
            "password": $scope.profile.password,
            "scope": "write_ardsresource write_notification read_userProfile profile_veeryaccount resourceid"
        };


        $http.post(url, data, config)
            .success(function (data, status, headers, config) {
                $scope.PostDataResponse = data;
                console.log(data);

                if (data) {
                    var decodeData = jwtHelper.decodeToken(data.access_token);

                    var values = decodeData.context.veeryaccount.contact.split("@");
                    $scope.profile.id = decodeData.context.resourceid;
                    $scope.profile.displayName = values[0];
                    $scope.profile.authorizationName = values[0];
                    $scope.profile.publicIdentity = "sip:" + decodeData.context.veeryaccount.contact;//sip:bob@159.203.160.47
                    $scope.profile.server.token = data.access_token;
                    $scope.profile.server.domain = values[1];
                    $scope.profile.server.websocketUrl = "wss://" + values[1] + ":7443";//wss://159.203.160.47:7443
                    $scope.profile.server.outboundProxy = "";
                    $scope.profile.server.enableRtcwebBreaker = false;
                    dataParser.userProfile = $scope.profile;
                    resourceService.GetContactVeeryFormat($scope.profile.userName).then(function (response) {
                        if (response.IsSuccess) {
                            $rootScope.login = 0;
                            if ($scope.profile.server.password)
                                $scope.profile.password = $scope.profile.server.password;
                            $scope.profile.veeryFormat = response.Result;
                            dataParser.userProfile = $scope.profile;
                            $state.go('callControl');
                        }
                        else{
                            Notification.error({message: "Fail to Get Contact Details.", delay: 500, closeOnClick: true});
                        }
                    }, function (error) {
                        Notification.error({message: "Fail to Communicate with servers", delay: 1000, closeOnClick: true});
                    });


                }
            });
        /* $rootScope.login = 0;
         dataParser.userProfile = $scope.profile;
         $state.go('callControl');*/
    };

});