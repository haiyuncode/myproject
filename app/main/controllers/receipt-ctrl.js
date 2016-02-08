'use strict';
/*global cordova, LokiCordovaFSAdapter */
angular.module('main')
  //.controller('ReceiptCtrl', function ($scope, $cordovaFile) {
  .controller('ReceiptCtrl', function ($scope, $http, $q, cmsApi, Loki) {
    var vm = this;
    vm.cmsRepository = [];

    //vm. = JSON.parse(JSON.stringify([{'text': 'Medical Expense', 'active': 'yes'}, {'text': 'Rental Expenses', 'active': 'yes' }]));

    vm.newEntry = { text: 'new entry 9', active: 'yes'};

    //var filePath = cordova.file.externalRootDirectory + '/Pictures/';
    //vm.filePath = filePath;

    //vm.url = ['main/assets/images/yo@2x.png',
    //          'main/assets/images/test1.png',
    //          'main/assets/images/test2.png'];

    //For mobile
    //vm.url = [filePath + 'test.jpeg',
    //          filePath + 'test2.jpeg',
    //          filePath + 'test3.jpeg'];

    //new db stuff start
    cmsApi.initDB();
    console.log(vm.newEntry.text);
    cmsApi.getCmRepositoryFromDB().then(function (data)
    {
      vm.categories = data;

      try {

        cmsApi.addCategory(vm.newEntry);
        vm.error = 'no error';
      }
      catch (err)
      {
        alert(JSON.stringify(err));
        vm.error = JSON.stringify(err);
      }

    });
    //new db stuff end

    //try {
    //  $http.get('http://cdn.contentful.com/spaces/wiydhpfvx7qb/entries/3NB130JtnWOOoogi6s4w6q?access_token=3e89ff15f153f0bf8a1b97818f32c5883f7f582a8be329fdbefde21ea375aaa7')
    //    .success(function (data, status) {
    //      console.log('Received CMS Repository data via HTTP.', data, status);
    //      //self.leagueDataCache.put(cacheKey, data);
    //      //$ionicLoading.hide();
    //      vm.log = 'Received CMS Repository data via HTTP.';
    //      vm.categories = data.fields.categories;
    //    })
    //    .error(function (e) {
    //      console.log('Error while making HTTP call.');
    //      vm.log1 =  e;
    //      //$ionicLoading.hide();
    //
    //    });
    //
    //  //return deferred.promise;
    //}
    //catch (e)
    //{
    //  console.log(e);
    //  vm.log = e;
    //}


  });

