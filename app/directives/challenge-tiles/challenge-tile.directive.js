(function() {
  'use strict';

  angular.module('tcUIComponents').directive('challengeTile', challengeTile);

  function challengeTile() {
    return {
      restrict: 'E',
      templateUrl: function(elem, attrs) {
        if (attrs.spotlight) {
          return 'directives/challenge-tiles/spotlight-tile.directive.html';
        }

        return 'directives/challenge-tiles/challenge-tile.directive.html';
      },
      scope: {
        challenge: '=',
        view: '='
      },
      controller: ['$scope', 'CONSTANTS', '$attrs', function($scope, CONSTANTS, $attrs) {
        $scope.DOMAIN = CONSTANTS.domain;

        activate();

        function activate() {
          if (!$attrs.spotlight) {
            processChallenge($scope.challenge);
          }
        }

        function processChallenge(challenge) {
          var now = moment();
          var registrationDate = moment(challenge.registrationEndDate);
          var submissionDate = moment(challenge.submissionEndDate);

          challenge.registrationClosed = now > registrationDate ? true : false;
          challenge.submissionClosed = now > submissionDate ? true : false;
          challenge.registrationTimeLeft = (registrationDate - now)/(24*60*60*1000);
          challenge.submissionTimeLeft = (submissionDate - now)/(24*60*60*1000);
          // temporary...right now many challenges have a `null` track
          challenge.track = challenge.track ? challenge.track.trim() : 'DESIGN';
          if (challenge.track == 'DESIGN' && challenge.userDetails.submissions && challenge.userDetails.submissions.length > 0) {
            challenge.thumbnailId = challenge.userDetails.submissions[0].id;
          }

          // challenge.phaseMsg = preparePhaseMessage(challenge);

          // TODO create msg dynamically
          challenge.memberStatusMsg = 'You are registered!';
        }
      }]
    };
  }
})();
