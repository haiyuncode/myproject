'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  // TODO: load other modules selected during generation
])
.config(function ($stateProvider, $urlRouterProvider) {

  // ROUTING with ui.router
  $urlRouterProvider.otherwise('/main/list');
  $stateProvider
    // this state is placed in the <ion-nav-view> in the index.html
    .state('main', {
      url: '/main',
      abstract: true,
      templateUrl: 'main/templates/menu.html',
      controller: 'MenuCtrl as menu'
    })
      .state('main.list', {
        url: '/list',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/list.html',
            // controller: '<someCtrl> as ctrl'
          }
        }
      })
      .state('main.listDetail', {
        url: '/list/detail',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/list-detail.html',
            // controller: '<someCtrl> as ctrl'
          }
        }
      })
      .state('main.camera', {
        url: '/camera',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/camera.html',
            controller: 'CameraCtrl as ctrl'
          }
        }
      })
      .state('main.barcode-scanner', {
        url: '/barcodescanner',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/barcode-scanner.html',
            //controller: 'BarcodeScannerCtrl as ctrl'
          }
        }
      })
      .state('main.receipt', {
        url: '/receipt',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/receipt.html',
            controller: 'ReceiptCtrl as ctrl'
          }
        }
      })
      .state('main.database', {
        url: '/database',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/database.html',
            controller: 'DataBaseCtrl as ctrl'
          }
        }
      })
      .state('main.debug', {
        url: '/debug',
        views: {
          'pageContent': {
            templateUrl: 'main/templates/debug.html',
            controller: 'DebugCtrl as ctrl'
          }
        }
      });
});
