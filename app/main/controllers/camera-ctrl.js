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
