/**
 * Created by Haiyun on 2/8/2016.
 */
'use strict';
/*global LokiCordovaFSAdapter, Camera, CameraPopoverOptions*/
angular.module('main')
  .service('cameraApi', function ($log, $q, Loki, $cordovaCamera) {

    $log.log('Hello from your Service: cameraApi in module main');

    var vm = this;
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


    var _db;
    var _receipts;

    function initDB () {
      var adapter = new LokiCordovaFSAdapter({'prefix': 'loki' });
      _db = new Loki('receiptsDB',
        {
          autosave: true,
          autosaveInterval: 5000, //1 second
          adapter: adapter
        });
      console.log('receiptsDB created', new Date());
    }

    function getReceiptFromDB ()
    {
      return $q(function (resolve, reject) {

        _db.loadDatabase('{}', function () {
          //retrieve data from notes collection
          _receipts = _db.getCollection('receipts');

          if (!_receipts) {
            //create notes collection
            _receipts = _db.addCollection('receipts');
          }

          resolve(_receipts.data);
        });
      });
    }

    function addReceipt (receipt) {
      _receipts.insert(receipt);
    }

    return {
      initDB: initDB,
      addReceipt: addReceipt
    };

  });

