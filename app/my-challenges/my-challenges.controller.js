(function () {
  'use strict';

  angular.module('tc.myChallenges').controller('MyChallengesController', MyChallengesController);

  MyChallengesController.$inject = ['ChallengeService', 'UserService', '$q', '$log', 'CONSTANTS', 'Helpers', '$scope', 'userIdentity', '$stateParams'];

  function MyChallengesController(ChallengeService, UserService, $q, $log, CONSTANTS, Helpers, $scope, userIdentity, $stateParams) {
    var vm = this;
    vm.domain = CONSTANTS.domain;
    vm.loading = true;
    vm.myChallenges = [];
    vm.userHasChallenges = true;
    vm.viewActiveChallenges = viewActiveChallenges;
    vm.viewPastChallenges = viewPastChallenges;
    vm.view = 'tile';
    vm.changeView = changeView;
    vm.statusFilter = _.get($stateParams, 'status','active');

    // paging params, these are updated by tc-pager
    vm.pageParams = {
      offset : 0,
      limit: 16,
      count: 0,
      totalCount: 0,
      // counter used to indicate page change
      updated: 0
    };
    vm.orderBy = 'submissionEndDate';

    var userId = userIdentity.userId;
    var handle = userIdentity.handle;

    activate();

    function activate() {
      vm.isError = false;
      vm.isCopilot = _.includes(userIdentity.roles, 'copilot');

      // watches page change counter to reload the data
      $scope.$watch('vm.pageParams.updated', function(updatedParams) {
        _getChallenges();
      });
      if (vm.statusFilter == 'completed') {
        viewPastChallenges();
      } else {
        viewActiveChallenges();
      }
    }

    function changeView(view) {
      vm.view = view;
    }

    function viewActiveChallenges() {
      if (vm.statusFilter != 'active') {
        vm.myChallenges = [];
        vm.pageParams.offset = 0;
        vm.statusFilter = 'active';
        _getChallenges();
      }
    };

    function viewPastChallenges() {
      if (vm.statusFilter != 'completed') {
        vm.myChallenges = [];
        vm.pageParams.offset = 0;
        vm.statusFilter = 'completed';
        _getChallenges();
      }
    };

    function _getChallenges() {
      var params = {
        limit: vm.pageParams.limit,
        offset: vm.pageParams.offset,
        orderBy: vm.orderBy, // TODO verify if this is the correct sort order clause,
        filter: "status=" + vm.statusFilter
      };
      vm.loading = true;

      return ChallengeService.getUserChallenges(handle, params)
      .then(function(challenges){
        ChallengeService.processActiveDevDesignChallenges(challenges);
        if (challenges.length > 0) {
          vm.myChallenges = challenges;
          vm.userHasChallenges = true;
          vm.loading = false;
        } else {
          vm.userHasChallenges = false;
          vm.loading = false;
        }
      })
      .catch(function(err) {
        vm.userHasChallenges = false;
        vm.isError = true;
        vm.loading = false;
        $log.error(err);
      });
    }
  }
})();
