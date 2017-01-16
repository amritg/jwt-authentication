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
            vm.loggedUser = response.data;
        });

        function getRandomUser(){
            RandomUserFactory.getRandomUser().then(function success(response){
                vm.randomUser = response.data;
            },handleError);
        }
        function login(username,password){
            vm.errorMessage = "";
            UserFactory.login(username, password).then(function success(response){
                vm.loggedUser = response.data.username;
                console.log(response.data.token);
            }, handleError);
        }
        function logout(){
            UserFactory.logout();
            vm.loggedUser = null;
        }
        function handleError(response){
            vm.errorMessage = "Username or password is incorrect";
            console.log('Error:' + response.data);
        }
    });

    app.factory('RandomUserFactory',function RandomUserFactory($http, API_URL){
        return{
            getRandomUser: getRandomUser
        };
        function getRandomUser(){
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
            AuthTokenFactory.removeToken();
        }
        function getUser(){
            if(AuthTokenFactory.getToken()){
                return $http.get(API_URL+'/me');
           }else{
               return $q.reject({data: 'Client is not authenticated'});
           }           
        }
    });
    app.factory('AuthTokenFactory', function AuthTokenFactory($window){
        var store = $window.localStorage;
        var key = 'auth-token';
        return {
            getToken: getToken,
            setToken: setToken,
            removeToken: removeToken
        };
        function getToken(){
            return store.getItem(key);
        }
        function setToken(token){
            store.setItem(key, token);
        }
        function removeToken(){
            store.removeItem(key);
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