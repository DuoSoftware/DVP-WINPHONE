/**
 * Created by Rajinda on 4/6/2016.
 */

'use strict'
routerApp.controller('callContentCtrl', function ($rootScope, $log, $scope, $state, $filter, dataParser, socketAuth, Notification,jwtHelper, resourceService) {


    $scope.currentState = "";
    $scope.registerdWithArds = false;
    $scope.BreakRequest = function (reason) {
        resourceService.BreakRequest(dataParser.userProfile.id, reason).then(function (response) {
            $scope.currentState = reason;
        }, function (error) {
            $log.debug("BreakRequest err");
        });

    };

    $scope.EndBreakRequest = function () {
        resourceService.EndBreakRequest(dataParser.userProfile.id, $scope.currentState).then(function (response) {
            $scope.currentState = "Available";
        }, function (error) {
            $log.debug("EndBreakRequest err");
        });

    };

    $scope.RegisterWithArds = function () {
        resourceService.RegisterWithArds(dataParser.userProfile.id,dataParser.userProfile.veeryFormat ).then(function (response) {
            $scope.registerdWithArds = response;
        }, function (error) {
            $log.debug("RegisterWithArds err");
        });

    };

    $scope.unregisterWithArds = function () {
        resourceService.UnregisterWithArds(dataParser.userProfile.id).then(function (response) {
            $scope.registerdWithArds = !response;
        }, function (error) {
            $log.debug("RegisterWithArds err");
        });

    };

    $scope.status = function (dtmf) {
        $state.go('status');
    };

    var onEventsListener = function (e) {
        console.info(e.type);
        //document.getElementById("lblStatus").innerHTML = e.type;
        //Notification.info({message: e.type, delay: 500, closeOnClick: true});
    };

    var onSipEventSession = function (e) {
        try {
            $scope.$apply(function () {
                $scope.call.status = e;
            });

            //document.getElementById("lblSipStatus").innerHTML = e;
            //Notification.info({message: e, delay: 500, closeOnClick: true});
            if (e == 'Session Progress') {
                //document.getElementById("lblSipStatus").innerHTML = 'Session Progress';
                //document.getElementById("lblStatus").innerHTML = 'Session Progress';
                Notification.info({message: 'Session Progress', delay: 500, closeOnClick: true});
            }
            else if (e.toString().toLowerCase() == 'in call') {
                UIStateChange.inCallConnectedState();

            }
        }
        catch (ex) {
            console.error(ex.message);
        }
    };


    var fullScreen = function (b_fs) {
        bFullScreen = b_fs;
        if (tsk_utils_have_webrtc4native() && bFullScreen && videoRemote.webkitSupportsFullscreen) {
            if (bFullScreen) {
                videoRemote.webkitEnterFullScreen();
            }
            else {
                videoRemote.webkitExitFullscreen();
            }
        }
        else {
            if (tsk_utils_have_webrtc4npapi()) {
                try {
                    if (window.__o_display_remote) window.__o_display_remote.setFullScreen(b_fs);
                }
                catch (e) {
                    document.getElementById("divVideo").setAttribute("class", b_fs ? "full-screen" : "normal-screen");
                }
            }
            else {
                document.getElementById("divVideo").setAttribute("class", b_fs ? "full-screen" : "normal-screen");
            }
        }
    };

    var onErrorCallback = function (e) {
        //document.getElementById("lblStatus").innerHTML = e;
        Notification.error({message: e, delay: 500, closeOnClick: true});
        console.error(e);
        $state.go('register');
    };
    var uiOnConnectionEvent = function (b_connected, b_connecting) {
        try {
            if (!b_connected && !b_connecting)
                $state.go('register');

            /* document.getElementById("btnCall").disabled = !(b_connected && tsk_utils_have_webrtc() && tsk_utils_have_stream());
             document.getElementById("btnAudioCall").disabled = document.getElementById("btnCall").disabled;
             document.getElementById("btnHangUp").disabled = !oSipSessionCall;*/
        }
        catch (ex) {
            console.error(ex.message);
        }
    };
    var uiVideoDisplayShowHide = function (b_show) {
        if (b_show) {
            document.getElementById("divVideo").style.height = '340px';
            document.getElementById("divVideo").style.height = navigator.appName == 'Microsoft Internet Explorer' ? '100%' : '340px';
        }
        else {
            document.getElementById("divVideo").style.height = '0px';
            document.getElementById("divVideo").style.height = '0px';
        }
        //btnFullScreen.disabled = !b_show;
    };

    var uiVideoDisplayEvent = function (b_local, b_added) {
        var o_elt_video = b_local ? videoLocal : videoRemote;

        if (b_added) {
            o_elt_video.style.opacity = 1;
            uiVideoDisplayShowHide(true);
        }
        else {
            o_elt_video.style.opacity = 0;
            fullScreen(false);
        }
    };


    var onIncomingCall = function (sRemoteNumber) {
        try {
            //document.getElementById("lblSipStatus").innerHTML = sRemoteNumber;
            //Notification.info({message: sRemoteNumber, delay: 500, closeOnClick: true});
            UIStateChange.inIncomingState();
            $scope.call.number = sRemoteNumber;
            addCallToHistory(sRemoteNumber, 2);
        }
        catch (ex) {
            console.error(ex.message);
        }
    };

    var uiCallTerminated = function (msg) {
        try {

            UIStateChange.disableTimer();
            UIStateChange.inIdleState();
            console.log("uiCallTerminated");
            if (window.btnBFCP) window.btnBFCP.disabled = true;


            stopRingbackTone();
            stopRingTone();

            //document.getElementById("lblSipStatus").innerHTML = msg;
            //Notification.info({message: msg, delay: 500, closeOnClick: true});
            uiVideoDisplayShowHide(false);
            //document.getElementById("divCallOptions").style.opacity = 0;


            uiVideoDisplayEvent(false, false);
            uiVideoDisplayEvent(true, false);

            //setTimeout(function () { if (!oSipSessionCall) txtCallStatus.innerHTML = ''; }, 2500);
        }
        catch (ex) {
            console.error(ex.message)
        }
    };

    var notificationEvent = function (description) {
        try {
            //document.getElementById("lblStatus").innerHTML = description;
            //Notification.info({message: description, delay: 500, closeOnClick: true});

            if (description == 'Connected') {
                UIStateChange.inIdleState();
                Notification.success({message: description, delay: 3000, closeOnClick: true});
                $scope.RegisterWithArds();
            }
            else if (description == 'Forbidden') {
                console.error(description);
                Notification.error({message: description, delay: 3000, closeOnClick: true});
                $state.go('register');
            }
        }
        catch (ex) {
            console.error(ex.message);
        }

    };




    $scope.sipSendDTMF = function (dtmf) {
        sipSendDTMF(dtmf);
    };


    var openKeyPad = function () {

    };

    openKeyPad();

    $scope.closeKeyPad = function () {
        document.getElementById("divKeyPad").style.left = '0px';
        document.getElementById("divKeyPad").style.top = '0px';
        document.getElementById("divKeyPad").style.visibility = 'hidden';
        document.getElementById("divKeyPad").style.visibility = 'hidden';
    };

    $scope.unRegister = function () {
        sipUnRegister();
    };

    document.getElementById("phoneButtons").style.visibility = 'hidden';

    angular.element(document).ready(function () {
        UIStateChange.loadInit(false);
        if (angular.isDefined($scope.login)) {
            var userEvent = {
                onSipEventSession: onSipEventSession,
                notificationEvent: notificationEvent,
                onErrorCallback: onErrorCallback,
                uiOnConnectionEvent: uiOnConnectionEvent,
                uiVideoDisplayShowHide: uiVideoDisplayShowHide,
                uiVideoDisplayEvent: uiVideoDisplayEvent,
                onIncomingCall: onIncomingCall,
                uiCallTerminated: uiCallTerminated
            };
            socketAuth.getAuthenticatedAsPromise();// connect to notification server
            preInit(userEvent, dataParser.userProfile);// initialize Soft phone

        }
        else {

            $state.go('register');
        }

    });

    $scope.call = {};
    $scope.call.status = "";
    $scope.call.number = "";

    //code update #damith
    //#keypad option
    //call state
    // 0  miss call , 1 outgoing , 2 incoming
    $scope.callHistoryes = [{
        "id": 1,
        "number": "Veery-support",
        "date": $filter('date')(new Date(), 'dd-MM-yyyy'),
        "time": $filter('date')(new Date(), 'HH:mm'),
        "state": 0
    }];


    var addCallToHistory = function (number, state) {
        var dateOut = new Date();
        var date = $filter('date')(dateOut, 'dd-MM-yyyy');
        var time = $filter('date')(dateOut, 'HH:mm');
        var id = $scope.callHistoryes.length + 1;
        var item = {
            "id": id, "number": number, "date": date, "time": time, "state": state
        };
        $scope.callHistoryes.push(item);
    };

    var UIelementOption = {
        showLoadingHistory: false,
        showCallHistory: true,
        showKeyPad: false,
        showOutGoingCall: false,
        showCallConnect: false,
        showIncomingCall: false,
        isCallConnect: false,
        isVideoCall: false,
        isTimer: false,
        isCallBtn: false,
        isAnzBtn: false,
        isEndCallBtn: false,
        isMicrophoneBtn: false,
        isKeyPadBtn: false,
        isVideoCallBtn: false,
        isChangeBtnWrap: false,
        callFunctions: false

    };

    $scope.UIelementOption = UIelementOption;

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    //#UI change state
    var UIStateChange = (function () {
        return {
            showKeyPad: function () {
                $scope.safeApply(function() {


                    $scope.UIelementOption.showCallConnect = false;
                    $scope.UIelementOption.showIncomingCall = false;

                    if ($scope.UIelementOption.isCallConnect) {
                        if ($scope.UIelementOption.showKeyPad) {
                            $scope.UIelementOption.showCallConnect = true;
                            $scope.UIelementOption.showKeyPad = false;
                        }
                        else {
                            $scope.UIelementOption.showCallConnect = false;
                            $scope.UIelementOption.showKeyPad = true;
                        }
                    }
                    else {
                        if ($scope.UIelementOption.showKeyPad) {
                            $scope.UIelementOption.showCallHistory = true;
                            $scope.UIelementOption.showKeyPad = false;
                        }
                        else {

                            $scope.UIelementOption.showCallHistory = false;
                            $scope.UIelementOption.showKeyPad = true;
                        }
                    }
                });
            },
            inCallConnectedState: function () {
                $scope.safeApply(function() {
                    $scope.$broadcast('timer-start');
                    $scope.UIelementOption.isTimer = true;


                    $scope.UIelementOption.isCallConnect = true;

                    $scope.UIelementOption.showCallConnect = true;
                    $scope.UIelementOption.showIncomingCall = false;
                    $scope.UIelementOption.showOutGoingCall = false;
                    $scope.UIelementOption.showKeyPad = false;
                    $scope.UIelementOption.showCallHistory = false;

                    // buttons
                    $scope.UIelementOption.callFunctions = true;
                    $scope.UIelementOption.isVideoCallBtn = false;
                    $scope.UIelementOption.isCallBtn = false;
                    $scope.UIelementOption.isEndCallBtn = true;
                });



            },
            inCallState: function () {
                $scope.UIelementOption.showCallConnect = false;
                $scope.UIelementOption.showIncomingCall = false;
                $scope.UIelementOption.showOutGoingCall = true;
                $scope.UIelementOption.showKeyPad = false;
                $scope.UIelementOption.showCallHistory = false;

                // buttons
                $scope.UIelementOption.callFunctions = true;
                $scope.UIelementOption.isVideoCallBtn = false;
                $scope.UIelementOption.isCallBtn = false;
                $scope.UIelementOption.isEndCallBtn = true;

            },
            inIdleState: function () {

                $scope.$apply(function () {
                    $scope.UIelementOption.showCallHistory = true;
                    $scope.UIelementOption.showCallConnect = false;
                    $scope.UIelementOption.showIncomingCall = false;
                    $scope.UIelementOption.showOutGoingCall = false;
                    $scope.UIelementOption.showKeyPad = false;


                    // buttons
                    $scope.UIelementOption.callFunctions = true;
                    $scope.UIelementOption.isVideoCallBtn = true;
                    $scope.UIelementOption.isCallBtn = true;
                    $scope.UIelementOption.isEndCallBtn = false;

                    $scope.call.status = "Trying";
                });

            },
            inIncomingState: function () {
                $scope.$apply(function () {
                    // buttons
                    $scope.UIelementOption.callFunctions = false;
                    $scope.UIelementOption.isVideoCallBtn = false;
                    $scope.UIelementOption.isCallBtn = false;
                    $scope.UIelementOption.isEndCallBtn = false;

                    $scope.UIelementOption.showCallConnect = false;
                    $scope.UIelementOption.showOutGoingCall = false;
                    $scope.UIelementOption.showKeyPad = false;
                    $scope.UIelementOption.showCallHistory = false;
                    $scope.UIelementOption.showIncomingCall = true;
                });
            },

            loadInit: function (state) {
                $scope.UIelementOption.showIncomingCall = state;
                $scope.UIelementOption.showOutGoingCall = state;
                $scope.UIelementOption.showKeyPad = state;
                $scope.UIelementOption.showCallHistory = state;
                $scope.UIelementOption.isVideoCall = state;

            },
            refreshAllUI: function () {
                $scope.UIelementOption.showIncomingCall = false;
                $scope.UIelementOption.showOutGoingCall = false;
                $scope.UIelementOption.showKeyPad = false;
                $scope.UIelementOption.showCallHistory = true;
                $scope.UIelementOption.isVideoCall = false;
            },

            disableTimer: function () {
                $scope.$broadcast('timer-stop');
                $scope.UIelementOption.isTimer = false;
            },
            changeCallBtnState: function (state) {
                $scope.UIelementOption.isCallBtn = state;
            },
            changeEndCallBtnState: function (state) {
                $scope.UIelementOption.isEndCallBtn = state;
            },
            changeAnzCall: function (state) {
                $scope.UIelementOption.isAnzBtn = state;
            },
            changeVideoCall: function (state) {
                $scope.UIelementOption.isVideoCallBtn = state;
            },
            disableBtnArea: function () {

            }
        }
    })();//end

    $scope.eventHandler = {
        keyPadClick: function () {
            UIStateChange.showKeyPad();
        },
        makeAudioCall: function (call) {
            if (call.number == "") {
                return
            }
            UIStateChange.inCallState();
            sipCall('call-audio', call.number);
            addCallToHistory(call.number, 1);
        },
        endCall: function () {
            //UIStateChange.inIdleState();
            sipHangUp();
        },
        makeVideoCall: function (call) {
            if (call.number == "") {
                return
            }
            UIStateChange.inCallState();
            sipCall('call-audiovideo', call.number);
            addCallToHistory(call.number, 1);
        },
        callMute: function () {
            sipToggleMute();
        },
        answerCall: function () {
            UIStateChange.inCallConnectedState();
            answerCall();
        },
        rejectCall: function () {
            //UIStateChange.inIdleState();
            rejectCall();
        },
        sipSendDTMF: function (dtmf) {
            sipSendDTMF(dtmf);
            $scope.call.number = $scope.call.number +dtmf;
        }
    }

}).directive('noClick', function () {
    return {
        restrict: 'EA',
        replace: true,
        link: function (scope, element, attrs) {
            var clickingCallback = function () {
                var soundUrl = 'assets/audio/135691_2465261.mp3';
                var sound = new Audio(soundUrl);
                sound.play();
                setTimeout(function () {
                    sound.pause();
                }, 120);
            };
            element.bind('click', clickingCallback);
        }
    };
});