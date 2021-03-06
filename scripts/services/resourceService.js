/**
 * Created by Rajinda on 12/31/2015.
 */

var clusterModule = angular.module("resourceServiceModule", []);


clusterModule.factory("resourceService", function ($http, $log, baseUrl, dataParser, userServiceBaseUrl) {
//Format is Authorization: Bearer [token]
    var breakRequest = function (resourceId, reason) {
        return $http({
            method: 'put',
            url: baseUrl + "/" + resourceId + "/state/NotAvailable/reason/" + reason,
            headers: {
                'authorization': "Bearer " + dataParser.userProfile.server.token
            }
        }).then(function (response) {
            return response.data.IsSuccess;
        });
    };

    var endBreakRequest = function (resourceId, reason) {

        return $http({
            method: 'put',
            url: baseUrl + "/" + resourceId + "/state/Available/reason/EndBreak",
            headers: {
                'authorization': "Bearer " + dataParser.userProfile.server.token
            }
        }).then(function (response) {
            return response.data.IsSuccess;
        });

    };
//{"ResourceId":resourceId,"HandlingTypes":["CALL"]}
    var registerWithArds = function (resourceId,contact) {

        return $http({
            method: 'post',
            url: baseUrl,
            headers: {
                'authorization': "Bearer " + dataParser.userProfile.server.token
            },
            data: {
                "ResourceId": resourceId,
                "HandlingTypes": [{
                    "Type": "CALL",
                    "Contact": contact
                }]
            }

        }).then(function (response) {
            return response.data.IsSuccess;
        });

    };

    var unregisterWithArds = function (resourceId) {

        return $http({
            method: 'delete',
            url: baseUrl + "/" + resourceId,
            headers: {
                'authorization': "Bearer " + dataParser.userProfile.server.token
            },
            data: {"ResourceId": resourceId, "HandlingTypes": ["CALL"]}
        }).then(function (response) {
            return response.data.IsSuccess;
        });

    };

    var getContactVeeryFormat = function (userName) {

        return $http({
            method: 'get',
            url: userServiceBaseUrl + "User/" + userName + "/profile/veeryformat/veeryaccount",
            headers: {
                'authorization': "Bearer " + dataParser.userProfile.server.token
            }
        }).then(function (response) {
            return response.data;
        });

    };

    return {
        BreakRequest: breakRequest,
        EndBreakRequest: endBreakRequest,
        RegisterWithArds: registerWithArds,
        UnregisterWithArds: unregisterWithArds,
        GetContactVeeryFormat: getContactVeeryFormat
    }

});
