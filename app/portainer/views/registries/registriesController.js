angular.module('portainer.app')
.controller('RegistriesController', ['$q', '$scope', '$state', 'RegistryService', 'DockerHubService', 'ModalService', 'Notifications', 'ExtensionService',
function ($q, $scope, $state, RegistryService, DockerHubService, ModalService, Notifications, ExtensionService) {

  $scope.state = {
    actionInProgress: false
  };

  $scope.formValues = {
    dockerHubPassword: ''
  };

  $scope.updateDockerHub = function() {
    var dockerhub = $scope.dockerhub;
    dockerhub.Password = $scope.formValues.dockerHubPassword;
    $scope.state.actionInProgress = true;
    DockerHubService.update(dockerhub)
    .then(function success() {
      Notifications.success('DockerHub registry updated');
    })
    .catch(function error(err) {
      Notifications.error('Failure', err, 'Unable to update DockerHub details');
    })
    .finally(function final() {
      $scope.state.actionInProgress = false;
    });
  };

  $scope.removeAction = function(selectedItems) {
    ModalService.confirmDeletion(
      'Do you want to remove the selected registries?',
      function onConfirm(confirmed) {
        if(!confirmed) { return; }
        deleteSelectedRegistries(selectedItems);
      }
    );
  };

  function deleteSelectedRegistries(selectedItems) {
    var actionCount = selectedItems.length;
    angular.forEach(selectedItems, function (registry) {
      RegistryService.deleteRegistry(registry.Id)
      .then(function success() {
        Notifications.success('Registry successfully removed', registry.Name);
        var index = $scope.registries.indexOf(registry);
        $scope.registries.splice(index, 1);
      })
      .catch(function error(err) {
        Notifications.error('Failure', err, 'Unable to remove registry');
      })
      .finally(function final() {
        --actionCount;
        if (actionCount === 0) {
          $state.reload();
        }
      });
    });
  }

  function initView() {
    $q.all({
      registries: RegistryService.registries(),
      dockerhub: DockerHubService.dockerhub(),
      registryManagement: ExtensionService.registryManagementEnabled()
    })
    .then(function success(data) {
      $scope.registries = data.registries;
      $scope.dockerhub = data.dockerhub;
      $scope.registryManagementAvailable = data.registryManagement;
    })
    .catch(function error(err) {
      $scope.registries = [];
      Notifications.error('Failure', err, 'Unable to retrieve registries');
    });
  }

  initView();
}]);
