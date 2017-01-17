(function(){
    'user strict';
    // var app = angular.module('app',['ui.router'], function config($httpProvider){
    //     $httpProvider.interceptors.push('AuthIntercepter');
    // });
    var app = angular.module('app',['ui.router']);
    app.constant('API_URL', 'http://localhost:3000');

    app.controller('Authenticate',function Authenticate(RandomUserFactory, UserFactory,$location,$scope){
        $scope.login = function (username,password){
            $scope.errorMessage = "";
            UserFactory.login(username, password).then(function success(response){
                console.log(response.data.token);
                $location.path('/services');
            }, handleError);
        }
        function handleError(response){
            $scope.errorMessage = "Username or password is incorrect";
            console.log('Error:' + response.data);
        }
    });

    app.controller('ServiceController', ['$scope','$location','RandomUserFactory','UserFactory',function($scope,$location,RandomUserFactory,UserFactory){
        $scope.username = UserFactory.getUser();
        $scope.getRandomUser = function(){
            RandomUserFactory.getRandomUser().then(function success(response){
                $scope.randomUser = response.data;
            });
        }
        $scope.logout = function(){
            UserFactory.logout();
            $location.path('/login');
        }
    }]);

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
            getUser: getUser,
            checkToken: checkToken
        };
        function login(username,password){
            return $http.post(API_URL +'/login',{username: username, password: password}).then(function (response){
                AuthTokenFactory.setToken(response.data.token);
                AuthTokenFactory.setUser(response.data.username);
                return response;
            });
        }
        function logout(){
            AuthTokenFactory.removeToken();
        }
        function getUser(){
            if(AuthTokenFactory.getToken()){
                return AuthTokenFactory.getUser();
           }else{
               return $q.reject({data: 'Client is not authenticated'});
           }           
        }
        function checkToken(){
            return $http.get(API_URL+'/services').then(function (response){
                            // console.log(response);
                            return response;
                        },function (err){
                            // console.log('Here is error');
                            // console.log(err);
                            return err;
                        });
        }
    });
    app.factory('AuthTokenFactory', function AuthTokenFactory($window){
        var store = $window.localStorage;
        var key = 'auth-token';
        return {
            getToken: getToken,
            setToken: setToken,
            removeToken: removeToken,
            getUser: getUser,
            setUser: setUser,
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
        function setUser(username){
            store.setItem("username",username);
        }
        function getUser(){
            return store.getItem("username");
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

    app.config(['$stateProvider', '$urlRouterProvider','$httpProvider', function($stateProvider, $urlRouterProvider,$httpProvider){
                $stateProvider
                    .state('login',{
                        url: '/login',
                        templateUrl: '/views/login.html',
                        resolve: {
                            checkLogIn: ['AuthTokenFactory','$location','UserFactory',function(AuthTokenFactory,$location,UserFactory){
                                    if(UserFactory.checkToken()){
                                        $location.url('/services');
                                    }else{
                                        $location.url('/login');
                                    }
                                    // if(AuthTokenFactory.getToken()){
                                    //     $location.url('/services');
                                    // }else{
                                    //     $location.url('/login');
                                    // }
                                }]
                        }
                    })
                    .state('services',{
                        url: '/services',
                        templateUrl: '/views/services.html',
                        resolve: {
                            checkLogIn: ['AuthTokenFactory','$location','$http',function(AuthTokenFactory,$location,$http){
                                    if(AuthTokenFactory.getToken()){
                                    }else{
                                        $location.url('/login');
                                    }
                                }]
                        }
                        // resolve: {
                        //     checkLogIn: ['AuthTokenFactory','$location','$q',function(AuthTokenFactory,$location,$q){
                        //             var deferred = $q.defer();
                        //             if(AuthTokenFactory.getToken()){
                        //                 deferred.resolve();
                        //             }else{
                        //                 deferred.reject();
                        //                 $location.url('/login');
                        //             }
                        //             return deferred.promise();
                        //         }]
                        // }
                    });
                $urlRouterProvider.otherwise('login');
                $httpProvider.interceptors.push('AuthIntercepter');
    }]);
})()