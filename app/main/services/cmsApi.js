'use strict';
/*global LokiCordovaFSAdapter*/
angular.module('main')
  .service('cmsApi', function ($log, $http, $q, $ionicLoading, Loki) {

    $log.log('Hello from your Service: cmsApi in module main');

    var _db;
    var _cmRepository;

    function initDB () {
      var adapter = new LokiCordovaFSAdapter({'prefix': 'loki' });
      _db = new Loki('cmRepositoryDB',
        {
          autosave: true,
          autosaveInterval: 1000, //1 second
          adapter: adapter
        });
      console.log('cmRepositoryDB created', new Date());
    }

    function getCmRepositoryFromDB ()
    {
      return $q(function (resolve, reject) {

        _db.loadDatabase('{}', function () {
          //retrieve data from notes collection
          _cmRepository = _db.getCollection('cmRepository');

          if (!_cmRepository) {
            //create notes collection
            _cmRepository = _db.addCollection('cmRepository');
          }

          //children.insert({name:'Hel', legs: 2})

          //_cmRepository.insert({ text: 'new entry', active: 'yes'});

          resolve(_cmRepository.data);
        });
      });
    }

    function addCategory (category) {
      _cmRepository.insert(category);

    }

    function getCMSRepository ()
    {
      var deferred = $q.defer(),
      //cacheKey = "leagueData-" + getLeagueId(),
        reositoryData = null;

      $ionicLoading.show({
        template: 'Loading...'
      });

      try {
        $http.get('http://cdn.contentful.com/spaces/wiydhpfvx7qb/entries/3NB130JtnWOOoogi6s4w6q?access_token=3e89ff15f153f0bf8a1b97818f32c5883f7f582a8be329fdbefde21ea375aaa7')
          .success(function (data, status) {
            console.log('Received CMS Repository data via HTTP.', data, status);
            //self.leagueDataCache.put(cacheKey, data);
            $ionicLoading.hide();
            deferred.resolve(data);
          })
          .error(function () {
            console.log('Error while making HTTP call.');
            $ionicLoading.hide();
            deferred.reject();
          });

        return deferred.promise;
      }
      catch (e)
      {
        console.log(e);
      }

    }


    return {
      getCMSRepository: getCMSRepository,
      getCMSCategories: getCMSRepository.fields,
      initDB: initDB,
      getCmRepositoryFromDB: getCmRepositoryFromDB,
      addCategory: addCategory
    };

  });

