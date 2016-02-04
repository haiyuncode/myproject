'use strict';
angular.module('main')
/*global Camera, cordova, CameraPopoverOptions, CordovaExif, EXIF, ExifRestorer*/
  .controller('CameraCtrl', function ($cordovaCamera, $scope, $cordovaFile, $cordovaFileTransfer) {

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
        //vm.imgSrc = imageUri;
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
          //ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, targetWidth, targetHeight);
          ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, 200, 300);
          vm.longSideMax = longSideMax;
          vm.targetHeight = targetHeight;
          vm.targetWidth = targetWidth;
          var dataUrl = canvas.toDataURL('image/jpeg', 0.5);

          var tempPath = cordova.file.externalRootDirectory + '/Android/data/test.compan.project/cache/';
          var name = vm.getImageName(imageUri);

          //This function get original image's dataurl
          //vm.convertTest(tempPath, name, function (imageDataUrl)
          vm.convertFileToDataURLviaFileReader2(imageUri, function (base64Img)
          {
            var testUrl = dataUrl;
            //Restore image's exif data
            var appliedExif = ExifRestorer.restore(base64Img, testUrl);
            //vm.imgSrc = imageDataUrl;

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
          });


        };

      }, function (err) {
        alert('An error occured: ' + err);
        vm.status = err;
      });
    };


    vm.convertFileToDataURLviaFileReader = function (url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function () {
        var reader  = new FileReader();
        reader.onloadend = function () {
          callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.send();
    };

    vm.stringToArrayBuffer =  function (str) {
      var buf = new ArrayBuffer(str.length);
      var bufView = new Uint8Array(buf);

      for (var i = 0, strLen = str.length; i < strLen; i++ ) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    };

    vm.convertFileToDataURLviaFileReader2 = function (url, callback) {
      var xhr = new XMLHttpRequest();
      //xhr.responseType = 'blob';
      xhr.onload = function () {
        var reader  = new FileReader();
        reader.onloadend = function () {
          var data = vm.stringToArrayBuffer(reader.result);
          callback(data);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.send();
    };


    vm.getImageName = function (url)
    {
      vm.imagenameurl = url;
      var name = url.substr(url.lastIndexOf('/') + 1);
      vm.name = name;
      return name;
    };

    //Name should be changed to get iamge data url later
    vm.convertTest = function (filePath, name, callback)
    {
      vm.pathandname = 'Path ' + filePath + ' name ' + name;
      $cordovaFile.readAsDataURL(filePath, name)
        .then(function (success) {
          callback(success);
        }, function (error) {
          vm.error = error;
        });
    };

    //Version 2
    vm.convertFileToDataURL = function (file)
    {

      vm.file = file;
      try {
        var reader = new FileReader();

        vm.filereader = reader;

        reader.readAsDataURL(file);

        vm.reader = 'read the file now';

        reader.onload = function (event) {
          $scope.$apply();
          vm.onload = 'convert onload';
          vm.result = event.target.result;
          //var blob = vm.dataURItoBlob(event.target.result); // create blob...new version
          //window.URL = window.URL || window.webkitURL;
          //var blobURL = window.URL.createObjectURL(blob); // and get it's URL
          //vm.msg = blobURL;
        };
      }
      catch (e)
      {
        vm.error = e;
      }
    };

    vm.dataURItoBlob = function (dataURI)
    {
      var binary = atob(dataURI.split(',')[1]);
      var array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
    };

    vm.blobToFile = function (theBlob, fileName) {
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      theBlob.lastModifiedDate = new Date();
      theBlob.name = fileName;
      return theBlob;
    };

    vm.displayExif = function () {
      var url = 'main/assets/images/img_origin.jpg';
      //var url = 'main/assets/images/test.jpeg';

      //CordovaExif.readData(url, function (exifObject) {
      //  console.log(exifObject);
      //});
      var img = new Image();
      img.src = url;
      EXIF.getData(img, function () {
        var make = EXIF.getTag(img, 'Make'),
          model = EXIF.getTag(img, 'Model'),
          orientation  = EXIF.getTag(img, 'Orientation'),
          datetime = EXIF.getTag(img, 'DateTime');
        console.log('I was taken by a ' + make + ' ' + model + ' Orientation ' + orientation + ' DateTime' + datetime);
      });
    };

    vm.getOriginalImgDataUrl = function () {
      var imageUrl = 'main/assets/images/DSC_0333.jpg';
      var convertType = 'FileReader';
      var convertFunction = vm.convertFileToDataURLviaFileReader(imageUrl, function (base64Img) {
        vm.originalDataUrl = base64Img;
      });

    };

    vm.createBlob = function ()
    {
      //var url = 'http://localhost:3000/main/assets/images/yo@2x.png';
      var url = 'http://localhost:3000/main/assets/images/DSC_0333.jpg';
      //var url = 'http://localhost:3000/main/assets/images/Logo_Google.png';
      //var myBlob = new Blob(["This is my blob content"], {type : "text/plain"});
      //var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});

      var tempImg = new Image();
      tempImg.src = url;
      tempImg.setAttribute('crossOrigin', 'anonymous');

      //Start compress the Image data url
      tempImg.onload = function () {

        var canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;

        var ctx = canvas.getContext('2d');
        // Take image from top left corner to bottom right corner and draw the image
        // on canvas to completely fill into.
        ctx.drawImage(this, 0, 0, tempImg.width, tempImg.height, 0, 0, 300, 300);

        var dataUrl = canvas.toDataURL('image/jpeg', 1);
        var resizedDataUrl = dataUrl;

        //Need to pass in original image and resized
        var appliedExif = ExifRestorer.restore(vm.originalDataUrl, resizedDataUrl);
        vm.appliedExif = appliedExif;
        vm.compressedImgSrc = dataUrl;

        $scope.$apply();
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

        //saveAs(myBlob, 'test.jpeg');

        //writeFile(path, file, data, replace)
        //var filePath = cordova.file.externalRootDirectory + '/Pictures/';
        //vm.filePath = filePath;
        ////$cordovaFile.writeFile(filePath, "file.txt", "text", true)
        //$cordovaFile.writeFile(filePath, 'test.jpeg', vm.myBlob, true)
        //  .then(function (success) {
        //    vm.status = 'Wrote to a file';
        //  }, function (error) {
        //    // error
        //  });
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
        //targetWidth: 882,
        //targetHeight: 1500
      };

      $cordovaCamera.getPicture(options).then(function (imageUri) {
        // Success! Image data is here
        vm.imgSrc = imageUri;

        try {
          var file = new File(imageUri);
          vm.createfile = 'file object created';
        } catch (e)
        {
          vm.error = e;
        }
        //Test convert file to data url via file reader api
        var filePath = cordova.file.externalRootDirectory + '/Pictures/';
       // vm.convertTest( filePath, vm.getImageName(imageUri));

      }, function (err) {
        alert('An error occured: ' + err);
        vm.error = err;
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
