(function () {
  'use strict';

  angular.module('tc.settings').controller('EditProfileController', EditProfileController);


  EditProfileController.$inject = ['userData', 'userHandle', 'ProfileService', 'ExternalAccountService', '$log', 'ISO3166', 'ImageService', '$rootScope', 'CONSTANTS', 'TagsService', 'toaster'];

  function EditProfileController(userData, userHandle, ProfileService, ExternalAccountService, $log, ISO3166, ImageService, $rootScope, CONSTANTS, TagsService, toaster) {
    $log = $log.getInstance("EditProfileCtrl");
    var vm = this;
    vm.toggleTrack    = toggleTrack;
    vm.updateCountry  = updateCountry;
    vm.onFileChange   = onFileChange;
    vm.updateProfile  = updateProfile;
    vm.linkedExternalAccounts = [];
    vm.linkedExternalAccountsData = {};
    vm.skills = false;
    vm.addSkill = addSkill;
    vm.tags = [];
    vm.profileFormProcessing = false;
    vm.tracks = {};
    vm.ASSET_PREFIX = CONSTANTS.ASSET_PREFIX;
    activate();

    function activate() {
      vm.countries = ISO3166.getAllCountryObjects();
      vm.countryObj = ISO3166.getCountryObjFromAlpha3(userData.competitionCountryCode);

      processData(userData);
      vm.userData = userData;
      ExternalAccountService.getLinkedExternalAccounts(userData.userId).then(function(data) {
        vm.linkedExternalAccounts = data;
      })

      ExternalAccountService.getLinkedExternalLinksData(userHandle).then(function(data) {
        vm.linkedExternalAccountsData = data.plain();
        vm.hasLinks = _.any(_.valuesIn(_.omit(vm.linkedExternalAccountsData, ['userId', 'updatedAt','createdAt','createdBy','updatedBy','handle'])));
      })
      .catch(function(err) {
        $log.error(JSON.stringify(err));
      });


      TagsService.getApprovedSkillTags()
      .then(function(tags) {
        vm.tags = tags;
      })
      .catch(function(err) {
        $log.error(JSON.stringify(err));
      });

      ProfileService.getUserSkills(vm.userData.handle)
      .then(function(skills) {
        vm.skills = _.map(skills.skills, function(el) {
          return _.extend({}, el, {isNew: 0});
        });
      })
      .catch(function(err) {
        $log.error(JSON.stringify(err));
      });
    }

    function addSkill(skill) {
      if (skill) {
        var skillTagId = _.get(skill, 'originalObject.id').toString();
        // verify if skill has already been added
        var idx = _.find(vm.skills, function(s) { return s.tagId == skillTagId});
        // _.find returns undefined when skill isn't found
        if (!idx) {
          // add the skill
          ProfileService.addUserSkill(vm.userData.handle, skillTagId).then(function(resp) {
            // find the new skill in response object and inject it into our existing list.
            // we dont want to replace the entire object / map  because we will lose hidden tags
            var newSkill = _.find(resp.skills, {tagId: skillTagId});
            newSkill.isNew = new Date().getTime();
            vm.skills.push(newSkill);
            toaster.pop("success", "Success!", "Skill added.");
          });
        }
      }
    }

    function updateCountry(angucompleteCountryObj) {
        var countryCode = _.get(angucompleteCountryObj, 'originalObject.alpha3', undefined);
        vm.userData.competitionCountryCode = countryCode;

        var isValidCountry = _.isUndefined(countryCode) ? false : true;
        vm.editProfile.location.$setValidity('required', isValidCountry);
    }

    function onFileChange(file) {
      ImageService.getPresignedUrl(userHandle, file)
      .then(ImageService.uploadFileToS3)
      .then(ImageService.createFileRecord)
    }

    function updateProfile() {
      vm.profileFormProcessing = true;
      vm.userData.tracks = _.reduce(vm.tracks, function(result, isInterested, trackName) {
        if (isInterested) {
          result.push(trackName);
        }
        return result;
      }, []);

      ProfileService.updateUserProfile(vm.userData)
      .then(function() {
        vm.profileFormProcessing = false;
        $log.info('Saved successfully');
      })
      .catch(function(err) {
        vm.profileFormProcessing = false;
        $log.error(err);
      });
    }

    function toggleTrack(track) {
      vm.tracks[track] = !vm.tracks[track];
    }

    function processData(userInfo) {
      vm.tracks = {
        DESIGN: _.contains(userData.tracks, 'DESIGN'),
        DEVELOP: _.contains(userData.tracks, 'DEVELOP'),
        DATA_SCIENCE: _.contains(userData.tracks, 'DATA_SCIENCE'),
      };
    }
  }
})();
