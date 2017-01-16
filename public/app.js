(function(){
    'user strict';
    var app = angular.module('app',[], function config($httpProvider){
        $httpProvider.interceptors.push('AuthIntercepter');
    });
    app.constant('API_URL', 'http://localhost:3000');

    app.controller('Authenticate',function Authenticate(RandomUserFactory, UserFactory){
        var vm = this;
        vm.getRandomUser = getRandomUser;
        vm.login = login;
        vm.logout = logout;

        //Initilization
        UserFactory.getUser().then(function(response){
            vm.user = response.data;
        });

        function getRandomUser(){
            RandomUserFactory.getUser().then(function success(response){
                vm.randomUser = response.data;
            },handleError);
        }
        function login(username,password){
            UserFactory.login(username, password).then(function success(response){
                vm.user = response.data.user;
                console.log(response.data.token);
            }, handleError);
        }
        function logout(){
            UserFactory.logout();
            vm.user = null;
        }
        function handleError(response){
            console.log('Error:' + response.data);
        }
    });

    app.factory('RandomUserFactory',function RandomUserFactory($http, API_URL){
        return{
            getUser: getUser
        };
        function getUser(){
            return $http.get(API_URL+'/random-user');
        }
    });
    app.factory('UserFactory', function UserFactory($http, API_URL,AuthTokenFactory,$q){
        return {
            login: login,
            logout: logout,
            getUser: getUser
        };
        function login(username,password){
            return $http.post(API_URL +'/login',{username: username, password: password}).then(function (response){
                AuthTokenFactory.setToken(response.data.token);
                return response;
            });
        }
        function logout(){
            AuthTokenFactory.setToken();
        }
        function getUser(){
            if(AuthTokenFactory.getToken()){
                return $http.get(API_URL+'/me');
           }else{
               return $q.reject({data: 'client is not authenticated'});
           }           
        }
    });
    app.factory('AuthTokenFactory', function AuthTokenFactory($window){
        var store = $window.localStorage;
        var key = 'auth-token';
        return {
            getToken: getToken,
            setToken: setToken
        };
        function getToken(){
            return store.getItem(key);
        }
        function setToken(token){
            if(token){
                store.setItem(key, token);
            }else{
                store.removeItem(key);
            }
        }
    });

    app.factory('AuthIntercepter', function AuthIntercepter(AuthTokenFactory){
        return{
            request: addToken
        }
        function addToken(config){
            var token = AuthTokenFactory.getToken();
            if(token){
                config.headers =  config.headers || {};
                config.headers.Authorization = 'Bearer ' + token; 
            }
            return config;
        }
    });
})()