/**
 * Created by Rajinda on 4/26/2016.
 */

angular.module('veerySoftPhone')
    .factory('socketAuth', function(socket, $q) {
        return {
            getAuthenticatedAsPromise:function(){

                var listenForAuthentication = function(){
                    console.log('listening for socket authentication');
                    var listenDeferred = $q.defer();
                    var authCallback = function(){
                        console.log('listening for socket authentication - done');
                        listenDeferred.resolve(true);
                    };
                    socket.socket.on('authenticated', authCallback);
                    return listenDeferred.promise;
                };

                if(!socket.socket){
                    socket.initialize();
                    return listenForAuthentication();
                }else{
                    if(socket.getAuthenticated()){
                        return $q.when(true);
                    }else{
                        return listenForAuthentication();
                    }
                }
            }
        };
    });