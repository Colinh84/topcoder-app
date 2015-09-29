(function() {
  'use strict';

  angular.module('tc.myChallenges').config([
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    routes
  ]);

  function routes($stateProvider, $urlRouterProvider, $httpProvider) {
    var states = {
      'my-challenges': {
        url: '/my-challenges/:status',
        parent: 'root',
        templateUrl: 'my-challenges/my-challenges.html',
        controller: 'MyChallengesController',
        controllerAs: 'vm',
        data: {
          authRequired: true,
          title: 'My Challenges'
        },
        resolve: {
          userIdentity: ['UserService', function(UserService) {
            return UserService.getUserIdentity();
          }],
          statusFilter: ['$stateParams', function($stateParams) {
            return $stateParams.status;
          }],
        }
      }
    };
    for (var name in states) {
      var state = states[name];
      $stateProvider.state(name, state);
    }
  }
})();
