'use strict';
/*global cordova*/
angular.module('main')
  .controller('ReceiptCtrl', function ($scope, $cordovaFile) {
    var vm = this;

    var filePath = cordova.file.externalRootDirectory + '/Pictures/';
    vm.filePath = filePath;

    //vm.url = ['main/assets/images/yo@2x.png',
    //          'main/assets/images/test1.png',
    //          'main/assets/images/test2.png'];
    vm.url = [filePath + 'test.jpeg',
              filePath + 'test2.jpeg',
              filePath + 'test3.jpeg'];
  });

