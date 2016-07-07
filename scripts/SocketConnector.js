/**
 * Created by Rajinda on 4/26/2016.
 */

/* global io */

angular.module('veerySoftPhone')
    .factory('socket', function (socketFactory, Notification,dataParser) {

        var socket, ioSocket, isAuthenticated,
            self = {
                getAuthenticated: function () {
                    return isAuthenticated;
                }
            };
        // by default the socket property is null and is not authenticated
        self.socket = socket;
        // initializer function to connect the socket for the first time after logging in to the app
        self.initialize = function () {
            console.log('initializing socket');

            isAuthenticated = false;

            // socket.io now auto-configures its connection when we omit a connection url
            ioSocket = io('http://notificationservice.104.131.67.21.xip.io', {
                path: ''
            });

            //call btford angular-socket-io library factory to connect to server at this point
            self.socket = socket = socketFactory({
                ioSocket: ioSocket
            });

            //---------------------
            //these listeners will only be applied once when socket.initialize is called
            //they will be triggered each time the socket connects/re-connects (e.g. when logging out and logging in again)
            //----------------------
            socket.on('authenticated', function () {
                isAuthenticated = true;
                console.log('socket is jwt authenticated');
                //document.getElementById("lblNotification").innerHTML = "socket is jwt authenticated";
                Notification.success({message: "Register With Notification Provider.", delay: 500, closeOnClick: true});
            });
            //---------------------
            socket.on('connect', function () {
                //Notification.info({message: "sending JWT", delay: 500, closeOnClick: true});
                //send the jwt
                socket.emit('authenticate', {token: dataParser.userProfile.server.token});
            });

            socket.on('clientdetails', function (data) {
                //Notification.info({message: data, delay: 500, closeOnClick: true});
                console.log(data);
            });

            socket.on('disconnect', function (reason) {
                //Notification.info({message: reason, delay: 500, closeOnClick: true});
                console.log(reason);
            });

            socket.on('message', function (reason) {
                //Notification.info({message: reason, delay: 500, closeOnClick: true});
                console.log(reason);
            });

            socket.on('broadcast', function (data) {
                //document.getElementById("lblNotification").innerHTML = data;
                //Notification.info({message: data, delay: 500, closeOnClick: true});
                console.log(data);
            });

            socket.on('publish', function (data) {
                //document.getElementById("lblNotification").innerHTML = data;
                //Notification.info({message: data, delay: 500, closeOnClick: true});
                console.log(data);
            });

            socket.on('agent_connected', function (data) {
                //document.getElementById("lblNotification").innerHTML = data.Message;

                //Notification.primary({message: data.Message, delay: 5000, closeOnClick: true});
                console.log(data);
            });
            socket.on('agent_found', function (data) {

                var values = data.Message.split("|");
                var displayMsg = "Company : "+data.Company+"<br> Company No : "+values[5]+"<br> Caller : "+values[3]+"<br> Skill : "+values[6];
                //document.getElementById("lblNotification").innerHTML = displayMsg;
                Notification.success({
                    message: displayMsg,
                    title: 'Call Information\'s',
                    delay: 10000,
                    closeOnClick: true
                });
                console.log(data);
            });
            socket.on('agent_disconnected', function (data) {
               // document.getElementById("lblNotification").innerHTML = data.Message;
                //Notification.primary({message: data.Message, delay: 5000, closeOnClick: true});
                console.log(data);
            });
        };

        return self;

    });