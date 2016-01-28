'use strict';
angular.module('main')
.controller('BarcodeScannerCtrl', function ($scope, $cordovaBarcodeScanner) {
  document.addEventListen('deviceready', function () {
    var vm = this;
    this.scan = function () {
      $cordovaBarcodeScanner.scan().then(function (imageData) {
        vm.result = imageData;
      }, function (err) {
        alert('Error scanning: ' + err);
      });
    };

    this.lookup = function () {
      window.open('http://www.upcindex.com' + vm.results.text);
    };

    this.reset = function () {
      vm.results = null;
    };
  });
});

