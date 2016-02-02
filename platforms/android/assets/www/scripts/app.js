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

'use strict';
angular.module('main')
.service('Main', function ($log, $timeout) {

  $log.log('Hello from your Service: Main in module main');

  // some initial data
  this.someData = {
    binding: 'Yes! Got that databinding working'
  };

  this.changeBriefly = function () {
    var initialValue = this.someData.binding;
    this.someData.binding = 'Yeah this was changed';

    var that = this;
    $timeout(function () {
      that.someData.binding = initialValue;
    }, 500);
  };

});

'use strict';
angular.module('main')
.directive('imageonload', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.bind('load', function () {
        scope.$apply(attrs.imageonload);
      });
    }
  };

});


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


'use strict';
angular.module('main')
.controller('MenuCtrl', function ($log) {

  $log.log('Hello from your Controller: MenuCtrl in module main:. This is your controller:', this);

});

'use strict';
angular.module('main')
.controller('DebugCtrl', function ($log, Main, Config, $cordovaDevice) {

  $log.log('Hello from your Controller: DebugCtrl in module main:. This is your controller:', this);

  // bind data from services
  this.someData = Main.someData;
  this.ENV = Config.ENV;
  this.BUILD = Config.BUILD;
  // get device info
  ionic.Platform.ready(function () {
    if (ionic.Platform.isWebView()) {
      this.device = $cordovaDevice.getDevice();
    }
  }.bind(this));

  // PASSWORD EXAMPLE
  this.password = {
    input: '', // by user
    strength: ''
  };
  this.grade = function () {
    var size = this.password.input.length;
    if (size > 8) {
      this.password.strength = 'strong';
    } else if (size > 3) {
      this.password.strength = 'medium';
    } else {
      this.password.strength = 'weak';
    }
  };
  this.grade();

});

'use strict';
angular.module('main')
  .controller('DataBaseCtrl', function ($scope, $cordovaSQLite) {
    var vm = this;
    vm.progress0 = 'before open db';
    var db = $cordovaSQLite.openDB( { name: 'my.db' });
    vm.progress = 'db is opened';

    vm.createTable = function () {
      vm.createresult1 = 'before create my.db';
      var query = 'CREATE TABLE IF NOT EXISTS Expense (id integer primary key, url text) VALUES(? , ?)';
      $cordovaSQLite.execute(db, query);
      vm.createresult = 'my.db created';
    };

    vm.insert = function () {
      vm.createresult2 = 'before insert my.db';
      var query = 'INSERT INTO Expense (id, url) VALUES (? , ?)';
      $cordovaSQLite.execute(db, query, [1, 'testurl']).then(function (res) {
        console.log('INSERT ID =>' + res.insertId);
        vm.insertresult = 'INSERT ID =>' + res.insertId;
      }, function (err) {
        console.error(err);
        vm.inserterror = err;
      });
    };

    vm.select = function () {
      vm.selectresult = 'before select my.db';
      var query = 'SELECT url FROM Expense';
      $cordovaSQLite.execute(db, query).then(function (res) {
        if (res.rows.length > 0)
        {
          console.log('SELECTED ->' + res.rows.item(0).url);
          vm.selectresult = 'SELECTED' + res.rows.item(0).url;
        }else {
          vm.createresult3 = 'No results found';
          console.log('No results found');
        }
      }, function (err) {
        vm.selectresult = err;
        console.error(err);
      });
    };

    vm.delete = function () {
      $cordovaSQLite.deleteDB('my.db');
      vm.deleteresult = 'my.db deleted';
    };
  });



'use strict';
angular.module('main')
/*global Camera, cordova, CameraPopoverOptions*/
.controller('CameraCtrl', function ($cordovaCamera, $scope, $cordovaFile, $cordovaFileTransfer) {

  //document.addEventListener('deviceready', function () {var vm = this;
  var vm = this;
  vm.takePicture = function () {
    var options = {
      quality: 40,
        //destinationType : Camera.DestinationType.DATA_URL,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      //targetWidth: 800,
      //targetHeight: 1000,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: true,
      correctOrientation: true
    };

        //$cordovaCamera.getPicture(options).then(function (imageData) {
    $cordovaCamera.getPicture(options).then(function (imageUri) {


      // Now start image manipulation
      vm.imgSrc = imageUri;
      var tempImg = new Image();
      tempImg.src = imageUri;
      tempImg.onload = function () {
        $scope.$apply();

        // // Get image size and aspect ratio.
        var targetWidth = tempImg.width;
        var targetHeight = tempImg.height;
        var aspect = tempImg.width / tempImg.height;
        vm.aspect = aspect;
        vm.originalWidth = targetWidth;
        vm.originalHeight = targetHeight;


       //Calculate shorter side length, keeping aspect ratio on image.
      //If source image size is less than given longSideMax, then it need to be
      //considered instead.
        var longSideMax = 300;
        if (tempImg.width > tempImg.height) {
          longSideMax = Math.min(tempImg.width, longSideMax);
          targetWidth = longSideMax;
          targetHeight = longSideMax / aspect;
        }
        else {
          longSideMax = Math.min(tempImg.height, longSideMax);
          targetHeight = longSideMax;
          targetWidth = longSideMax * aspect;
        }

        var canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        var ctx = canvas.getContext('2d');
        // Take image from top left corner to bottom right corner and draw the image
        // on canvas to completely fill into.
        ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, targetWidth, targetHeight);
        vm.longSideMax = longSideMax;
        vm.targetHeight = targetHeight;
        vm.targetWidth = targetWidth;
        var dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        vm.newImgSource = dataUrl;

        try {

          var byteString;
          if (dataUrl.split(',')[0].indexOf('base64') >= 0)
          {
            byteString = atob(dataUrl.split(',')[1]);
          }
          else {
            byteString = unescape(dataUrl.split(',')[1]);
          }

          var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

          // write the bytes of the string to a typed array
          var ia = new Uint8Array(byteString.length);
          for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }

          var myBlob = new Blob([ia], { type: mimeString});
          vm.myBlob = myBlob;

          var myFile = vm.blobToFile(vm.myBlob, 'test.jpeg');
          vm.myFile = myFile;


          // WRITE
           //writeFile(path, file, data, replace)
          var filePath = cordova.file.externalRootDirectory + '/Pictures/';
          vm.filePath = filePath;
          //$cordovaFile.writeFile(filePath, "file.txt", "text", true)
          $cordovaFile.writeFile(filePath, 'test.jpeg', vm.myBlob, true)
          .then(function (success) {
            vm.status = 'Wrote to a file';
          }, function (error) {
            // error
          });

        }
        catch (e)
        {
          //console.log(e);
          vm.error = 'error';
        }
      };

    }, function (err) {
      alert('An error occured: ' + err);
      vm.status = 'error';
    });
  };

  vm.blobToFile = function (theBlob, fileName) {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  };

  vm.createBlob = function ()
  {
    var url = 'http://localhost:3000/main/assets/images/yo@2x.png';
    //var myBlob = new Blob(["This is my blob content"], {type : "text/plain"});
    //var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});

    var tempImg = new Image();
    tempImg.src = url;
    tempImg.setAttribute('crossOrigin', 'anonymous');

    tempImg.onload = function () {
      $scope.$apply();
      var canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;

      var ctx = canvas.getContext('2d');
      // Take image from top left corner to bottom right corner and draw the image
      // on canvas to completely fill into.
      ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, 300, 300);

      var dataUrl = canvas.toDataURL('image/jpeg', 1);
      //vm.dataUrl = dataUrl;

      var byteString;
      if (dataUrl.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataUrl.split(',')[1]);
      }
      else {
        byteString = unescape(dataUrl.split(',')[1]);
      }

      var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      var myBlob = new Blob([ia], {type: mimeString});
      vm.myBlob = myBlob;

      var myFile = vm.blobToFile(vm.myBlob, 'test.jpeg');
      vm.myFile = myFile;

      //saveAs(myBlob, "test.jpeg");
      //writeFile(path, file, data, replace)
      var filePath = cordova.file.externalRootDirectory + '/Pictures/';
      vm.filePath = filePath;
      //$cordovaFile.writeFile(filePath, "file.txt", "text", true)
      $cordovaFile.writeFile(filePath, 'test.jpeg', vm.myBlob, true)
        .then(function (success) {
          vm.status = 'Wrote to a file';
        }, function (error) {
          // error
        });
    };


      //var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
      //var myFile = blobToFile(blob, "test.txt");

       //saveAs(blob, "hello world.txt");
  };

  vm.selectPicture = function () {
    var options = {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
       // allowEdit: true,
      targetWidth: 882,
      targetHeight: 1500
    };

    $cordovaCamera.getPicture(options).then(function (imageUri) {
        // Success! Image data is here
      vm.imgSrc = imageUri;
      vm.status = 'select picture succeed';
    }, function (err) {
      alert('An error occured: ' + err);
      vm.status = 'select picture failed';
    });
  };

  vm.resizeImage = function (longSideMax, url, callback) {
    vm.imageUrl = url;
    var tempImg = new Image();
    tempImg.src = url;

    tempImg.onload = function () {
      vm.progress = 'caled the Image onload function';
    // Get image size and aspect ratio.
      var targetWidth = tempImg.width;
      var targetHeight = tempImg.height;
      var aspect = tempImg.width / tempImg.height;

      // Calculate shorter side length, keeping aspect ratio on image.
      // If source image size is less than given longSideMax, then it need to be
      // considered instead.
      if (tempImg.width > tempImg.height) {
        longSideMax = Math.min(tempImg.width, longSideMax);
        targetWidth = longSideMax;
        targetHeight = longSideMax / aspect;
      }
      else {
        longSideMax = Math.min(tempImg.height, longSideMax);
        targetHeight = longSideMax;
        targetWidth = longSideMax * aspect;
      }

    // Create canvas of required size.
      var canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      var ctx = canvas.getContext('2d');
      // Take image from top left corner to bottom right corner and draw the image
      // on canvas to completely fill into.
      ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, targetWidth, targetHeight);
      vm.longSideMax = longSideMax;
      vm.targetHeight = targetHeight;
      vm.targetWidth = targetWidth;
      callback(canvas.toDataURL('image/jpeg'));
    };

  };


 // });
});

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



'use strict';
angular.module('Test', [
  // load your modules here
  'main', // starting with the main module
]);
