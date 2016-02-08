'use strict';
angular.module('main', [
  'ionic',
  'ngCordova',
  'ui.router',
  'lokijs'
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


/**
 * LokiJS
 * @author Joe Minichino <joe.minichino@gmail.com>
 *
 * A lightweight document oriented javascript database
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser globals
    root.loki = factory();
  }
}(this, function () {

  return (function () {
    'use strict';

    var Utils = {
      copyProperties: function (src, dest) {
        var prop;
        for (prop in src) {
          dest[prop] = src[prop];
        }
      },
      // used to recursively scan hierarchical transform step object for param substitution
      resolveTransformObject: function (subObj, params, depth) {
        var prop,
          pname;

        if (typeof depth !== 'number') {
          depth = 0;
        }

        if (++depth >= 10) return subObj;

        for (prop in subObj) {
          if (typeof subObj[prop] === 'string' && subObj[prop].indexOf("[%lktxp]") === 0) {
            pname = subObj[prop].substring(8);
            if (params.hasOwnProperty(pname)) {
              subObj[prop] = params[pname];
            }
          } else if (typeof subObj[prop] === "object") {
            subObj[prop] = Utils.resolveTransformObject(subObj[prop], params, depth);
          }
        }

        return subObj;
      },
      // top level utility to resolve an entire (single) transform (array of steps) for parameter substitution
      resolveTransformParams: function (transform, params) {
        var idx,
          prop,
          clonedStep,
          resolvedTransform = [];

        if (typeof params === 'undefined') return transform;

        // iterate all steps in the transform array
        for (idx = 0; idx < transform.length; idx++) {
          // clone transform so our scan and replace can operate directly on cloned transform
          clonedStep = JSON.parse(JSON.stringify(transform[idx]));
          resolvedTransform.push(Utils.resolveTransformObject(clonedStep, params));
        }

        return resolvedTransform;
      }
    };

    // Sort helper that support null and undefined
    function ltHelper(prop1, prop2, equal) {
      if (prop1 === undefined || prop1 === null || prop1 === false || prop2 === true) {
        return true;
      }
      if (prop2 === undefined || prop2 === null || prop1 === true || prop2 === false) {
        return false;
      }

      if (prop1 < prop2) {
        return true;
      }

      if (prop1 > prop2) {
        return false;
      }

      // not lt and and not gt so equality assumed-- this ordering of tests is date compatible
      if (equal) {
        return true;
      } else {
        return false;
      }

    }

    function gtHelper(prop1, prop2, equal) {
      if (prop1 === undefined || prop1 === null || prop1 === false || prop2 === true) {
        return false;
      }
      if (prop2 === undefined || prop2 === null || prop1 === true || prop2 === false) {
        return true;
      }

      if (prop1 > prop2) {
        return true;
      }

      if (prop1 < prop2) {
        return false;
      }

      // not lt and and not gt so equality assumed-- this ordering of tests is date compatible
      if (equal) {
        return true;
      } else {
        return false;
      }

    }

    function sortHelper(prop1, prop2, desc) {
      if (ltHelper(prop1, prop2)) {
        if (desc) {
          return 1;
        }
        else {
          return -1;
        }
      }

      if (gtHelper(prop1, prop2)) {
        if (desc) {
          return -1;
        }
        else {
          return 1;
        }
      }

      // not lt, not gt so implied equality-- date compatible
      return 0;
    }

    function containsCheckFn(a, b) {
      if (Array.isArray(a)) {
        return function (curr) {
          return a.indexOf(curr) !== -1;
        };
      } else if (a && typeof a === 'string') {
        return function (curr) {
          return a.indexOf(curr) !== -1;
        };
      } else if (a && typeof a === 'object') {
        return function (curr) {
          return a.hasOwnProperty(curr);
        };
      }
    }

    var LokiOps = {
      // comparison operators
      // a is the value in the collection
      // b is the query value
      $eq: function (a, b) {
        return a === b;
      },

      $dteq: function(a, b) {
        if (ltHelper(a, b)) {
          return false;
        }

        if (gtHelper(a,b)) {
          return false;
        }

        return true;
      },

      $gt: function (a, b) {
        return gtHelper(a, b);
      },

      $gte: function (a, b) {
        return gtHelper(a, b, true);
      },

      $lt: function (a, b) {
        return ltHelper(a, b);
      },

      $lte: function (a, b) {
        return ltHelper(a, b, true);
      },

      $ne: function (a, b) {
        return a !== b;
      },

      $regex: function (a, b) {
        return b.test(a);
      },

      $in: function (a, b) {
        return b.indexOf(a) > -1;
      },

      $nin: function (a, b) {
        return b.indexOf(a) == -1;
      },

      $containsNone: function (a, b) {
        return !LokiOps.$containsAny(a, b);
      },

      $containsAny: function (a, b) {
        var checkFn;

        if (!Array.isArray(b)) {
          b = [b];
        }

        checkFn = containsCheckFn(a, b) || function () {
          return false;
        };

        return b.reduce(function (prev, curr) {
          if (prev) {
            return prev;
          }

          return checkFn(curr);
        }, false);
      },

      $contains: function (a, b) {
        var checkFn;

        if (!Array.isArray(b)) {
          b = [b];
        }

        // return false on check if no check fn is found
        checkFn = containsCheckFn(a, b) || function () {
          return false;
        };

        return b.reduce(function (prev, curr) {
          if (!prev) {
            return prev;
          }

          return checkFn(curr);
        }, true);
      }
    };

    var operators = {
      '$eq': LokiOps.$eq,
      '$dteq': LokiOps.$dteq,
      '$gt': LokiOps.$gt,
      '$gte': LokiOps.$gte,
      '$lt': LokiOps.$lt,
      '$lte': LokiOps.$lte,
      '$ne': LokiOps.$ne,
      '$regex': LokiOps.$regex,
      '$in': LokiOps.$in,
      '$nin': LokiOps.$nin,
      '$contains': LokiOps.$contains,
      '$containsAny': LokiOps.$containsAny,
      '$containsNone': LokiOps.$containsNone
    };

    // making indexing opt-in... our range function knows how to deal with these ops :
    var indexedOpsList = ['$eq', '$dteq', '$gt', '$gte', '$lt', '$lte'];

    function clone(data, method) {
      var cloneMethod = method || 'parse-stringify',
        cloned;

      switch (cloneMethod) {
        case "parse-stringify":
          cloned = JSON.parse(JSON.stringify(data));
          break;
        case "jquery-extend-deep":
          cloned = jQuery.extend(true, {}, data);
          break;
        case "shallow":
          cloned = Object.create(data.prototype || null);
          Object.keys(data).map(function (i) {
            cloned[i] = data[i];
          });
          break;
        default:
          break;
      }

      //if (cloneMethod === 'parse-stringify') {
      //  cloned = JSON.parse(JSON.stringify(data));
      //}
      return cloned;
    }

    function cloneObjectArray(objarray, method) {
      var i,
        result = [];

      if (method == "parse-stringify") {
        return clone(objarray, method);
      }

      i = objarray.length-1;

      for(;i<=0;i--) {
        result.push(clone(objarray[i], method));
      }

      return result;
    }

    function localStorageAvailable() {
      try {
        return ('localStorage' in window && window.localStorage !== null);
      } catch (e) {
        return false;
      }
    }


    /**
     * LokiEventEmitter is a minimalist version of EventEmitter. It enables any
     * constructor that inherits EventEmitter to emit events and trigger
     * listeners that have been added to the event through the on(event, callback) method
     *
     * @constructor
     */
    function LokiEventEmitter() {}

    /**
     * @prop Events property is a hashmap, with each property being an array of callbacks
     */
    LokiEventEmitter.prototype.events = {};

    /**
     * @prop asyncListeners - boolean determines whether or not the callbacks associated with each event
     * should happen in an async fashion or not
     * Default is false, which means events are synchronous
     */
    LokiEventEmitter.prototype.asyncListeners = false;

    /**
     * @prop on(eventName, listener) - adds a listener to the queue of callbacks associated to an event
     * @returns {int} the index of the callback in the array of listeners for a particular event
     */
    LokiEventEmitter.prototype.on = function (eventName, listener) {
      var event = this.events[eventName];
      if (!event) {
        event = this.events[eventName] = [];
      }
      event.push(listener);
      return listener;
    };

    /**
     * @propt emit(eventName, data) - emits a particular event
     * with the option of passing optional parameters which are going to be processed by the callback
     * provided signatures match (i.e. if passing emit(event, arg0, arg1) the listener should take two parameters)
     * @param {string} eventName - the name of the event
     * @param {object} data - optional object passed with the event
     */
    LokiEventEmitter.prototype.emit = function (eventName, data) {
      var self = this;
      if (eventName && this.events[eventName]) {
        this.events[eventName].forEach(function (listener) {
          if (self.asyncListeners) {
            setTimeout(function () {
              listener(data);
            }, 1);
          } else {
            listener(data);
          }

        });
      } else {
        throw new Error('No event ' + eventName + ' defined');
      }
    };

    /**
     * @prop remove() - removes the listener at position 'index' from the event 'eventName'
     */
    LokiEventEmitter.prototype.removeListener = function (eventName, listener) {
      if (this.events[eventName]) {
        var listeners = this.events[eventName];
        listeners.splice(listeners.indexOf(listener), 1);
      }
    };

    /**
     * Loki: The main database class
     * @constructor
     * @param {string} filename - name of the file to be saved to
     * @param {object} options - config object
     */
    function Loki(filename, options) {
      this.filename = filename || 'loki.db';
      this.collections = [];

      // persist version of code which created the database to the database.
      // could use for upgrade scenarios
      this.databaseVersion = 1.1;
      this.engineVersion = 1.1;

      // autosave support (disabled by default)
      // pass autosave: true, autosaveInterval: 6000 in options to set 6 second autosave
      this.autosave = false;
      this.autosaveInterval = 5000;
      this.autosaveHandle = null;

      this.options = {};

      // currently keeping persistenceMethod and persistenceAdapter as loki level properties that
      // will not or cannot be deserialized.  You are required to configure persistence every time
      // you instantiate a loki object (or use default environment detection) in order to load the database anyways.

      // persistenceMethod could be 'fs', 'localStorage', or 'adapter'
      // this is optional option param, otherwise environment detection will be used
      // if user passes their own adapter we will force this method to 'adapter' later, so no need to pass method option.
      this.persistenceMethod = null;

      // retain reference to optional (non-serializable) persistenceAdapter 'instance'
      this.persistenceAdapter = null;

      // enable console output if verbose flag is set (disabled by default)
      this.verbose = options && options.hasOwnProperty('verbose') ? options.verbose : false;

      this.events = {
        'init': [],
        'loaded': [],
        'flushChanges': [],
        'close': [],
        'changes': [],
        'warning': []
      };

      var getENV = function () {
        if (typeof window === 'undefined') {
          return 'NODEJS';
        }

        if (typeof global !== 'undefined' && global.window) {
          return 'NODEJS'; //node-webkit
        }

        if (typeof document !== 'undefined') {
          if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
            return 'CORDOVA';
          }
          return 'BROWSER';
        }
        return 'CORDOVA';
      };

      // refactored environment detection due to invalid detection for browser environments.
      // if they do not specify an options.env we want to detect env rather than default to nodejs.
      // currently keeping two properties for similar thing (options.env and options.persistenceMethod)
      //   might want to review whether we can consolidate.
      if (options && options.hasOwnProperty('env')) {
        this.ENV = options.env;
      } else {
        this.ENV = getENV();
      }

      // not sure if this is necessary now that i have refactored the line above
      if (this.ENV === 'undefined') {
        this.ENV = 'NODEJS';
      }

      //if (typeof (options) !== 'undefined') {
      this.configureOptions(options, true);
      //}

      this.on('init', this.clearChanges);

    }

    // db class is an EventEmitter
    Loki.prototype = new LokiEventEmitter();

    // experimental support for browserify's abstract syntax scan to pick up dependency of indexed adapter.
    // Hopefully, once this hits npm a browserify require of lokijs should scan the main file and detect this indexed adapter reference.
    Loki.prototype.getIndexedAdapter = function () {
      var adapter;

      if (typeof require === 'function') {
        adapter = require("./loki-indexed-adapter.js");
      }

      return adapter;
    };


    /**
     * configureOptions - allows reconfiguring database options
     *
     * @param {object} options - configuration options to apply to loki db object
     * @param {boolean} initialConfig - (optional) if this is a reconfig, don't pass this
     */
    Loki.prototype.configureOptions = function (options, initialConfig) {
      var defaultPersistence = {
          'NODEJS': 'fs',
          'BROWSER': 'localStorage',
          'CORDOVA': 'localStorage'
        },
        persistenceMethods = {
          'fs': LokiFsAdapter,
          'localStorage': LokiLocalStorageAdapter
        };

      this.options = {};

      this.persistenceMethod = null;
      // retain reference to optional persistence adapter 'instance'
      // currently keeping outside options because it can't be serialized
      this.persistenceAdapter = null;

      // process the options
      if (typeof (options) !== 'undefined') {
        this.options = options;


        if (this.options.hasOwnProperty('persistenceMethod')) {
          // check if the specified persistence method is known
          if (typeof (persistenceMethods[options.persistenceMethod]) == 'function') {
            this.persistenceMethod = options.persistenceMethod;
            this.persistenceAdapter = new persistenceMethods[options.persistenceMethod]();
          }
          // should be throw an error here, or just fall back to defaults ??
        }

        // if user passes adapter, set persistence mode to adapter and retain persistence adapter instance
        if (this.options.hasOwnProperty('adapter')) {
          this.persistenceMethod = 'adapter';
          this.persistenceAdapter = options.adapter;
          this.options.adapter = null;
        }


        // if they want to load database on loki instantiation, now is a good time to load... after adapter set and before possible autosave initiation
        if (options.autoload && initialConfig) {
          // for autoload, let the constructor complete before firing callback
          var self = this;
          setTimeout(function () {
            self.loadDatabase(options, options.autoloadCallback);
          }, 1);
        }

        if (this.options.hasOwnProperty('autosaveInterval')) {
          this.autosaveDisable();
          this.autosaveInterval = parseInt(this.options.autosaveInterval, 10);
        }

        if (this.options.hasOwnProperty('autosave') && this.options.autosave) {
          this.autosaveDisable();
          this.autosave = true;

          if (this.options.hasOwnProperty('autosaveCallback')) {
            this.autosaveEnable(options, options.autosaveCallback);
          } else {
            this.autosaveEnable();
          }
        }
      } // end of options processing

      // if by now there is no adapter specified by user nor derived from persistenceMethod: use sensible defaults
      if (this.persistenceAdapter === null) {
        this.persistenceMethod = defaultPersistence[this.ENV];
        if (this.persistenceMethod) {
          this.persistenceAdapter = new persistenceMethods[this.persistenceMethod]();
        }
      }

    };

    /**
     * anonym() - shorthand method for quickly creating and populating an anonymous collection.
     *    This collection is not referenced internally so upon losing scope it will be garbage collected.
     *
     *    Example : var results = new loki().anonym(myDocArray).find({'age': {'$gt': 30} });
     *
     * @param {Array} docs - document array to initialize the anonymous collection with
     * @param {Array} indexesArray - (Optional) array of property names to index
     * @returns {Collection} New collection which you can query or chain
     */
    Loki.prototype.anonym = function (docs, indexesArray) {
      var collection = new Collection('anonym', indexesArray);
      collection.insert(docs);

      if(this.verbose)
        collection.console = console;

      return collection;
    };

    Loki.prototype.addCollection = function (name, options) {
      var collection = new Collection(name, options);
      this.collections.push(collection);

      if(this.verbose)
        collection.console = console;

      return collection;
    };

    Loki.prototype.loadCollection = function (collection) {
      if (!collection.name) {
        throw new Error('Collection must have a name property to be loaded');
      }
      this.collections.push(collection);
    };

    Loki.prototype.getCollection = function (collectionName) {
      var i,
        len = this.collections.length;

      for (i = 0; i < len; i += 1) {
        if (this.collections[i].name === collectionName) {
          return this.collections[i];
        }
      }

      // no such collection
      this.emit('warning', 'collection ' + collectionName + ' not found');
      return null;
    };

    Loki.prototype.listCollections = function () {

      var i = this.collections.length,
        colls = [];

      while (i--) {
        colls.push({
          name: this.collections[i].name,
          type: this.collections[i].objType,
          count: this.collections[i].data.length
        });
      }
      return colls;
    };

    Loki.prototype.removeCollection = function (collectionName) {
      var i,
        len = this.collections.length;

      for (i = 0; i < len; i += 1) {
        if (this.collections[i].name === collectionName) {
          this.collections.splice(i, 1);
          return;
        }
      }
    };

    Loki.prototype.getName = function () {
      return this.name;
    };

    /**
     * serializeReplacer - used to prevent certain properties from being serialized
     *
     */
    Loki.prototype.serializeReplacer = function (key, value) {
      switch (key) {
      case 'autosaveHandle':
      case 'persistenceAdapter':
      case 'constraints':
        return null;
      default:
        return value;
      }
    };

    // toJson
    Loki.prototype.serialize = function () {
      return JSON.stringify(this, this.serializeReplacer);
    };
    // alias of serialize
    Loki.prototype.toJson = Loki.prototype.serialize;

    /**
     * loadJSON - inflates a loki database from a serialized JSON string
     *
     * @param {string} serializedDb - a serialized loki database string
     * @param {object} options - apply or override collection level settings
     */
    Loki.prototype.loadJSON = function (serializedDb, options) {

      if (serializedDb.length === 0) serializedDb = JSON.stringify({});
      var obj = JSON.parse(serializedDb),
        i = 0,
        len = obj.collections ? obj.collections.length : 0,
        coll,
        copyColl,
        clen,
        j;

      this.name = obj.name;

      // restore database version
      this.databaseVersion = 1.0;
      if (obj.hasOwnProperty('databaseVersion')) {
        this.databaseVersion = obj.databaseVersion;
      }

      this.collections = [];

      for (i; i < len; i += 1) {
        coll = obj.collections[i];
        copyColl = this.addCollection(coll.name);

        copyColl.transactional = coll.transactional;
        copyColl.asyncListeners = coll.asyncListeners;
        copyColl.disableChangesApi = coll.disableChangesApi;
        copyColl.cloneObjects = coll.cloneObjects;
        copyColl.cloneMethod = coll.cloneMethod || "parse-stringify";
        copyColl.autoupdate = coll.autoupdate;

        // load each element individually
        clen = coll.data.length;
        j = 0;
        if (options && options.hasOwnProperty(coll.name)) {

          var loader = options[coll.name].inflate ? options[coll.name].inflate : Utils.copyProperties;

          for (j; j < clen; j++) {
            var collObj = new(options[coll.name].proto)();
            loader(coll.data[j], collObj);
            copyColl.data[j] = collObj;
            copyColl.addAutoUpdateObserver(collObj);
          }
        } else {

          for (j; j < clen; j++) {
            copyColl.data[j] = coll.data[j];
            copyColl.addAutoUpdateObserver(copyColl.data[j]);
          }
        }

        copyColl.maxId = (coll.data.length === 0) ? 0 : coll.maxId;
        copyColl.idIndex = coll.idIndex;
        if (typeof (coll.binaryIndices) !== 'undefined') {
          copyColl.binaryIndices = coll.binaryIndices;
        }
        if (typeof coll.transforms !== 'undefined') {
          copyColl.transforms = coll.transforms;
        }

        copyColl.ensureId();

        // regenerate unique indexes
        copyColl.uniqueNames = [];
        if (coll.hasOwnProperty("uniqueNames")) {
          copyColl.uniqueNames = coll.uniqueNames;
          for (j = 0; j < copyColl.uniqueNames.length; j++) {
            copyColl.ensureUniqueIndex(copyColl.uniqueNames[j]);
          }
        }

        // in case they are loading a database created before we added dynamic views, handle undefined
        if (typeof (coll.DynamicViews) === 'undefined') continue;

        // reinflate DynamicViews and attached Resultsets
        for (var idx = 0; idx < coll.DynamicViews.length; idx++) {
          var colldv = coll.DynamicViews[idx];

          var dv = copyColl.addDynamicView(colldv.name, colldv.options);
          dv.resultdata = colldv.resultdata;
          dv.resultsdirty = colldv.resultsdirty;
          dv.filterPipeline = colldv.filterPipeline;

          dv.sortCriteria = colldv.sortCriteria;
          dv.sortFunction = null;

          dv.sortDirty = colldv.sortDirty;
          dv.resultset.filteredrows = colldv.resultset.filteredrows;
          dv.resultset.searchIsChained = colldv.resultset.searchIsChained;
          dv.resultset.filterInitialized = colldv.resultset.filterInitialized;

          dv.rematerialize({
            removeWhereFilters: true
          });
        }
      }
    };

    /**
     * close(callback) - emits the close event with an optional callback. Does not actually destroy the db
     * but useful from an API perspective
     */
    Loki.prototype.close = function (callback) {
      // for autosave scenarios, we will let close perform final save (if dirty)
      // For web use, you might call from window.onbeforeunload to shutdown database, saving pending changes
      if (this.autosave) {
        this.autosaveDisable();
        if (this.autosaveDirty()) {
          this.saveDatabase(callback);
          callback = undefined;
        }
      }

      if (callback) {
        this.on('close', callback);
      }
      this.emit('close');
    };

    /**-------------------------+
    | Changes API               |
    +--------------------------*/

    /**
     * The Changes API enables the tracking the changes occurred in the collections since the beginning of the session,
     * so it's possible to create a differential dataset for synchronization purposes (possibly to a remote db)
     */

    /**
     * generateChangesNotification() - takes all the changes stored in each
     * collection and creates a single array for the entire database. If an array of names
     * of collections is passed then only the included collections will be tracked.
     *
     * @param {array} optional array of collection names. No arg means all collections are processed.
     * @returns {array} array of changes
     * @see private method createChange() in Collection
     */
    Loki.prototype.generateChangesNotification = function (arrayOfCollectionNames) {
      function getCollName(coll) {
        return coll.name;
      }
      var changes = [],
        selectedCollections = arrayOfCollectionNames || this.collections.map(getCollName);

      this.collections.forEach(function (coll) {
        if (selectedCollections.indexOf(getCollName(coll)) !== -1) {
          changes = changes.concat(coll.getChanges());
        }
      });
      return changes;
    };

    /**
     * serializeChanges() - stringify changes for network transmission
     * @returns {string} string representation of the changes
     */
    Loki.prototype.serializeChanges = function (collectionNamesArray) {
      return JSON.stringify(this.generateChangesNotification(collectionNamesArray));
    };

    /**
     * clearChanges() - clears all the changes in all collections.
     */
    Loki.prototype.clearChanges = function () {
      this.collections.forEach(function (coll) {
        if (coll.flushChanges) {
          coll.flushChanges();
        }
      });
    };

    /*------------------+
    | PERSISTENCE       |
    -------------------*/


    /** there are two build in persistence adapters for internal use
     * fs             for use in Nodejs type environments
     * localStorage   for use in browser environment
     * defined as helper classes here so its easy and clean to use
     */

    /**
     * constructor for fs
     */
    function LokiFsAdapter() {
      this.fs = require('fs');
    }

    /**
     * loadDatabase() - Load data from file, will throw an error if the file does not exist
     * @param {string} dbname - the filename of the database to load
     * @param {function} callback - the callback to handle the result
     */
    LokiFsAdapter.prototype.loadDatabase = function loadDatabase(dbname, callback) {
      this.fs.readFile(dbname, {
        encoding: 'utf8'
      }, function readFileCallback(err, data) {
        if (err) {
          callback(new Error(err));
        } else {
          callback(data);
        }
      });
    };

    /**
     * saveDatabase() - save data to file, will throw an error if the file can't be saved
     * might want to expand this to avoid dataloss on partial save
     * @param {string} dbname - the filename of the database to load
     * @param {function} callback - the callback to handle the result
     */
    LokiFsAdapter.prototype.saveDatabase = function saveDatabase(dbname, dbstring, callback) {
      this.fs.writeFile(dbname, dbstring, callback);
    };


    /**
     * constructor for local storage
     */
    function LokiLocalStorageAdapter() {}

    /**
     * loadDatabase() - Load data from localstorage
     * @param {string} dbname - the name of the database to load
     * @param {function} callback - the callback to handle the result
     */
    LokiLocalStorageAdapter.prototype.loadDatabase = function loadDatabase(dbname, callback) {
      if (localStorageAvailable()) {
        callback(localStorage.getItem(dbname));
      } else {
        callback(new Error('localStorage is not available'));
      }
    };

    /**
     * saveDatabase() - save data to localstorage, will throw an error if the file can't be saved
     * might want to expand this to avoid dataloss on partial save
     * @param {string} dbname - the filename of the database to load
     * @param {function} callback - the callback to handle the result
     */
    LokiLocalStorageAdapter.prototype.saveDatabase = function saveDatabase(dbname, dbstring, callback) {
      if (localStorageAvailable()) {
        localStorage.setItem(dbname, dbstring);
        callback(null);
      } else {
        callback(new Error('localStorage is not available'));
      }
    };

    /**
     * loadDatabase - Handles loading from file system, local storage, or adapter (indexeddb)
     *    This method utilizes loki configuration options (if provided) to determine which
     *    persistence method to use, or environment detection (if configuration was not provided).
     *
     * @param {object} options - not currently used (remove or allow overrides?)
     * @param {function} callback - (Optional) user supplied async callback / error handler
     */
    Loki.prototype.loadDatabase = function (options, callback) {
      var cFun = callback || function (err, data) {
          if (err) {
            throw err;
          }
          return;
        },
        self = this;

      // the persistenceAdapter should be present if all is ok, but check to be sure.
      if (this.persistenceAdapter !== null) {

        this.persistenceAdapter.loadDatabase(this.filename, function loadDatabaseCallback(dbString) {
          if (typeof (dbString) === 'string') {
            self.loadJSON(dbString, options || {});
            cFun(null);
            self.emit('loaded', 'database ' + self.filename + ' loaded');
          } else {
            if (typeof (dbString) === "object") {
              cFun(dbString);
            } else {
              cFun('Database not found');
            }
          }
        });

      } else {
        cFun(new Error('persistenceAdapter not configured'));
      }
    };

    /**
     * saveDatabase - Handles saving to file system, local storage, or adapter (indexeddb)
     *    This method utilizes loki configuration options (if provided) to determine which
     *    persistence method to use, or environment detection (if configuration was not provided).
     *
     * @param {object} options - not currently used (remove or allow overrides?)
     * @param {function} callback - (Optional) user supplied async callback / error handler
     */
    Loki.prototype.saveDatabase = function (callback) {
      var cFun = callback || function (err) {
          if (err) {
            throw err;
          }
          return;
        },
        self = this;

      // the persistenceAdapter should be present if all is ok, but check to be sure.
      if (this.persistenceAdapter !== null) {
        // check if the adapter is requesting (and supports) a 'reference' mode export
        if (this.persistenceAdapter.mode === "reference" && typeof this.persistenceAdapter.exportDatabase === "function") {
          // filename may seem redundant but loadDatabase will need to expect this same filename
          this.persistenceAdapter.exportDatabase(this.filename, this, function exportDatabaseCallback(err) {
            self.autosaveClearFlags();
            cFun(err);
          });
        }
        // otherwise just pass the serialized database to adapter
        else {
          this.persistenceAdapter.saveDatabase(this.filename, self.serialize(), function saveDatabasecallback(err) {
            self.autosaveClearFlags();
            cFun(err);
          });
        }
      } else {
        cFun(new Error('persistenceAdapter not configured'));
      }
    };

    // alias
    Loki.prototype.save = Loki.prototype.saveDatabase;

    /**
     * autosaveDirty - check whether any collections are 'dirty' meaning we need to save (entire) database
     *
     * @returns {boolean} - true if database has changed since last autosave, false if not.
     */
    Loki.prototype.autosaveDirty = function () {
      for (var idx = 0; idx < this.collections.length; idx++) {
        if (this.collections[idx].dirty) {
          return true;
        }
      }

      return false;
    };

    /**
     * autosaveClearFlags - resets dirty flags on all collections.
     *    Called from saveDatabase() after db is saved.
     *
     */
    Loki.prototype.autosaveClearFlags = function () {
      for (var idx = 0; idx < this.collections.length; idx++) {
        this.collections[idx].dirty = false;
      }
    };

    /**
     * autosaveEnable - begin a javascript interval to periodically save the database.
     *
     * @param {object} options - not currently used (remove or allow overrides?)
     * @param {function} callback - (Optional) user supplied async callback
     */
    Loki.prototype.autosaveEnable = function (options, callback) {
      this.autosave = true;

      var delay = 5000,
        self = this;

      if (typeof (this.autosaveInterval) !== 'undefined' && this.autosaveInterval !== null) {
        delay = this.autosaveInterval;
      }

      this.autosaveHandle = setInterval(function autosaveHandleInterval() {
        // use of dirty flag will need to be hierarchical since mods are done at collection level with no visibility of 'db'
        // so next step will be to implement collection level dirty flags set on insert/update/remove
        // along with loki level isdirty() function which iterates all collections to see if any are dirty

        if (self.autosaveDirty()) {
          self.saveDatabase(callback);
        }
      }, delay);
    };

    /**
     * autosaveDisable - stop the autosave interval timer.
     *
     */
    Loki.prototype.autosaveDisable = function () {
      if (typeof (this.autosaveHandle) !== 'undefined' && this.autosaveHandle !== null) {
        clearInterval(this.autosaveHandle);
        this.autosaveHandle = null;
      }
    };


    /**
     * Resultset class allowing chainable queries.  Intended to be instanced internally.
     *    Collection.find(), Collection.where(), and Collection.chain() instantiate this.
     *
     *    Example:
     *    mycollection.chain()
     *      .find({ 'doors' : 4 })
     *      .where(function(obj) { return obj.name === 'Toyota' })
     *      .data();
     *
     * @constructor
     * @param {Collection} collection - The collection which this Resultset will query against.
     * @param {string} queryObj - Optional mongo-style query object to initialize resultset with.
     * @param {function} queryFunc - Optional javascript filter function to initialize resultset with.
     * @param {bool} firstOnly - Optional boolean used by collection.findOne().
     */
    function Resultset(collection, queryObj, queryFunc, firstOnly) {
      // retain reference to collection we are querying against
      this.collection = collection;

      // if chain() instantiates with null queryObj and queryFunc, so we will keep flag for later
      this.searchIsChained = (!queryObj && !queryFunc);
      this.filteredrows = [];
      this.filterInitialized = false;

      // if user supplied initial queryObj or queryFunc, apply it
      if (typeof (queryObj) !== "undefined" && queryObj !== null) {
        return this.find(queryObj, firstOnly);
      }
      if (typeof (queryFunc) !== "undefined" && queryFunc !== null) {
        return this.where(queryFunc);
      }

      // otherwise return unfiltered Resultset for future filtering
      return this;
    }

    /**
     * toJSON() - Override of toJSON to avoid circular references
     *
     */
    Resultset.prototype.toJSON = function () {
      var copy = this.copy();
      copy.collection = null;
      return copy;
    };

    /**
     * limit() - Allows you to limit the number of documents passed to next chain operation.
     *    A resultset copy() is made to avoid altering original resultset.
     *
     * @param {int} qty - The number of documents to return.
     * @returns {Resultset} Returns a copy of the resultset, limited by qty, for subsequent chain ops.
     */
    Resultset.prototype.limit = function (qty) {
      // if this is chained resultset with no filters applied, we need to populate filteredrows first
      if (this.searchIsChained && !this.filterInitialized && this.filteredrows.length === 0) {
        this.filteredrows = Object.keys(this.collection.data).map(Number);
      }

      var rscopy = this.copy();

      rscopy.filteredrows = rscopy.filteredrows.slice(0, qty);

      return rscopy;
    };

    /**
     * offset() - Used for skipping 'pos' number of documents in the resultset.
     *
     * @param {int} pos - Number of documents to skip; all preceding documents are filtered out.
     * @returns {Resultset} Returns a copy of the resultset, containing docs starting at 'pos' for subsequent chain ops.
     */
    Resultset.prototype.offset = function (pos) {
      // if this is chained resultset with no filters applied, we need to populate filteredrows first
      if (this.searchIsChained && !this.filterInitialized && this.filteredrows.length === 0) {
        this.filteredrows = Object.keys(this.collection.data).map(Number);
      }

      var rscopy = this.copy();

      rscopy.filteredrows = rscopy.filteredrows.splice(pos, rscopy.filteredrows.length);

      return rscopy;
    };

    /**
     * copy() - To support reuse of resultset in branched query situations.
     *
     * @returns {Resultset} Returns a copy of the resultset (set) but the underlying document references will be the same.
     */
    Resultset.prototype.copy = function () {
      var result = new Resultset(this.collection, null, null);

      result.filteredrows = this.filteredrows.slice();
      result.filterInitialized = this.filterInitialized;

      return result;
    };

    // add branch() as alias of copy()
    Resultset.prototype.branch = Resultset.prototype.copy;

    /**
     * transform() - executes a named collection transform or raw array of transform steps against the resultset.
     *
     * @param transform {string|array} : (Optional) name of collection transform or raw transform array
     * @param parameters {object} : (Optional) object property hash of parameters, if the transform requires them.
     * @returns {Resultset} : either (this) resultset or a clone of of this resultset (depending on steps)
     */
    Resultset.prototype.transform = function (transform, parameters) {
      var idx,
        step,
        rs = this;

      // if transform is name, then do lookup first
      if (typeof transform === 'string') {
        if (this.collection.transforms.hasOwnProperty(transform)) {
          transform = this.collection.transforms[transform];
        }
      }

      // either they passed in raw transform array or we looked it up, so process
      if (typeof transform !== 'object' || !Array.isArray(transform)) {
          throw new Error("Invalid transform");
      }

      if (typeof parameters !== 'undefined') {
        transform = Utils.resolveTransformParams(transform, parameters);
      }

      for (idx = 0; idx < transform.length; idx++) {
        step = transform[idx];

        switch (step.type) {
        case "find":
          rs.find(step.value);
          break;
        case "where":
          rs.where(step.value);
          break;
        case "simplesort":
          rs.simplesort(step.property, step.desc);
          break;
        case "compoundsort":
          rs.compoundsort(step.value);
          break;
        case "sort":
          rs.sort(step.value);
          break;
        case "limit":
          rs = rs.limit(step.value);
          break; // limit makes copy so update reference
        case "offset":
          rs = rs.offset(step.value);
          break; // offset makes copy so update reference
        case "map":
          rs = rs.map(step.value);
          break;
        case "eqJoin":
          rs = rs.eqJoin(step.joinData, step.leftJoinKey, step.rightJoinKey, step.mapFun);
          break;
          // following cases break chain by returning array data so make any of these last in transform steps
        case "mapReduce":
          rs = rs.mapReduce(step.mapFunction, step.reduceFunction);
          break;
          // following cases update documents in current filtered resultset (use carefully)
        case "update":
          rs.update(step.value);
          break;
        case "remove":
          rs.remove();
          break;
        default:
          break;
        }
      }

      return rs;
    };

    /**
     * sort() - User supplied compare function is provided two documents to compare. (chainable)
     *    Example:
     *    rslt.sort(function(obj1, obj2) {
     *      if (obj1.name === obj2.name) return 0;
     *      if (obj1.name > obj2.name) return 1;
     *      if (obj1.name < obj2.name) return -1;
     *    });
     *
     * @param {function} comparefun - A javascript compare function used for sorting.
     * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
     */
    Resultset.prototype.sort = function (comparefun) {
      // if this is chained resultset with no filters applied, just we need to populate filteredrows first
      if (this.searchIsChained && !this.filterInitialized && this.filteredrows.length === 0) {
        this.filteredrows = Object.keys(this.collection.data).map(Number);
      }

      var wrappedComparer =
        (function (userComparer, rslt) {
          return function (a, b) {
            var obj1 = rslt.collection.data[a];
            var obj2 = rslt.collection.data[b];

            return userComparer(obj1, obj2);
          };
        })(comparefun, this);

      this.filteredrows.sort(wrappedComparer);

      return this;
    };

    /**
     * simplesort() - Simpler, loose evaluation for user to sort based on a property name. (chainable)
     *
     * @param {string} propname - name of property to sort by.
     * @param {bool} isdesc - (Optional) If true, the property will be sorted in descending order
     * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
     */
    Resultset.prototype.simplesort = function (propname, isdesc) {
      // if this is chained resultset with no filters applied, just we need to populate filteredrows first
      if (this.searchIsChained && !this.filterInitialized && this.filteredrows.length === 0) {
        this.filteredrows = Object.keys(this.collection.data).map(Number);
      }

      if (typeof (isdesc) === 'undefined') {
        isdesc = false;
      }

      var wrappedComparer =
        (function (prop, desc, rslt) {
          return function (a, b) {
            var obj1 = rslt.collection.data[a];
            var obj2 = rslt.collection.data[b];

            return sortHelper(obj1[prop], obj2[prop], desc);

          };
        })(propname, isdesc, this);

      this.filteredrows.sort(wrappedComparer);

      return this;
    };

    /**
     * compoundeval() - helper method for compoundsort(), performing individual object comparisons
     *
     * @param {array} properties - array of property names, in order, by which to evaluate sort order
     * @param {object} obj1 - first object to compare
     * @param {object} obj2 - second object to compare
     * @returns {integer} 0, -1, or 1 to designate if identical (sortwise) or which should be first
     */
    Resultset.prototype.compoundeval = function (properties, obj1, obj2) {
      var propertyCount = properties.length;

      if (propertyCount === 0) {
        throw new Error("Invalid call to compoundeval, need at least one property");
      }

      // decode property, whether just a string property name or subarray [propname, isdesc]
      var isdesc = false;
      var firstProp = properties[0];
      if (typeof (firstProp) !== 'string') {
        if (Array.isArray(firstProp)) {
          isdesc = firstProp[1];
          firstProp = firstProp[0];
        }
      }

      if (obj1[firstProp] === obj2[firstProp]) {
        if (propertyCount === 1) {
          return 0;
        } else {
          return this.compoundeval(properties.slice(1), obj1, obj2, isdesc);
        }
      }

      return sortHelper(obj1[firstProp], obj2[firstProp], isdesc);
    };

    /**
     * compoundsort() - Allows sorting a resultset based on multiple columns.
     *    Example : rs.compoundsort(['age', 'name']); to sort by age and then name (both ascending)
     *    Example : rs.compoundsort(['age', ['name', true]); to sort by age (ascending) and then by name (descending)
     *
     * @param {array} properties - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {Resultset} Reference to this resultset, sorted, for future chain operations.
     */
    Resultset.prototype.compoundsort = function (properties) {

      // if this is chained resultset with no filters applied, just we need to populate filteredrows first
      if (this.searchIsChained && !this.filterInitialized && this.filteredrows.length === 0) {
        this.filteredrows = Object.keys(this.collection.data).map(Number);
      }

      var wrappedComparer =
        (function (props, rslt) {
          return function (a, b) {
            var obj1 = rslt.collection.data[a];
            var obj2 = rslt.collection.data[b];

            return rslt.compoundeval(props, obj1, obj2);
          };
        })(properties, this);

      this.filteredrows.sort(wrappedComparer);

      return this;
    };

    /**
     * calculateRange() - Binary Search utility method to find range/segment of values matching criteria.
     *    this is used for collection.find() and first find filter of resultset/dynview
     *    slightly different than get() binary search in that get() hones in on 1 value,
     *    but we have to hone in on many (range)
     * @param {string} op - operation, such as $eq
     * @param {string} prop - name of property to calculate range for
     * @param {object} val - value to use for range calculation.
     * @returns {array} [start, end] index array positions
     */
    Resultset.prototype.calculateRange = function (op, prop, val) {
      var rcd = this.collection.data;
      var index = this.collection.binaryIndices[prop].values;
      var min = 0;
      var max = index.length - 1;
      var mid = null;
      var lbound = 0;
      var ubound = index.length - 1;

      // when no documents are in collection, return empty range condition
      if (rcd.length === 0) {
        return [0, -1];
      }

      var minVal = rcd[index[min]][prop];
      var maxVal = rcd[index[max]][prop];

      // if value falls outside of our range return [0, -1] to designate no results
      switch (op) {
      case '$eq':
        if (ltHelper(val, minVal) || gtHelper(val, maxVal)) {
          return [0, -1];
        }
        break;
      case '$dteq':
        if (ltHelper(val, minVal) || gtHelper(val, maxVal)) {
          return [0, -1];
        }
        break;
      case '$gt':
        if (gtHelper(val, maxVal, true)) {
          return [0, -1];
        }
        break;
      case '$gte':
        if (gtHelper(val, maxVal)) {
          return [0, -1];
        }
        break;
      case '$lt':
        if (ltHelper(val, minVal, true)) {
          return [0, -1];
        }
        if (ltHelper(maxVal, val)) {
          return [0, rcd.length - 1];
        }
        break;
      case '$lte':
        if (ltHelper(val, minVal)) {
          return [0, -1];
        }
        if (ltHelper(maxVal, val, true)) {
          return [0, rcd.length - 1];
        }
        break;
      }

      // hone in on start position of value
      while (min < max) {
        mid = Math.floor((min + max) / 2);

        if (ltHelper(rcd[index[mid]][prop], val)) {
          min = mid + 1;
        } else {
          max = mid;
        }
      }

      lbound = min;

      min = 0;
      max = index.length - 1;

      // hone in on end position of value
      while (min < max) {
        mid = Math.floor((min + max) / 2);

        if (ltHelper(val, rcd[index[mid]][prop])) {
          max = mid;
        } else {
          min = mid + 1;
        }
      }

      ubound = max;

      var lval = rcd[index[lbound]][prop];
      var uval = rcd[index[ubound]][prop];

      switch (op) {
      case '$eq':
        if (lval !== val) {
          return [0, -1];
        }
        if (uval !== val) {
          ubound--;
        }

        return [lbound, ubound];
      case '$dteq':
        if (lval > val || lval < val) {
          return [0, -1];
        }
        if (uval > val || uval < val) {
          ubound--;
        }

        return [lbound, ubound];


      case '$gt':
        if (ltHelper(uval, val, true)) {
          return [0, -1];
        }

        return [ubound, rcd.length - 1];

      case '$gte':
        if (ltHelper(lval, val)) {
          return [0, -1];
        }

        return [lbound, rcd.length - 1];

      case '$lt':
        if (lbound === 0 && ltHelper(lval, val)) {
          return [0, 0];
        }
        return [0, lbound - 1];

      case '$lte':
        if (uval !== val) {
          ubound--;
        }

        if (ubound === 0 && ltHelper(uval, val)) {
          return [0, 0];
        }
        return [0, ubound];

      default:
        return [0, rcd.length - 1];
      }
    };

    /**
     * findOr() - oversee the operation of OR'ed query expressions.
     *    OR'ed expression evaluation runs each expression individually against the full collection,
     *    and finally does a set OR on each expression's results.
     *    Each evaluation can utilize a binary index to prevent multiple linear array scans.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {Resultset} this resultset for further chain ops.
     */
    Resultset.prototype.findOr = function (expressionArray) {
      var fri = 0,
        ei = 0,
        fr = null,
        docset = [],
        expResultset = null;

      // if filter is already initialized we need to query against only those items already in filter.
      // This means no index utilization for fields, so hopefully its filtered to a smallish filteredrows.
      if (this.filterInitialized) {
        docset = [];

        for (ei = 0; ei < expressionArray.length; ei++) {
          // we need to branch existing query to run each filter separately and combine results
          expResultset = this.branch();
          expResultset.find(expressionArray[ei]);
          expResultset.data();

          // add any document 'hits'
          fr = expResultset.filteredrows;
          for (fri = 0; fri < fr.length; fri++) {
            if (docset.indexOf(fr[fri]) === -1) {
              docset.push(fr[fri]);
            }
          }
        }

        this.filteredrows = docset;
      } else {
        for (ei = 0; ei < expressionArray.length; ei++) {
          // we will let each filter run independently against full collection and mashup document hits later
          expResultset = this.collection.chain();
          expResultset.find(expressionArray[ei]);
          expResultset.data();

          // add any document 'hits'
          fr = expResultset.filteredrows;
          for (fri = 0; fri < fr.length; fri++) {
            if (this.filteredrows.indexOf(fr[fri]) === -1) {
              this.filteredrows.push(fr[fri]);
            }
          }
        }
      }

      this.filterInitialized = true;

      // possibly sort indexes
      return this;
    };

    /**
     * findAnd() - oversee the operation of AND'ed query expressions.
     *    AND'ed expression evaluation runs each expression progressively against the full collection,
     *    internally utilizing existing chained resultset functionality.
     *    Only the first filter can utilize a binary index.
     *
     * @param {array} expressionArray - array of expressions
     * @returns {Resultset} this resultset for further chain ops.
     */
    Resultset.prototype.findAnd = function (expressionArray) {
      // we have already implementing method chaining in this (our Resultset class)
      // so lets just progressively apply user supplied and filters
      for (var i = 0; i < expressionArray.length; i++) {
        this.find(expressionArray[i]);
      }

      return this;
    };

    /**
     * dotSubScan - helper function used for dot notation queries.
     */
    Resultset.prototype.dotSubScan = function (root, property, fun, value) {
      var arrayRef = null;
      var pathIndex, subIndex;
      var paths = property.split('.');
      var path;

      for (pathIndex = 0; pathIndex < paths.length; pathIndex++) {
        path = paths[pathIndex];

        // foreach already detected parent was array so this must be where we iterate
        if (arrayRef) {
          // iterate all sub-array items to see if any yield hits
          for (subIndex = 0; subIndex < arrayRef.length; subIndex++) {
            if (fun(arrayRef[subIndex][path], value)) {
              return true;
            }
          }
        }
        // else not yet determined if subarray scan is involved
        else {
          // if the dot notation is invalid for the current document, then ignore this document
          if (typeof root === 'undefined' || root === null || !root.hasOwnProperty(path)) {
            return false;
          }
          root = root[path];
          if (Array.isArray(root)) {
            arrayRef = root;
          }
        }
      }

      // made it this far so must be dot notation on non-array property
      return fun(root, value);
    };

    /**
     * find() - Used for querying via a mongo-style query object.
     *
     * @param {object} query - A mongo-style query object used for filtering current results.
     * @param {boolean} firstOnly - (Optional) Used by collection.findOne()
     * @returns {Resultset} this resultset for further chain ops.
     */
    Resultset.prototype.find = function (query, firstOnly) {
      if (this.collection.data.length === 0) {
        if (this.searchIsChained) {
          this.filteredrows = [];
          this.filterInitialized = true;
          return this;
        }
        return [];
      }


      var queryObject = query || 'getAll',
        property,
        value,
        operator,
        p,
        key,
        searchByIndex = false,
        result = [],
        index = null,
        // comparison function
        fun,
        // collection data
        t,
        // collection data length
        i,
        emptyQO = true;

      // if this was note invoked via findOne()
      firstOnly = firstOnly || false;

      // if passed in empty object {}, interpret as 'getAll'
      // more performant than object.keys
      for (p in queryObject) {
        emptyQO = false;
        break;
      }
      if (emptyQO) {
        queryObject = 'getAll';
      }

      // apply no filters if they want all
      if (queryObject === 'getAll') {
        // chained queries can just do coll.chain().data() but let's
        // be versatile and allow this also coll.chain().find().data()
        if (this.searchIsChained) {
          this.filteredrows = Object.keys(this.collection.data).map(Number);
          this.filterInitialized = true;
          return this;
        }
        // not chained, so return collection data array
        else {
          return this.collection.data.slice();
        }
      }

      // if user is deep querying the object such as find('name.first': 'odin')
      var usingDotNotation = false;

      for (p in queryObject) {
        if (queryObject.hasOwnProperty(p)) {
          property = p;

          // injecting $and and $or expression tree evaluation here.
          if (p === '$and') {
            if (this.searchIsChained) {
              this.findAnd(queryObject[p]);

              // for chained find with firstonly,
              if (firstOnly && this.filteredrows.length > 1) {
                this.filteredrows = this.filteredrows.slice(0, 1);
              }

              return this;
            } else {
              // our $and operation internally chains filters
              result = this.collection.chain().findAnd(queryObject[p]).data();

              // if this was coll.findOne() return first object or empty array if null
              // since this is invoked from a constructor we can't return null, so we will
              // make null in coll.findOne();
              if (firstOnly) {
                if (result.length === 0) return [];

                return result[0];
              }

              // not first only return all results
              return result;
            }
          }

          if (p === '$or') {
            if (this.searchIsChained) {
              this.findOr(queryObject[p]);

              if (firstOnly && this.filteredrows.length > 1) {
                this.filteredrows = this.filteredrows.slice(0, 1);
              }

              return this;
            } else {
              // call out to helper function to determine $or results
              result = this.collection.chain().findOr(queryObject[p]).data();

              if (firstOnly) {
                if (result.length === 0) return [];

                return result[0];
              }

              // not first only return all results
              return result;
            }
          }

          if (p.indexOf('.') != -1) {
            usingDotNotation = true;
          }

          // see if query object is in shorthand mode (assuming eq operator)
          if (queryObject[p] === null || (typeof queryObject[p] !== 'object' || queryObject[p] instanceof Date)) {
            operator = '$eq';
            value = queryObject[p];
          } else if (typeof queryObject[p] === 'object') {
            for (key in queryObject[p]) {
              if (queryObject[p].hasOwnProperty(key)) {
                operator = key;
                value = queryObject[p][key];
              }
            }
          } else {
            throw new Error('Do not know what you want to do.');
          }
          break;
        }
      }

      // for regex ops, precompile
      if (operator === '$regex') {
        if (typeof(value) === 'object' && Array.isArray(value)) {
          value = new RegExp(value[0], value[1]);
        }
        else {
          value = new RegExp(value);
        }
      }

      if (this.collection.data === null) {
        throw new TypeError();
      }

      // if an index exists for the property being queried against, use it
      // for now only enabling for non-chained query (who's set of docs matches index)
      // or chained queries where it is the first filter applied and prop is indexed
      if ((!this.searchIsChained || (this.searchIsChained && !this.filterInitialized)) &&
        indexedOpsList.indexOf(operator) !== -1 && this.collection.binaryIndices.hasOwnProperty(property)) {
        // this is where our lazy index rebuilding will take place
        // basically we will leave all indexes dirty until we need them
        // so here we will rebuild only the index tied to this property
        // ensureIndex() will only rebuild if flagged as dirty since we are not passing force=true param
        this.collection.ensureIndex(property);

        searchByIndex = true;
        index = this.collection.binaryIndices[property];
      }

      // the comparison function
      fun = operators[operator];

      // Query executed differently depending on :
      //    - whether it is chained or not
      //    - whether the property being queried has an index defined
      //    - if chained, we handle first pass differently for initial filteredrows[] population
      //
      // For performance reasons, each case has its own if block to minimize in-loop calculations

      // If not a chained query, bypass filteredrows and work directly against data
      if (!this.searchIsChained) {
        if (!searchByIndex) {
          t = this.collection.data;
          i = t.length;

          if (firstOnly) {
            if (usingDotNotation) {
              while (i--) {
                if (this.dotSubScan(t[i], property, fun, value)) {
                  return (t[i]);
                }
              }
            } else {
              while (i--) {
                if (fun(t[i][property], value)) {
                  return (t[i]);
                }
              }
            }

            return [];
          } else {
            // if using dot notation then treat property as keypath such as 'name.first'.
            // currently supporting dot notation for non-indexed conditions only
            if (usingDotNotation) {
              while (i--) {
                if (this.dotSubScan(t[i], property, fun, value)) {
                  result.push(t[i]);
                }
              }
            } else {
              while (i--) {
                if (fun(t[i][property], value)) {
                  result.push(t[i]);
                }
              }
            }
          }
        } else {
          // searching by binary index via calculateRange() utility method
          t = this.collection.data;

          var seg = this.calculateRange(operator, property, value, this);

          // not chained so this 'find' was designated in Resultset constructor
          // so return object itself
          if (firstOnly) {
            if (seg[1] !== -1) {
              return t[index.values[seg[0]]];
            }

            return [];
          }

          for (i = seg[0]; i <= seg[1]; i++) {
            result.push(t[index.values[i]]);
          }

          this.filteredrows = result;
        }

        // not a chained query so return result as data[]
        return result;
      }
      // Otherwise this is a chained query
      else {
        // If the filteredrows[] is already initialized, use it
        if (this.filterInitialized) {
          // not searching by index
          if (!searchByIndex) {
            t = this.collection.data;
            i = this.filteredrows.length;

            // currently supporting dot notation for non-indexed conditions only
            if (usingDotNotation) {
              while (i--) {
                if (this.dotSubScan(t[this.filteredrows[i]], property, fun, value)) {
                  result.push(this.filteredrows[i]);
                }
              }
            } else {
              while (i--) {
                if (fun(t[this.filteredrows[i]][property], value)) {
                  result.push(this.filteredrows[i]);
                }
              }
            }
          } else {
            // search by index
            t = index;
            i = this.filteredrows.length;
            while (i--) {
              if (fun(t[this.filteredrows[i]], value)) {
                result.push(this.filteredrows[i]);
              }
            }
          }

          this.filteredrows = result;

          return this;
        }
        // first chained query so work against data[] but put results in filteredrows
        else {
          // if not searching by index
          if (!searchByIndex) {
            t = this.collection.data;
            i = t.length;

            if (usingDotNotation) {
              while (i--) {
                if (this.dotSubScan(t[i], property, fun, value)) {
                  result.push(i);
                }
              }
            } else {
              while (i--) {
                if (fun(t[i][property], value)) {
                  result.push(i);
                }
              }
            }
          } else {
            // search by index
            t = this.collection.data;
            var segm = this.calculateRange(operator, property, value, this);

            for (var idx = segm[0]; idx <= segm[1]; idx++) {
              result.push(index.values[idx]);
            }

            this.filteredrows = result;
          }

          this.filteredrows = result;
          this.filterInitialized = true; // next time work against filteredrows[]

          return this;
        }

      }
    };


    /**
     * where() - Used for filtering via a javascript filter function.
     *
     * @param {function} fun - A javascript function used for filtering current results by.
     * @returns {Resultset} this resultset for further chain ops.
     */
    Resultset.prototype.where = function (fun) {

      var viewFunction,
        result = [];

      if ('function' === typeof fun) {
        viewFunction = fun;
      } else {
        throw new TypeError('Argument is not a stored view or a function');
      }
      try {
        // if not a chained query then run directly against data[] and return object []
        if (!this.searchIsChained) {
          var i = this.collection.data.length;

          while (i--) {
            if (viewFunction(this.collection.data[i]) === true) {
              result.push(this.collection.data[i]);
            }
          }

          // not a chained query so returning result as data[]
          return result;
        }
        // else chained query, so run against filteredrows
        else {
          // If the filteredrows[] is already initialized, use it
          if (this.filterInitialized) {
            var j = this.filteredrows.length;

            while (j--) {
              if (viewFunction(this.collection.data[this.filteredrows[j]]) === true) {
                result.push(this.filteredrows[j]);
              }
            }

            this.filteredrows = result;

            return this;
          }
          // otherwise this is initial chained op, work against data, push into filteredrows[]
          else {
            var k = this.collection.data.length;

            while (k--) {
              if (viewFunction(this.collection.data[k]) === true) {
                result.push(k);
              }
            }

            this.filteredrows = result;
            this.filterInitialized = true;

            return this;
          }
        }
      } catch (err) {
        throw err;
      }
    };

    /**
     * data() - Terminates the chain and returns array of filtered documents
     *
     * @param options {object} : allows specifying 'forceClones' and 'forceCloneMethod' options.
     *    options :
     *      forceClones {boolean} : Allows forcing the return of cloned objects even when
     *        the collection is not configured for clone object.
     *      forceCloneMethod {string} : Allows overriding the default or collection specified cloning method.
     *        Possible values include 'parse-stringify', 'jquery-extend-deep', and 'shallow'
     *
     * @returns {array} Array of documents in the resultset
     */
    Resultset.prototype.data = function (options) {
      var result = [],
        cd,
        cl;

      options = options || {};

      // if this is chained resultset with no filters applied, just return collection.data
      if (this.searchIsChained && !this.filterInitialized) {
        if (this.filteredrows.length === 0) {
          // determine whether we need to clone objects or not
          if (this.collection.cloneObjects || options.forceClones) {
            cd = this.collection.data;
            cl = cl.length;

            for (i = 0; i < cl; i++) {
              result.push(clone(cd[i], (options.forceCloneMethod || this.collection.cloneMethod)));
            }
          }
          // otherwise we are not cloning so return sliced array with same object references
          else {
            return this.collection.data.slice();
          }
        } else {
          // filteredrows must have been set manually, so use it
          this.filterInitialized = true;
        }
      }

      var data = this.collection.data,
        fr = this.filteredrows;

      var i,
        len = this.filteredrows.length;

      for (i = 0; i < len; i++) {
        if (this.collection.cloneObjects || options.forceClones) {
          result.push(clone(data[fr[i]], (options.forceCloneMethod || this.collection.cloneMethod)));
        }
        else {
          result.push(data[fr[i]]);
        }
      }
      return result;
    };

    /**
     * update() - used to run an update operation on all documents currently in the resultset.
     *
     * @param {function} updateFunction - User supplied updateFunction(obj) will be executed for each document object.
     * @returns {Resultset} this resultset for further chain ops.
     */
    Resultset.prototype.update = function (updateFunction) {

      if (typeof (updateFunction) !== "function") {
        throw new TypeError('Argument is not a function');
      }

      // if this is chained resultset with no filters applied, we need to populate filteredrows first
      if (this.searchIsChained && !this.filterInitialized && this.filteredrows.length === 0) {
        this.filteredrows = Object.keys(this.collection.data).map(Number);
      }

      var len = this.filteredrows.length,
        rcd = this.collection.data;

      for (var idx = 0; idx < len; idx++) {
        // pass in each document object currently in resultset to user supplied updateFunction
        updateFunction(rcd[this.filteredrows[idx]]);

        // notify collection we have changed this object so it can update meta and allow DynamicViews to re-evaluate
        this.collection.update(rcd[this.filteredrows[idx]]);
      }

      return this;
    };

    /**
     * remove() - removes all document objects which are currently in resultset from collection (as well as resultset)
     *
     * @returns {Resultset} this (empty) resultset for further chain ops.
     */
    Resultset.prototype.remove = function () {

      // if this is chained resultset with no filters applied, we need to populate filteredrows first
      if (this.searchIsChained && !this.filterInitialized && this.filteredrows.length === 0) {
        this.filteredrows = Object.keys(this.collection.data).map(Number);
      }

      this.collection.remove(this.data());

      this.filteredrows = [];

      return this;
    };

    /**
     * mapReduce() - data transformation via user supplied functions
     *
     * @param {function} mapFunction - this function accepts a single document for you to transform and return
     * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
     * @returns The output of your reduceFunction
     */
    Resultset.prototype.mapReduce = function (mapFunction, reduceFunction) {
      try {
        return reduceFunction(this.data().map(mapFunction));
      } catch (err) {
        throw err;
      }
    };

    /**
     * eqJoin() - Left joining two sets of data. Join keys can be defined or calculated properties
     * eqJoin expects the right join key values to be unique.  Otherwise left data will be joined on the last joinData object with that key
     * @param {Array} joinData - Data array to join to.
     * @param {String,function} leftJoinKey - Property name in this result set to join on or a function to produce a value to join on
     * @param {String,function} rightJoinKey - Property name in the joinData to join on or a function to produce a value to join on
     * @param {function} (optional) mapFun - A function that receives each matching pair and maps them into output objects - function(left,right){return joinedObject}
     * @returns {Resultset} A resultset with data in the format [{left: leftObj, right: rightObj}]
     */
    Resultset.prototype.eqJoin = function (joinData, leftJoinKey, rightJoinKey, mapFun) {

      var leftData = [],
        leftDataLength,
        rightData = [],
        rightDataLength,
        key,
        result = [],
        obj,
        leftKeyisFunction = typeof leftJoinKey === 'function',
        rightKeyisFunction = typeof rightJoinKey === 'function',
        joinMap = {};

      //get the left data
      leftData = this.data();
      leftDataLength = leftData.length;

      //get the right data
      if (joinData instanceof Resultset) {
        rightData = joinData.data();
      } else if (Array.isArray(joinData)) {
        rightData = joinData;
      } else {
        throw new TypeError('joinData needs to be an array or result set');
      }
      rightDataLength = rightData.length;

      //construct a lookup table

      for (var i = 0; i < rightDataLength; i++) {
        key = rightKeyisFunction ? rightJoinKey(rightData[i]) : rightData[i][rightJoinKey];
        joinMap[key] = rightData[i];
      }

      if (!mapFun) {
        mapFun = function (left, right) {
          return {
            left: left,
            right: right
          };
        };
      }

      //Run map function over each object in the resultset
      for (var j = 0; j < leftDataLength; j++) {
        key = leftKeyisFunction ? leftJoinKey(leftData[j]) : leftData[j][leftJoinKey];
        result.push(mapFun(leftData[j], joinMap[key] || {}));
      }

      //return return a new resultset with no filters
      this.collection = new Collection('joinData');
      this.collection.insert(result);
      this.filteredrows = [];
      this.filterInitialized = false;

      return this;
    };

    Resultset.prototype.map = function (mapFun) {
      var data = this.data().map(mapFun);
      //return return a new resultset with no filters
      this.collection = new Collection('mappedData');
      this.collection.insert(data);
      this.filteredrows = [];
      this.filterInitialized = false;

      return this;
    };

    /**
     * DynamicView class is a versatile 'live' view class which can have filters and sorts applied.
     *    Collection.addDynamicView(name) instantiates this DynamicView object and notifies it
     *    whenever documents are add/updated/removed so it can remain up-to-date. (chainable)
     *
     *    Examples:
     *    var mydv = mycollection.addDynamicView('test');  // default is non-persistent
     *    mydv.applyWhere(function(obj) { return obj.name === 'Toyota'; });
     *    mydv.applyFind({ 'doors' : 4 });
     *    var results = mydv.data();
     *
     * @constructor
     * @param {Collection} collection - A reference to the collection to work against
     * @param {string} name - The name of this dynamic view
     * @param {object} options - (Optional) Pass in object with 'persistent' and/or 'sortPriority' options.
     */
    function DynamicView(collection, name, options) {
      this.collection = collection;
      this.name = name;
      this.rebuildPending = false;
      this.options = options || {};

      if (!this.options.hasOwnProperty('persistent')) {
        this.options.persistent = false;
      }

      // 'persistentSortPriority':
      // 'passive' will defer the sort phase until they call data(). (most efficient overall)
      // 'active' will sort async whenever next idle. (prioritizes read speeds)
      if (!this.options.hasOwnProperty('sortPriority')) {
        this.options.sortPriority = 'passive';
      }

      this.resultset = new Resultset(collection);
      this.resultdata = [];
      this.resultsdirty = false;

      this.cachedresultset = null;

      // keep ordered filter pipeline
      this.filterPipeline = [];

      // sorting member variables
      // we only support one active search, applied using applySort() or applySimpleSort()
      this.sortFunction = null;
      this.sortCriteria = null;
      this.sortDirty = false;

      // for now just have 1 event for when we finally rebuilt lazy view
      // once we refactor transactions, i will tie in certain transactional events

      this.events = {
        'rebuild': []
      };
    }

    DynamicView.prototype = new LokiEventEmitter();


    /**
     * rematerialize() - intended for use immediately after deserialization (loading)
     *    This will clear out and reapply filterPipeline ops, recreating the view.
     *    Since where filters do not persist correctly, this method allows
     *    restoring the view to state where user can re-apply those where filters.
     *
     * @param {Object} options - (Optional) allows specification of 'removeWhereFilters' option
     * @returns {DynamicView} This dynamic view for further chained ops.
     */
    DynamicView.prototype.rematerialize = function (options) {
      var fpl,
        fpi,
        idx;

      options = options || {};

      this.resultdata = [];
      this.resultsdirty = true;
      this.resultset = new Resultset(this.collection);

      if (this.sortFunction || this.sortCriteria) {
        this.sortDirty = true;
      }

      if (options.hasOwnProperty('removeWhereFilters')) {
        // for each view see if it had any where filters applied... since they don't
        // serialize those functions lets remove those invalid filters
        fpl = this.filterPipeline.length;
        fpi = fpl;
        while (fpi--) {
          if (this.filterPipeline[fpi].type === 'where') {
            if (fpi !== this.filterPipeline.length - 1) {
              this.filterPipeline[fpi] = this.filterPipeline[this.filterPipeline.length - 1];
            }

            this.filterPipeline.length--;
          }
        }
      }

      // back up old filter pipeline, clear filter pipeline, and reapply pipeline ops
      var ofp = this.filterPipeline;
      this.filterPipeline = [];

      // now re-apply 'find' filterPipeline ops
      fpl = ofp.length;
      for (idx = 0; idx < fpl; idx++) {
        this.applyFind(ofp[idx].val);
      }

      // during creation of unit tests, i will remove this forced refresh and leave lazy
      this.data();

      // emit rebuild event in case user wants to be notified
      this.emit('rebuild', this);

      return this;
    };

    /**
     * branchResultset() - Makes a copy of the internal resultset for branched queries.
     *    Unlike this dynamic view, the branched resultset will not be 'live' updated,
     *    so your branched query should be immediately resolved and not held for future evaluation.
     *
     * @param {string, array} : Optional name of collection transform, or an array of transform steps
     * @param {object} : optional parameters (if optional transform requires them)
     * @returns {Resultset} A copy of the internal resultset for branched queries.
     */
    DynamicView.prototype.branchResultset = function (transform, parameters) {
      var rs = this.resultset.branch();

      if (typeof transform === 'undefined') {
        return rs;
      }

      return rs.transform(transform, parameters);
    };

    /**
     * toJSON() - Override of toJSON to avoid circular references
     *
     */
    DynamicView.prototype.toJSON = function () {
      var copy = new DynamicView(this.collection, this.name, this.options);

      copy.resultset = this.resultset;
      copy.resultdata = []; // let's not save data (copy) to minimize size
      copy.resultsdirty = true;
      copy.filterPipeline = this.filterPipeline;
      copy.sortFunction = this.sortFunction;
      copy.sortCriteria = this.sortCriteria;
      copy.sortDirty = this.sortDirty;

      // avoid circular reference, reapply in db.loadJSON()
      copy.collection = null;

      return copy;
    };

    /**
     * removeFilters() - Used to clear pipeline and reset dynamic view to initial state.
     *     Existing options should be retained.
     */
    DynamicView.prototype.removeFilters = function () {
      this.rebuildPending = false;
      this.resultset = new Resultset(this.collection);
      this.resultdata = [];
      this.resultsdirty = false;

      this.cachedresultset = null;

      // keep ordered filter pipeline
      this.filterPipeline = [];

      // sorting member variables
      // we only support one active search, applied using applySort() or applySimpleSort()
      this.sortFunction = null;
      this.sortCriteria = null;
      this.sortDirty = false;
    };

    /**
     * applySort() - Used to apply a sort to the dynamic view
     *
     * @param {function} comparefun - a javascript compare function used for sorting
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.applySort = function (comparefun) {
      this.sortFunction = comparefun;
      this.sortCriteria = null;

      this.queueSortPhase();

      return this;
    };

    /**
     * applySimpleSort() - Used to specify a property used for view translation.
     *
     * @param {string} propname - Name of property by which to sort.
     * @param {boolean} isdesc - (Optional) If true, the sort will be in descending order.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.applySimpleSort = function (propname, isdesc) {

      if (typeof (isdesc) === 'undefined') {
        isdesc = false;
      }

      this.sortCriteria = [
        [propname, isdesc]
      ];
      this.sortFunction = null;

      this.queueSortPhase();

      return this;
    };

    /**
     * applySortCriteria() - Allows sorting a resultset based on multiple columns.
     *    Example : dv.applySortCriteria(['age', 'name']); to sort by age and then name (both ascending)
     *    Example : dv.applySortCriteria(['age', ['name', true]); to sort by age (ascending) and then by name (descending)
     *    Example : dv.applySortCriteria(['age', true], ['name', true]); to sort by age (descending) and then by name (descending)
     *
     * @param {array} properties - array of property names or subarray of [propertyname, isdesc] used evaluate sort order
     * @returns {DynamicView} Reference to this DynamicView, sorted, for future chain operations.
     */
    DynamicView.prototype.applySortCriteria = function (criteria) {
      this.sortCriteria = criteria;
      this.sortFunction = null;

      this.queueSortPhase();

      return this;
    };

    /**
     * startTransaction() - marks the beginning of a transaction.
     *
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.startTransaction = function () {
      this.cachedresultset = this.resultset.copy();

      return this;
    };

    /**
     * commit() - commits a transaction.
     *
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.commit = function () {
      this.cachedresultset = null;

      return this;
    };

    /**
     * rollback() - rolls back a transaction.
     *
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.rollback = function () {
      this.resultset = this.cachedresultset;

      if (this.options.persistent) {
        // for now just rebuild the persistent dynamic view data in this worst case scenario
        // (a persistent view utilizing transactions which get rolled back), we already know the filter so not too bad.
        this.resultdata = this.resultset.data();

        this.emit('rebuild', this);
      }

      return this;
    };


    /**
     * Implementation detail.
     * _indexOfFilterWithId() - Find the index of a filter in the pipeline, by that filter's ID.
     *
     * @param {string|number} uid - The unique ID of the filter.
     * @returns {number}: index of the referenced filter in the pipeline; -1 if not found.
     */
    DynamicView.prototype._indexOfFilterWithId = function (uid) {
      if (typeof uid === 'string' || typeof uid === 'number') {
        for (var idx = 0, len = this.filterPipeline.length; idx < len; idx += 1) {
          if (uid === this.filterPipeline[idx].uid) {
            return idx;
          }
        }
      }
      return -1;
    };

    /**
     * Implementation detail.
     * _addFilter() - Add the filter object to the end of view's filter pipeline and apply the filter to the resultset.
     *
     * @param {object} filter - The filter object. Refer to applyFilter() for extra details.
     */
    DynamicView.prototype._addFilter = function (filter) {
      this.resultset[filter.type](filter.val);
      this.filterPipeline.push(filter);
    };

    /**
     * reapplyFilters() - Reapply all the filters in the current pipeline.
     *
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.reapplyFilters = function () {
      var filters = this.filterPipeline;
      var sortFunction = this.sortFunction;
      var sortCriteria = this.sortCriteria;

      this.removeFilters();

      for (var idx = 0, len = filters.length; idx < len; idx += 1) {
        this._addFilter(filters[idx]);
      }

      if (sortFunction !== null){
        this.applySort(sortFunction);
      }
      if (sortCriteria !== null) {
        this.applySortCriteria(sortCriteria);
      }

      if (this.options.persistent) {
        this.resultsdirty = true;
        this.queueSortPhase();
      }

      return this;
    };

    /**
     * applyFilter() - Adds or updates a filter in the DynamicView filter pipeline
     *
     * @param {object} filter - A filter object to add to the pipeline.
     *    The object is in the format { 'type': filter_type, 'val', filter_param, 'uid', optional_filter_id }
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.applyFilter = function (filter) {
      var idx = this._indexOfFilterWithId(filter.uid);
      if (idx >= 0) {
        this.filterPipeline[idx] = filter;
        this.reapplyFilters();
        return;
      }

      this._addFilter(filter);

      if (this.sortFunction || this.sortCriteria) {
        this.sortDirty = true;
        this.queueSortPhase();
      }

      if (this.options.persistent) {
        this.resultsdirty = true;
        this.queueSortPhase();
      }

      return this;
    };

    /**
     * applyFind() - Adds or updates a mongo-style query option in the DynamicView filter pipeline
     *
     * @param {object} query - A mongo-style query object to apply to pipeline
     * @param {string|number} uid - Optional: The unique ID of this filter, to reference it in the future.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.applyFind = function (query, uid) {
      this.applyFilter({
        type: 'find',
        val: query,
        uid: uid
      });
      return this;
    };

    /**
     * applyWhere() - Adds or updates a javascript filter function in the DynamicView filter pipeline
     *
     * @param {function} fun - A javascript filter function to apply to pipeline
     * @param {string|number} uid - Optional: The unique ID of this filter, to reference it in the future.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.applyWhere = function (fun, uid) {
      this.applyFilter({
        type: 'where',
        val: fun,
        uid: uid
      });
      return this;
    };

    /**
     * removeFilter() - Remove the specified filter from the DynamicView filter pipeline
     *
     * @param {string|number} uid - The unique ID of the filter to be removed.
     * @returns {DynamicView} this DynamicView object, for further chain ops.
     */
    DynamicView.prototype.removeFilter = function (uid) {
      var idx = this._indexOfFilterWithId(uid);
      if (idx < 0) {
        throw new Error("Dynamic view does not contain a filter with ID: " + uid);
      }

      this.filterPipeline.splice(idx, 1);
      this.reapplyFilters();
      return this;
    };


    /**
     * data() - resolves and pending filtering and sorting, then returns document array as result.
     *
     * @returns {array} An array of documents representing the current DynamicView contents.
     */
    DynamicView.prototype.data = function () {
      // Until a proper initialization phase can be implemented, let us initialize here (if needed)
      if (this.filterPipeline.length === 0) {
        this.applyFind();
      }

      // using final sort phase as 'catch all' for a few use cases which require full rebuild
      if (this.sortDirty || this.resultsdirty) {
        this.performSortPhase();
      }

      if (!this.options.persistent) {
        return this.resultset.data();
      }

      return this.resultdata;
    };

    /**
     * queueRebuildEvent() - When the view is not sorted we may still wish to be notified of rebuild events.
     *     This event will throttle and queue a single rebuild event when batches of updates affect the view.
     */
    DynamicView.prototype.queueRebuildEvent = function () {
      var self = this;

      if (this.rebuildPending) {
        return;
      }

      this.rebuildPending = true;

      setTimeout(function () {
        self.rebuildPending = false;
        self.emit('rebuild', self);
      }, 1);
    };

    /**
     * queueSortPhase : If the view is sorted we will throttle sorting to either :
     *    (1) passive - when the user calls data(), or
     *    (2) active - once they stop updating and yield js thread control
     */
    DynamicView.prototype.queueSortPhase = function () {
      var self = this;

      // already queued? exit without queuing again
      if (this.sortDirty) {
        return;
      }

      this.sortDirty = true;

      if (this.options.sortPriority === "active") {
        // active sorting... once they are done and yield js thread, run async performSortPhase()
        setTimeout(function () {
          self.performSortPhase();
        }, 1);
      } else {
        // must be passive sorting... since not calling performSortPhase (until data call), lets use queueRebuildEvent to
        // potentially notify user that data has changed.
        this.queueRebuildEvent();
      }
    };

    /**
     * performSortPhase() - invoked synchronously or asynchronously to perform final sort phase (if needed)
     *
     */
    DynamicView.prototype.performSortPhase = function () {
      // async call to this may have been pre-empted by synchronous call to data before async could fire
      if (!this.sortDirty && !this.resultsdirty) {
        return;
      }

      if (this.sortFunction) {
        this.resultset.sort(this.sortFunction);
      }

      if (this.sortCriteria) {
        this.resultset.compoundsort(this.sortCriteria);
      }

      if (!this.options.persistent) {
        this.sortDirty = false;
        return;
      }

      // persistent view, rebuild local resultdata array
      this.resultdata = this.resultset.data();
      this.resultsdirty = false;
      this.sortDirty = false;

      this.emit('rebuild', this);
    };

    /**
     * evaluateDocument() - internal method for (re)evaluating document inclusion.
     *    Called by : collection.insert() and collection.update().
     *
     * @param {int} objIndex - index of document to (re)run through filter pipeline.
     */
    DynamicView.prototype.evaluateDocument = function (objIndex) {
      var ofr = this.resultset.filteredrows;
      var oldPos = ofr.indexOf(+objIndex);
      var oldlen = ofr.length;

      // creating a 1-element resultset to run filter chain ops on to see if that doc passes filters;
      // mostly efficient algorithm, slight stack overhead price (this function is called on inserts and updates)
      var evalResultset = new Resultset(this.collection);
      evalResultset.filteredrows = [objIndex];
      evalResultset.filterInitialized = true;
      for (var idx = 0; idx < this.filterPipeline.length; idx++) {
        switch (this.filterPipeline[idx].type) {
        case 'find':
          evalResultset.find(this.filterPipeline[idx].val);
          break;
        case 'where':
          evalResultset.where(this.filterPipeline[idx].val);
          break;
        }
      }

      // not a true position, but -1 if not pass our filter(s), 0 if passed filter(s)
      var newPos = (evalResultset.filteredrows.length === 0) ? -1 : 0;

      // wasn't in old, shouldn't be now... do nothing
      if (oldPos == -1 && newPos == -1) return;

      // wasn't in resultset, should be now... add
      if (oldPos === -1 && newPos !== -1) {
        ofr.push(objIndex);

        if (this.options.persistent) {
          this.resultdata.push(this.collection.data[objIndex]);
        }

        // need to re-sort to sort new document
        if (this.sortFunction || this.sortCriteria) {
          this.queueSortPhase();
        } else {
          this.queueRebuildEvent();
        }

        return;
      }

      // was in resultset, shouldn't be now... delete
      if (oldPos !== -1 && newPos === -1) {
        if (oldPos < oldlen - 1) {
          // http://dvolvr.davidwaterston.com/2013/06/09/restating-the-obvious-the-fastest-way-to-truncate-an-array-in-javascript/comment-page-1/
          ofr[oldPos] = ofr[oldlen - 1];
          ofr.length = oldlen - 1;

          if (this.options.persistent) {
            this.resultdata[oldPos] = this.resultdata[oldlen - 1];
            this.resultdata.length = oldlen - 1;
          }
        } else {
          ofr.length = oldlen - 1;

          if (this.options.persistent) {
            this.resultdata.length = oldlen - 1;
          }
        }

        // in case changes to data altered a sort column
        if (this.sortFunction || this.sortCriteria) {
          this.queueSortPhase();
        } else {
          this.queueRebuildEvent();
        }

        return;
      }

      // was in resultset, should still be now... (update persistent only?)
      if (oldPos !== -1 && newPos !== -1) {
        if (this.options.persistent) {
          // in case document changed, replace persistent view data with the latest collection.data document
          this.resultdata[oldPos] = this.collection.data[objIndex];
        }

        // in case changes to data altered a sort column
        if (this.sortFunction || this.sortCriteria) {
          this.queueSortPhase();
        } else {
          this.queueRebuildEvent();
        }

        return;
      }
    };

    /**
     * removeDocument() - internal function called on collection.delete()
     */
    DynamicView.prototype.removeDocument = function (objIndex) {
      var ofr = this.resultset.filteredrows;
      var oldPos = ofr.indexOf(+objIndex);
      var oldlen = ofr.length;
      var idx;

      if (oldPos !== -1) {
        // if not last row in resultdata, swap last to hole and truncate last row
        if (oldPos < oldlen - 1) {
          ofr[oldPos] = ofr[oldlen - 1];
          ofr.length = oldlen - 1;

          if (this.options.persistent) {
            this.resultdata[oldPos] = this.resultdata[oldlen - 1];
            this.resultdata.length = oldlen - 1;
          }
        }
        // last row, so just truncate last row
        else {
          ofr.length = oldlen - 1;

          if (this.options.persistent) {
            this.resultdata.length = oldlen - 1;
          }
        }

        // in case changes to data altered a sort column
        if (this.sortFunction || this.sortCriteria) {
          this.queueSortPhase();
        }
      }

      // since we are using filteredrows to store data array positions
      // if they remove a document (whether in our view or not),
      // we need to adjust array positions -1 for all document array references after that position
      oldlen = ofr.length;
      for (idx = 0; idx < oldlen; idx++) {
        if (ofr[idx] > objIndex) {
          ofr[idx]--;
        }
      }
    };

    /**
     * mapReduce() - data transformation via user supplied functions
     *
     * @param {function} mapFunction - this function accepts a single document for you to transform and return
     * @param {function} reduceFunction - this function accepts many (array of map outputs) and returns single value
     * @returns The output of your reduceFunction
     */
    DynamicView.prototype.mapReduce = function (mapFunction, reduceFunction) {
      try {
        return reduceFunction(this.data().map(mapFunction));
      } catch (err) {
        throw err;
      }
    };


    /**
     * @constructor
     * Collection class that handles documents of same type
     * @param {string} collection name
     * @param {array} array of property names to be indicized
     * @param {object} configuration object
     */
    function Collection(name, options) {
      // the name of the collection

      this.name = name;
      // the data held by the collection
      this.data = [];
      this.idIndex = []; // index of id
      this.binaryIndices = {}; // user defined indexes
      this.constraints = {
        unique: {},
        exact: {}
      };

      // unique contraints contain duplicate object references, so they are not persisted.
      // we will keep track of properties which have unique contraint applied here, and regenerate on load
      this.uniqueNames = [];

      // transforms will be used to store frequently used query chains as a series of steps
      // which itself can be stored along with the database.
      this.transforms = {};

      // the object type of the collection
      this.objType = name;

      // in autosave scenarios we will use collection level dirty flags to determine whether save is needed.
      // currently, if any collection is dirty we will autosave the whole database if autosave is configured.
      // defaulting to true since this is called from addCollection and adding a collection should trigger save
      this.dirty = true;

      // private holders for cached data
      this.cachedIndex = null;
      this.cachedBinaryIndex = null;
      this.cachedData = null;
      var self = this;

      /* OPTIONS */
      options = options || {};

      // exact match and unique constraints
      if (options.hasOwnProperty('unique')) {
        if (!Array.isArray(options.unique)) {
          options.unique = [options.unique];
        }
        options.unique.forEach(function (prop) {
          self.uniqueNames.push(prop); // used to regenerate on subsequent database loads
          self.constraints.unique[prop] = new UniqueIndex(prop);
        });
      }

      if (options.hasOwnProperty('exact')) {
        options.exact.forEach(function (prop) {
          self.constraints.exact[prop] = new ExactIndex(prop);
        });
      }

      // is collection transactional
      this.transactional = options.hasOwnProperty('transactional') ? options.transactional : false;

      // options to clone objects when inserting them
      this.cloneObjects = options.hasOwnProperty('clone') ? options.clone : false;

      // default clone method (if enabled) is parse-stringify
      this.cloneMethod = options.hasOwnProperty('clonemethod') ? options.cloneMethod : "parse-stringify";

      // option to make event listeners async, default is sync
      this.asyncListeners = options.hasOwnProperty('asyncListeners') ? options.asyncListeners : false;

      // disable track changes
      this.disableChangesApi = options.hasOwnProperty('disableChangesApi') ? options.disableChangesApi : true;

      // option to observe objects and update them automatically, ignored if Object.observe is not supported
      this.autoupdate = options.hasOwnProperty('autoupdate') ? options.autoupdate : false;

      // currentMaxId - change manually at your own peril!
      this.maxId = 0;

      this.DynamicViews = [];

      // events
      this.events = {
        'insert': [],
        'update': [],
        'pre-insert': [],
        'pre-update': [],
        'close': [],
        'flushbuffer': [],
        'error': [],
        'delete': [],
        'warning': []
      };

      // changes are tracked by collection and aggregated by the db
      this.changes = [];

      // initialize the id index
      this.ensureId();
      var indices = [];
      // initialize optional user-supplied indices array ['age', 'lname', 'zip']
      if (options && options.indices) {
        if (Object.prototype.toString.call(options.indices) === '[object Array]') {
          indices = options.indices;
        } else if (typeof options.indices === 'string') {
          indices = [options.indices];
        } else {
          throw new TypeError('Indices needs to be a string or an array of strings');
        }
      }

      for (var idx = 0; idx < indices.length; idx++) {
        this.ensureIndex(indices[idx]);
      }

      function observerCallback(changes) {

        var changedObjects = typeof Set === 'function' ? new Set() : [];

        if(!changedObjects.add)
          changedObjects.add = function(object) {
            if(this.indexOf(object) === -1)
              this.push(object);
            return this;
          };

        changes.forEach(function (change) {
          changedObjects.add(change.object);
        });

        changedObjects.forEach(function (object) {
          if(!object.hasOwnProperty('$loki'))
            return self.removeAutoUpdateObserver(object);
          try {
            self.update(object);
          } catch(err) {}
        });
      }

      this.observerCallback = observerCallback;

      /**
       * This method creates a clone of the current status of an object and associates operation and collection name,
       * so the parent db can aggregate and generate a changes object for the entire db
       */
      function createChange(name, op, obj) {
        self.changes.push({
          name: name,
          operation: op,
          obj: JSON.parse(JSON.stringify(obj))
        });
      }

      // clear all the changes
      function flushChanges() {
        self.changes = [];
      }

      this.getChanges = function () {
        return self.changes;
      };

      this.flushChanges = flushChanges;

      /**
       * If the changes API is disabled make sure only metadata is added without re-evaluating everytime if the changesApi is enabled
       */
      function insertMeta(obj) {
        if (!obj) {
          return;
        }
        if (!obj.meta) {
          obj.meta = {};
        }

        obj.meta.created = (new Date()).getTime();
        obj.meta.revision = 0;
      }

      function updateMeta(obj) {
        if (!obj) {
          return;
        }
        obj.meta.updated = (new Date()).getTime();
        obj.meta.revision += 1;
      }

      function createInsertChange(obj) {
        createChange(self.name, 'I', obj);
      }

      function createUpdateChange(obj) {
        createChange(self.name, 'U', obj);
      }

      function insertMetaWithChange(obj) {
        insertMeta(obj);
        createInsertChange(obj);
      }

      function updateMetaWithChange(obj) {
        updateMeta(obj);
        createUpdateChange(obj);
      }


      /* assign correct handler based on ChangesAPI flag */
      var insertHandler, updateHandler;

      function setHandlers() {
        insertHandler = self.disableChangesApi ? insertMeta : insertMetaWithChange;
        updateHandler = self.disableChangesApi ? updateMeta : updateMetaWithChange;
      }

      setHandlers();

      this.setChangesApi = function (enabled) {
        self.disableChangesApi = !enabled;
        setHandlers();
      };
      /**
       * built-in events
       */
      this.on('insert', function insertCallback(obj) {
        insertHandler(obj);
      });

      this.on('update', function updateCallback(obj) {
        updateHandler(obj);
      });

      this.on('delete', function deleteCallback(obj) {
        if (!self.disableChangesApi) {
          createChange(self.name, 'R', obj);
        }
      });

      this.on('warning', function (warning) {
        self.console.warn(warning);
      });
      // for de-serialization purposes
      flushChanges();
    }

    Collection.prototype = new LokiEventEmitter();

    Collection.prototype.console = {
      log: function () {},
      warn: function () {},
      error: function () {},
    };

    Collection.prototype.addAutoUpdateObserver = function (object) {

      if(!this.autoupdate || typeof Object.observe !== 'function')
        return;

      Object.observe(object, this.observerCallback, ['add', 'update', 'delete', 'reconfigure', 'setPrototype']);
    };

    Collection.prototype.removeAutoUpdateObserver = function (object) {
      if(!this.autoupdate || typeof Object.observe !== 'function')
        return;

      Object.unobserve(object, this.observerCallback);
    };

    Collection.prototype.addTransform = function (name, transform) {
      if (this.transforms.hasOwnProperty(name)) {
        throw new Error("a transform by that name already exists");
      }

      this.transforms[name] = transform;
    };

    Collection.prototype.setTransform = function (name, transform) {
      this.transforms[name] = transform;
    };

    Collection.prototype.removeTransform = function (name) {
      delete this.transforms[name];
    };

    Collection.prototype.byExample = function (template) {
      var k, obj, query;
      query = [];
      for (k in template) {
        if (!template.hasOwnProperty(k)) continue;
        query.push((
          obj = {},
          obj[k] = template[k],
          obj
        ));
      }
      return {
        '$and': query
      };
    };

    Collection.prototype.findObject = function (template) {
      return this.findOne(this.byExample(template));
    };

    Collection.prototype.findObjects = function (template) {
      return this.find(this.byExample(template));
    };

    /*----------------------------+
    | INDEXING                    |
    +----------------------------*/

    /**
     * Ensure binary index on a certain field
     */
    Collection.prototype.ensureIndex = function (property, force) {
      // optional parameter to force rebuild whether flagged as dirty or not
      if (typeof (force) === 'undefined') {
        force = false;
      }

      if (property === null || property === undefined) {
        throw new Error('Attempting to set index without an associated property');
      }

      if (this.binaryIndices.hasOwnProperty(property) && !force) {
        if (!this.binaryIndices[property].dirty) return;
      }

      this.binaryIndices[property] = {
        'name': property,
        'dirty': true,
        'values': []
      };

      var index, len = this.data.length,
        i = 0;

      index = this.binaryIndices[property];

      // initialize index values
      for (i; i < len; i += 1) {
        index.values.push(i);
      }

      var wrappedComparer =
        (function (prop, coll) {
          return function (a, b) {
            var obj1 = coll.data[a];
            var obj2 = coll.data[b];

            if (obj1[prop] === obj2[prop]) return 0;
            if (gtHelper(obj1[prop], obj2[prop])) return 1;
            if (ltHelper(obj1[prop], obj2[prop])) return -1;
          };
        })(property, this);

      index.values.sort(wrappedComparer);
      index.dirty = false;

      this.dirty = true; // for autosave scenarios
    };

    Collection.prototype.ensureUniqueIndex = function (field) {

      var index = this.constraints.unique[field];
      if (!index) {
        // keep track of new unique index for regenerate after database (re)load.
        if (this.uniqueNames.indexOf(field) == -1) {
          this.uniqueNames.push(field);
        }
        this.constraints.unique[field] = index = new UniqueIndex(field);
      }
      var self = this;
      this.data.forEach(function (obj) {
        index.set(obj);
      });
      return index;
    };

    /**
     * Ensure all binary indices
     */
    Collection.prototype.ensureAllIndexes = function (force) {
      var objKeys = Object.keys(this.binaryIndices);

      var i = objKeys.length;
      while (i--) {
        this.ensureIndex(objKeys[i], force);
      }
    };

    Collection.prototype.flagBinaryIndexesDirty = function () {
      var objKeys = Object.keys(this.binaryIndices);

      var i = objKeys.length;
      while (i--) {
        this.binaryIndices[objKeys[i]].dirty = true;
      }
    };

    Collection.prototype.flagBinaryIndexDirty = function (index) {
      if(this.binaryIndices[index])
        this.binaryIndices[index].dirty = true;
    };

    Collection.prototype.count = function (query) {
      if (!query) {
        return this.data.length;
      }

      return this.chain().find(query).filteredrows.length;
    };

    /**
     * Rebuild idIndex
     */
    Collection.prototype.ensureId = function () {

      var len = this.data.length,
        i = 0;

      this.idIndex = [];
      for (i; i < len; i += 1) {
        this.idIndex.push(this.data[i].$loki);
      }
    };

    /**
     * Rebuild idIndex async with callback - useful for background syncing with a remote server
     */
    Collection.prototype.ensureIdAsync = function (callback) {
      this.async(function () {
        this.ensureId();
      }, callback);
    };

    /**
     * Each collection maintains a list of DynamicViews associated with it
     **/

    Collection.prototype.addDynamicView = function (name, options) {
      var dv = new DynamicView(this, name, options);
      this.DynamicViews.push(dv);

      return dv;
    };

    Collection.prototype.removeDynamicView = function (name) {
      for (var idx = 0; idx < this.DynamicViews.length; idx++) {
        if (this.DynamicViews[idx].name === name) {
          this.DynamicViews.splice(idx, 1);
        }
      }
    };

    Collection.prototype.getDynamicView = function (name) {
      for (var idx = 0; idx < this.DynamicViews.length; idx++) {
        if (this.DynamicViews[idx].name === name) {
          return this.DynamicViews[idx];
        }
      }

      return null;
    };

    /**
     * find and update: pass a filtering function to select elements to be updated
     * and apply the updatefunctino to those elements iteratively
     */
    Collection.prototype.findAndUpdate = function (filterFunction, updateFunction) {

      var results = this.where(filterFunction),
        i = 0,
        obj;
      try {
        for (i; i < results.length; i++) {
          obj = updateFunction(results[i]);
          this.update(obj);
        }

      } catch (err) {
        this.rollback();
        this.console.error(err.message);
      }
    };

    /**
     * generate document method - ensure objects have id and objType properties
     * @param {object} the document to be inserted (or an array of objects)
     * @returns document or documents (if passed an array of objects)
     */
    Collection.prototype.insert = function (doc) {

      if (!doc) {
        var error = new Error('Object cannot be null');
        this.emit('error', error);
        throw error;
      }

      var self = this;
      // holder to the clone of the object inserted if collections is set to clone objects
      var obj;
      var docs = Array.isArray(doc) ? doc : [doc];
      var results = [];
      docs.forEach(function (d) {
        if (typeof d !== 'object') {
          throw new TypeError('Document needs to be an object');
        }

        // if configured to clone, do so now... otherwise just use same obj reference
        obj = self.cloneObjects ? clone(d, self.cloneMethod) : d;

        if (typeof obj.meta === 'undefined') {
          obj.meta = {
            revision: 0,
            created: 0
          };
        }
        self.emit('pre-insert', obj);
        if (self.add(obj)) {
          self.addAutoUpdateObserver(obj);
          self.emit('insert', obj);
          results.push(obj);
        } else {
          return undefined;
        }
      });
      return results.length === 1 ? results[0] : results;
    };

    Collection.prototype.clear = function () {
      this.data = [];
      this.idIndex = [];
      this.binaryIndices = {};
      this.cachedIndex = null;
      this.cachedData = null;
      this.maxId = 0;
      this.DynamicViews = [];
      this.dirty = true;
    };

    /**
     * Update method
     */
    Collection.prototype.update = function (doc) {
      if (Object.keys(this.binaryIndices).length > 0) {
        this.flagBinaryIndexesDirty();
      }

      if (Array.isArray(doc)) {
        var k = 0,
          len = doc.length;
        for (k; k < len; k += 1) {
          this.update(doc[k]);
        }
        return;
      }

      // verify object is a properly formed document
      if (!doc.hasOwnProperty('$loki')) {
        throw new Error('Trying to update unsynced document. Please save the document first by using insert() or addMany()');
      }
      try {
        this.startTransaction();
        var arr = this.get(doc.$loki, true),
          obj,
          position,
          self = this;

        if (!arr) {
          throw new Error('Trying to update a document not in collection.');
        }
        this.emit('pre-update', doc);

        obj = arr[0];

        Object.keys(this.constraints.unique).forEach(function (key) {
          self.constraints.unique[key].update(obj);
        });

        // get current position in data array
        position = arr[1];

        // operate the update
        this.data[position] = doc;

        if(obj !== doc) {
          this.addAutoUpdateObserver(doc);
        }

        // now that we can efficiently determine the data[] position of newly added document,
        // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
        for (var idx = 0; idx < this.DynamicViews.length; idx++) {
          this.DynamicViews[idx].evaluateDocument(position);
        }

        this.idIndex[position] = obj.$loki;

        this.commit();
        this.dirty = true; // for autosave scenarios
        this.emit('update', doc);
        return doc;
      } catch (err) {
        this.rollback();
        this.console.error(err.message);
        this.emit('error', err);
        throw (err); // re-throw error so user does not think it succeeded
      }
    };

    /**
     * Add object to collection
     */
    Collection.prototype.add = function (obj) {
      var dvlen = this.DynamicViews.length;

      // if parameter isn't object exit with throw
      if ('object' !== typeof obj) {
        throw new TypeError('Object being added needs to be an object');
      }
      /*
       * try adding object to collection
       */

      if (Object.keys(this.binaryIndices).length > 0) {
        this.flagBinaryIndexesDirty();
      }

      // if object you are adding already has id column it is either already in the collection
      // or the object is carrying its own 'id' property.  If it also has a meta property,
      // then this is already in collection so throw error, otherwise rename to originalId and continue adding.
      if (typeof (obj.$loki) !== "undefined") {
        throw new Error('Document is already in collection, please use update()');
      }

      try {
        this.startTransaction();
        this.maxId++;

        if (isNaN(this.maxId)) {
          this.maxId = (this.data[this.data.length - 1].$loki + 1);
        }

        obj.$loki = this.maxId;
        obj.meta.version = 0;

        var self = this;
        Object.keys(this.constraints.unique).forEach(function (key) {
          // Function set will throw error when unique constraint is not honoured
          self.constraints.unique[key].set(obj);
        });

        // add the object
        this.data.push(obj);

        // now that we can efficiently determine the data[] position of newly added document,
        // submit it for all registered DynamicViews to evaluate for inclusion/exclusion
        for (var i = 0; i < dvlen; i++) {
          this.DynamicViews[i].evaluateDocument(this.data.length - 1);
        }

        // add new obj id to idIndex
        this.idIndex.push(obj.$loki);

        this.commit();
        this.dirty = true; // for autosave scenarios

        if (this.cloneObjects) {
          return obj;
        }
        else {
          return clone(obj, this.cloneMethod);
        }
      } catch (err) {
        this.rollback();
        this.console.error(err.message);
      }
    };


    Collection.prototype.removeWhere = function (query) {
      var list;
      if (typeof query === 'function') {
        list = this.data.filter(query);
      } else {
        list = new Resultset(this, query);
      }
      this.remove(list);
    };

    Collection.prototype.removeDataOnly = function () {
      this.remove(this.data.slice());
    };

    /**
     * delete wrapped
     */
    Collection.prototype.remove = function (doc) {
      if (typeof doc === 'number') {
        doc = this.get(doc);
      }

      if ('object' !== typeof doc) {
        throw new Error('Parameter is not an object');
      }
      if (Array.isArray(doc)) {
        var k = 0,
          len = doc.length;
        for (k; k < len; k += 1) {
          this.remove(doc[k]);
        }
        return;
      }

      if (!doc.hasOwnProperty('$loki')) {
        throw new Error('Object is not a document stored in the collection');
      }

      if (Object.keys(this.binaryIndices).length > 0) {
        this.flagBinaryIndexesDirty();
      }

      try {
        this.startTransaction();
        var arr = this.get(doc.$loki, true),
          // obj = arr[0],
          position = arr[1];
        var self = this;
        Object.keys(this.constraints.unique).forEach(function (key) {
          if (doc[key] !== null && typeof doc[key] !== 'undefined') {
            self.constraints.unique[key].remove(doc[key]);
          }
        });
        // now that we can efficiently determine the data[] position of newly added document,
        // submit it for all registered DynamicViews to remove
        for (var idx = 0; idx < this.DynamicViews.length; idx++) {
          this.DynamicViews[idx].removeDocument(position);
        }

        this.data.splice(position, 1);
        this.removeAutoUpdateObserver(doc);

        // remove id from idIndex
        this.idIndex.splice(position, 1);

        this.commit();
        this.dirty = true; // for autosave scenarios
        this.emit('delete', arr[0]);
        delete doc.$loki;
        delete doc.meta;
        return doc;

      } catch (err) {
        this.rollback();
        this.console.error(err.message);
        this.emit('error', err);
        return null;
      }
    };

    /*---------------------+
    | Finding methods     |
    +----------------------*/

    /**
     * Get by Id - faster than other methods because of the searching algorithm
     */
    Collection.prototype.get = function (id, returnPosition) {

      var retpos = returnPosition || false,
        data = this.idIndex,
        max = data.length - 1,
        min = 0,
        mid = Math.floor(min + (max - min) / 2);

      id = typeof id === 'number' ? id : parseInt(id, 10);

      if (isNaN(id)) {
        throw new TypeError('Passed id is not an integer');
      }

      while (data[min] < data[max]) {

        mid = Math.floor((min + max) / 2);

        if (data[mid] < id) {
          min = mid + 1;
        } else {
          max = mid;
        }
      }

      if (max === min && data[min] === id) {

        if (retpos) {
          return [this.data[min], min];
        }
        return this.data[min];
      }
      return null;

    };

    Collection.prototype.by = function (field, value) {
      var self;
      if (!value) {
        self = this;
        return function (value) {
          return self.by(field, value);
        };
      }

      if (!this.cloneObjects) {
        return this.constraints.unique[field].get(value);
      }
      else {
        return clone(this.constraints.unique[field].get(value), this.cloneMethod);
      }
    };

    /**
     * Find one object by index property, by property equal to value
     */
    Collection.prototype.findOne = function (query) {
      // Instantiate Resultset and exec find op passing firstOnly = true param
      var result = new Resultset(this, query, null, true);
      if (Array.isArray(result) && result.length === 0) {
        return null;
      } else {
        if (!this.cloneObjects) {
          return result;
        }
        else {
          return clone(result, this.cloneMethod);
        }
      }
    };

    /**
     * Chain method, used for beginning a series of chained find() and/or view() operations
     * on a collection.
     *
     * @param {array} transform : Ordered array of transform step objects similar to chain
     * @param {object} parameters: Object containing properties representing parameters to substitute
     * @returns {Resultset} : (or data array if any map or join functions where called)
     */
    Collection.prototype.chain = function (transform, parameters) {
      var rs = new Resultset(this, null, null);

      if (typeof transform === 'undefined') {
        return rs;
      }

      return rs.transform(transform, parameters);
    };

    /**
     * Find method, api is similar to mongodb except for now it only supports one search parameter.
     * for more complex queries use view() and storeView()
     */
    Collection.prototype.find = function (query) {
      if (typeof (query) === 'undefined') {
        query = 'getAll';
      }

      if (!this.cloneObjects) {
        return new Resultset(this, query, null);
      }
      else {
        var results = new Resultset(this, query, null);

        return cloneObjectArray(results, this.cloneMethod);
      }
    };

    /**
     * Find object by unindexed field by property equal to value,
     * simply iterates and returns the first element matching the query
     */
    Collection.prototype.findOneUnindexed = function (prop, value) {

      var i = this.data.length,
        doc;
      while (i--) {
        if (this.data[i][prop] === value) {
          doc = this.data[i];
          return doc;
        }
      }
      return null;
    };

    /**
     * Transaction methods
     */

    /** start the transation */
    Collection.prototype.startTransaction = function () {
      if (this.transactional) {
        this.cachedData = clone(this.data, this.cloneMethod);
        this.cachedIndex = this.idIndex;
        this.cachedBinaryIndex = this.binaryIndices;

        // propagate startTransaction to dynamic views
        for (var idx = 0; idx < this.DynamicViews.length; idx++) {
          this.DynamicViews[idx].startTransaction();
        }
      }
    };

    /** commit the transation */
    Collection.prototype.commit = function () {
      if (this.transactional) {
        this.cachedData = null;
        this.cachedIndex = null;
        this.cachedBinaryIndices = null;

        // propagate commit to dynamic views
        for (var idx = 0; idx < this.DynamicViews.length; idx++) {
          this.DynamicViews[idx].commit();
        }
      }
    };

    /** roll back the transation */
    Collection.prototype.rollback = function () {
      if (this.transactional) {
        if (this.cachedData !== null && this.cachedIndex !== null) {
          this.data = this.cachedData;
          this.idIndex = this.cachedIndex;
          this.binaryIndices = this.cachedBinaryIndex;
        }

        // propagate rollback to dynamic views
        for (var idx = 0; idx < this.DynamicViews.length; idx++) {
          this.DynamicViews[idx].rollback();
        }
      }
    };

    // async executor. This is only to enable callbacks at the end of the execution.
    Collection.prototype.async = function (fun, callback) {
      setTimeout(function () {
        if (typeof fun === 'function') {
          fun();
          callback();
        } else {
          throw new TypeError('Argument passed for async execution is not a function');
        }
      }, 0);
    };

    /**
     * Create view function - filter
     */
    Collection.prototype.where = function (fun) {
      if (!this.cloneObjects) {
        return new Resultset(this, null, fun);
      }
      else {
        var results = new Resultset(this, null, fun);

        return cloneObjectArray(results, this.cloneMethod);
      }
    };

    /**
     * Map Reduce
     */
    Collection.prototype.mapReduce = function (mapFunction, reduceFunction) {
      try {
        return reduceFunction(this.data.map(mapFunction));
      } catch (err) {
        throw err;
      }
    };

    /**
     * eqJoin - Join two collections on specified properties
     */
    Collection.prototype.eqJoin = function (joinData, leftJoinProp, rightJoinProp, mapFun) {
      // logic in Resultset class
      return new Resultset(this).eqJoin(joinData, leftJoinProp, rightJoinProp, mapFun);
    };

    /* ------ STAGING API -------- */
    /**
     * stages: a map of uniquely identified 'stages', which hold copies of objects to be
     * manipulated without affecting the data in the original collection
     */
    Collection.prototype.stages = {};

    /**
     * create a stage and/or retrieve it
     */
    Collection.prototype.getStage = function (name) {
      if (!this.stages[name]) {
        this.stages[name] = {};
      }
      return this.stages[name];
    };
    /**
     * a collection of objects recording the changes applied through a commmitStage
     */
    Collection.prototype.commitLog = [];

    /**
     * create a copy of an object and insert it into a stage
     */
    Collection.prototype.stage = function (stageName, obj) {
      var copy = JSON.parse(JSON.stringify(obj));
      this.getStage(stageName)[obj.$loki] = copy;
      return copy;
    };

    /**
     * re-attach all objects to the original collection, so indexes and views can be rebuilt
     * then create a message to be inserted in the commitlog
     */
    Collection.prototype.commitStage = function (stageName, message) {
      var stage = this.getStage(stageName),
        prop,
        timestamp = new Date().getTime();

      for (prop in stage) {

        this.update(stage[prop]);
        this.commitLog.push({
          timestamp: timestamp,
          message: message,
          data: JSON.parse(JSON.stringify(stage[prop]))
        });
      }
      this.stages[stageName] = {};
    };

    Collection.prototype.no_op = function () {
      return;
    };

    Collection.prototype.extract = function (field) {
      var i = 0,
        len = this.data.length,
        isDotNotation = isDeepProperty(field),
        result = [];
      for (i; i < len; i += 1) {
        result.push(deepProperty(this.data[i], field, isDotNotation));
      }
      return result;
    };

    Collection.prototype.max = function (field) {
      return Math.max.apply(null, this.extract(field));
    };

    Collection.prototype.min = function (field) {
      return Math.min.apply(null, this.extract(field));
    };

    Collection.prototype.maxRecord = function (field) {
      var i = 0,
        len = this.data.length,
        deep = isDeepProperty(field),
        result = {
          index: 0,
          value: undefined
        },
        max;

      for (i; i < len; i += 1) {
        if (max !== undefined) {
          if (max < deepProperty(this.data[i], field, deep)) {
            max = deepProperty(this.data[i], field, deep);
            result.index = this.data[i].$loki;
          }
        } else {
          max = deepProperty(this.data[i], field, deep);
          result.index = this.data[i].$loki;
        }
      }
      result.value = max;
      return result;
    };

    Collection.prototype.minRecord = function (field) {
      var i = 0,
        len = this.data.length,
        deep = isDeepProperty(field),
        result = {
          index: 0,
          value: undefined
        },
        min;

      for (i; i < len; i += 1) {
        if (min !== undefined) {
          if (min > deepProperty(this.data[i], field, deep)) {
            min = deepProperty(this.data[i], field, deep);
            result.index = this.data[i].$loki;
          }
        } else {
          min = deepProperty(this.data[i], field, deep);
          result.index = this.data[i].$loki;
        }
      }
      result.value = min;
      return result;
    };

    Collection.prototype.extractNumerical = function (field) {
      return this.extract(field).map(parseBase10).filter(Number).filter(function (n) {
        return !(isNaN(n));
      });
    };

    Collection.prototype.avg = function (field) {
      return average(this.extractNumerical(field));
    };

    Collection.prototype.stdDev = function (field) {
      return standardDeviation(this.extractNumerical(field));
    };

    Collection.prototype.mode = function (field) {
      var dict = {},
        data = this.extract(field);
      data.forEach(function (obj) {
        if (dict[obj]) {
          dict[obj] += 1;
        } else {
          dict[obj] = 1;
        }
      });
      var max,
        prop, mode;
      for (prop in dict) {
        if (max) {
          if (max < dict[prop]) {
            mode = prop;
          }
        } else {
          mode = prop;
          max = dict[prop];
        }
      }
      return mode;
    };

    Collection.prototype.median = function (field) {
      var values = this.extractNumerical(field);
      values.sort(sub);

      var half = Math.floor(values.length / 2);

      if (values.length % 2) {
        return values[half];
      } else {
        return (values[half - 1] + values[half]) / 2.0;
      }
    };

    /**
     * General utils, including statistical functions
     */
    function isDeepProperty(field) {
      return field.indexOf('.') !== -1;
    }

    function parseBase10(num) {
      return parseFloat(num, 10);
    }

    function isNotUndefined(obj) {
      return obj !== undefined;
    }

    function add(a, b) {
      return a + b;
    }

    function sub(a, b) {
      return a - b;
    }

    function median(values) {
      values.sort(sub);
      var half = Math.floor(values.length / 2);
      return (values.length % 2) ? values[half] : ((values[half - 1] + values[half]) / 2.0);
    }

    function average(array) {
      return (array.reduce(add, 0)) / array.length;
    }

    function standardDeviation(values) {
      var avg = average(values);
      var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
      });

      var avgSquareDiff = average(squareDiffs);

      var stdDev = Math.sqrt(avgSquareDiff);
      return stdDev;
    }

    function deepProperty(obj, property, isDeep) {
      if (isDeep === false) {
        // pass without processing
        return obj[property];
      }
      var pieces = property.split('.'),
        root = obj;
      while (pieces.length > 0) {
        root = root[pieces.shift()];
      }
      return root;
    }

    function binarySearch(array, item, fun) {
      var lo = 0,
        hi = array.length,
        compared,
        mid;
      while (lo < hi) {
        mid = ((lo + hi) / 2) | 0;
        compared = fun.apply(null, [item, array[mid]]);
        if (compared === 0) {
          return {
            found: true,
            index: mid
          };
        } else if (compared < 0) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      return {
        found: false,
        index: hi
      };
    }

    function BSonSort(fun) {
      return function (array, item) {
        return binarySearch(array, item, fun);
      };
    }

    function KeyValueStore() {}

    KeyValueStore.prototype = {
      keys: [],
      values: [],
      sort: function (a, b) {
        return (a < b) ? -1 : ((a > b) ? 1 : 0);
      },
      setSort: function (fun) {
        this.bs = new BSonSort(fun);
      },
      bs: function () {
        return new BSonSort(this.sort);
      },
      set: function (key, value) {
        var pos = this.bs(this.keys, key);
        if (pos.found) {
          this.values[pos.index] = value;
        } else {
          this.keys.splice(pos.index, 0, key);
          this.values.splice(pos.index, 0, value);
        }
      },
      get: function (key) {
        return this.values[binarySearch(this.keys, key, this.sort).index];
      }
    };

    function UniqueIndex(uniqueField) {
      this.field = uniqueField;
      this.keyMap = {};
      this.lokiMap = {};
    }
    UniqueIndex.prototype.keyMap = {};
    UniqueIndex.prototype.lokiMap = {};
    UniqueIndex.prototype.set = function (obj) {
      if (obj[this.field] !== null && typeof (obj[this.field]) !== 'undefined') {
        if (this.keyMap[obj[this.field]]) {
          throw new Error('Duplicate key for property ' + this.field + ': ' + obj[this.field]);
        } else {
          this.keyMap[obj[this.field]] = obj;
          this.lokiMap[obj.$loki] = obj[this.field];
        }
      }
    };
    UniqueIndex.prototype.get = function (key) {
      return this.keyMap[key];
    };

    UniqueIndex.prototype.byId = function (id) {
      return this.keyMap[this.lokiMap[id]];
    };
    UniqueIndex.prototype.update = function (obj) {
      if (this.lokiMap[obj.$loki] !== obj[this.field]) {
        var old = this.lokiMap[obj.$loki];
        this.set(obj);
        // make the old key fail bool test, while avoiding the use of delete (mem-leak prone)
        this.keyMap[old] = undefined;
      } else {
        this.keyMap[obj[this.field]] = obj;
      }
    };
    UniqueIndex.prototype.remove = function (key) {
      var obj = this.keyMap[key];
      if (obj !== null && typeof obj !== 'undefined') {
        this.keyMap[key] = undefined;
        this.lokiMap[obj.$loki] = undefined;
      } else {
        throw new Error('Key is not in unique index: ' + this.field);
      }
    };
    UniqueIndex.prototype.clear = function () {
      this.keyMap = {};
      this.lokiMap = {};
    };

    function ExactIndex(exactField) {
      this.index = {};
      this.field = exactField;
    }

    // add the value you want returned to the key in the index
    ExactIndex.prototype = {
      set: function add(key, val) {
        if (this.index[key]) {
          this.index[key].push(val);
        } else {
          this.index[key] = [val];
        }
      },

      // remove the value from the index, if the value was the last one, remove the key
      remove: function remove(key, val) {
        var idxSet = this.index[key];
        for (var i in idxSet) {
          if (idxSet[i] == val) {
            idxSet.splice(i, 1);
          }
        }
        if (idxSet.length < 1) {
          this.index[key] = undefined;
        }
      },

      // get the values related to the key, could be more than one
      get: function get(key) {
        return this.index[key];
      },

      // clear will zap the index
      clear: function clear(key) {
        this.index = {};
      }
    };

    function SortedIndex(sortedField) {
      this.field = sortedField;
    }

    SortedIndex.prototype = {
      keys: [],
      values: [],
      // set the default sort
      sort: function (a, b) {
        return (a < b) ? -1 : ((a > b) ? 1 : 0);
      },
      bs: function () {
        return new BSonSort(this.sort);
      },
      // and allow override of the default sort
      setSort: function (fun) {
        this.bs = new BSonSort(fun);
      },
      // add the value you want returned  to the key in the index
      set: function (key, value) {
        var pos = binarySearch(this.keys, key, this.sort);
        if (pos.found) {
          this.values[pos.index].push(value);
        } else {
          this.keys.splice(pos.index, 0, key);
          this.values.splice(pos.index, 0, [value]);
        }
      },
      // get all values which have a key == the given key
      get: function (key) {
        var bsr = binarySearch(this.keys, key, this.sort);
        if (bsr.found) {
          return this.values[bsr.index];
        } else {
          return [];
        }
      },
      // get all values which have a key < the given key
      getLt: function (key) {
        var bsr = binarySearch(this.keys, key, this.sort);
        var pos = bsr.index;
        if (bsr.found) pos--;
        return this.getAll(key, 0, pos);
      },
      // get all values which have a key > the given key
      getGt: function (key) {
        var bsr = binarySearch(this.keys, key, this.sort);
        var pos = bsr.index;
        if (bsr.found) pos++;
        return this.getAll(key, pos, this.keys.length);
      },

      // get all vals from start to end
      getAll: function (key, start, end) {
        var results = [];
        for (var i = start; i < end; i++) {
          results = results.concat(this.values[i]);
        }
        return results;
      },
      // just in case someone wants to do something smart with ranges
      getPos: function (key) {
        return binarySearch(this.keys, key, this.sort);
      },
      // remove the value from the index, if the value was the last one, remove the key
      remove: function (key, value) {
        var pos = binarySearch(this.keys, key, this.sort).index;
        var idxSet = this.values[pos];
        for (var i in idxSet) {
          if (idxSet[i] == value) idxSet.splice(i, 1);
        }
        if (idxSet.length < 1) {
          this.keys.splice(pos, 1);
          this.values.splice(pos, 1);
        }
      },
      // clear will zap the index
      clear: function () {
        this.keys = [];
        this.values = [];
      }
    };


    Loki.Collection = Collection;
    Loki.KeyValueStore = KeyValueStore;
    return Loki;
  }());

}));

/*
  Loki Angular Adapter (need to include this script to use it)
 * @author Joe Minichino <joe.minichino@gmail.com>
 *
 * A lightweight document oriented javascript database
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['angular', 'lokijs'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.lokiAngular = factory(
            root.angular,
            // Use thirdParty.loki if available to cover all legacy cases
            root.thirdParty && root.thirdParty.loki ?
            root.thirdParty.loki : root.loki
        );
    }
}(this, function (angular, lokijs) {
    var module = angular.module('lokijs', [])
        .factory('Loki', Loki)
        .service('Lokiwork', Lokiwork);

    function Loki() {
        return loki;
    }
    Lokiwork.$inject = ['Loki', '$q', '$injector', '$window'];

    function Lokiwork(Loki, $q, $injector, $window) {
        var vm = this;
        vm.checkStates = checkStates;
        var statesChecked = false;
        var db;
        var userDbPreference = '';
        var userPrefJsonFile = 0;
        var numOfJsonDatabases = 0;
        var dbitems = [];
        var lokidbs = [];
        vm.dbExists = dbExists;
        vm.closeDb = closeDb;
        vm.closeAllDbs = closeAllDbs;
        vm.getCollection = getCollection;
        vm.addCollection = addCollection;
        vm.removeCollection = removeCollection;
        vm.getDoc = getDoc;
        vm.updateDoc = updateDoc;
        vm.updateCurrentDoc = updateCurrentDoc;
        vm.setCurrentDoc = setCurrentDoc;
        vm.getCurrentDoc = getCurrentDoc;
        vm.deleteDocument = deleteDocument;
        vm.deleteCurrentDoc = deleteCurrentDoc;
        vm.deleteDatabase = deleteDatbase;
        vm.addDocument = addDocument;
        vm.insertItemInDoc = insertItemInDoc;
        var currentDoc = {};
        var currentColl = {};
        numOfJsonDatabases = getNumberOfJsonDatabases();

        function getCurrentDoc() {
            return currentDoc;
        }

        function deleteDatbase(data) {
            localStorage.removeItem(data);
        }

        function deleteDocument(dbName, collName, doc) { //doc should be in {name:value} format 
            return $q(function (resolve, reject) {
                userDbPreference = dbName;
                _getem('delete_doc', dbName, collName, doc)
                    .then(function (data) {
                        currentDoc = {};
                        resolve(data);
                    }, function(data){
                            reject(data);
                        });
            });
        }


        function insertItemInDoc(item) {
            return $q(function (resolve, reject) {
                _getem('insert_item_in_doc', currentDoc.dbName, currentDoc.collName, currentDoc.doc, "", item)
                    .then(function (data) {
                        resolve(data);
                    }, function (data) {
                        reject(data);
                    });
            });
        }

        function deleteCurrentDoc() {
            return $q(function (resolve, reject) {
                _getem('delete_current_doc')
                    .then(function (data) {
                        resolve(data);
                    }, function (data) {
                        reject(data);
                    });
            });
        }

        function addDocument(dbName, collName, newDoc) {
            return $q(function (resolve, reject) {
                userDbPreference = dbName;
                _getem('create_doc', dbName, collName, "", "", newDoc)
                    .then(function (data) {
                        currentDoc.dbName = dbName;
                        currentDoc.collName = collName;
                        currentDoc.doc = data;
                        currentDoc.lokiNum = data[0].$loki;
                        resolve(data[0]);
                    }, function(data){
                            reject(data);
                        });
            });
        }

        function setCurrentDoc(dbName, collName, docName) {
            return $q(function (resolve, reject) {
                userDbPreference = dbName;
                _getem('set_doc', dbName, collName, docName)
                    .then(function (data) {
                        currentDoc.dbName = dbName;
                        currentDoc.collName = collName;
                        currentDoc.doc = data;
                        currentDoc.lokiNum = data[0].$loki;
                        resolve(data[0]);
                    }, function(data){
                            reject(data);
                        });
            });
        }

        function updateCurrentDoc(thekey, thevalue) {
            return $q(function (resolve, reject) {
                if (currentDoc) {
                    _getem('update_current_doc', currentDoc.dbName, currentDoc.collName, currentDoc.doc, thekey, thevalue)
                        .then(function (data) {
                            resolve(data[0]);
                        }, function(data){
                            reject(data);
                        });
                } else {
                    reject("you have to set a current doc first, use: setCurrentDoc(dbName, collName, docName)");
                }
            });
        }

        function updateDoc(dbName, collName, docName, thekey, thevalue) {
            return $q(function (resolve, reject) {
                userDbPreference = dbName;
                if (currentDoc) {
                    _getem('update_doc', dbName, collName, docName, thekey, thevalue)
                        .then(function (data) {
                            resolve(data[0]);
                        }, function(data){
                            reject(data);
                        });
                } else {
                    reject("bad, check parameters)");
                }
            });
        }

        function getDoc(dbName, collName, docName) {
            return $q(function (resolve, reject) {
                userDbPreference = dbName;
                _getem('get_doc', dbName, collName, docName)
                    .then(function (data) {
                        currentDoc.dbName = dbName;
                        currentDoc.collName = collName;
                        currentDoc.doc = data;
                        currentDoc.lokiNum = data[0].$loki;
                        resolve(data[0]);
                    }, function(data){
                            reject(data);
                        });
            });
        }

        function getCollection(dbName, collName) {
            return $q(function (resolve, reject) {
                userDbPreference = dbName;
                _getem('get_collection', dbName, collName)
                    .then(function (data) {
                        currentColl.dbName = dbName;
                        currentColl.collName = collName;
                        resolve(data);
                    }, function(data){
                            reject(data);
                        });
            });
        }

        function removeCollection(dbName, collName) {
            return $q(function (resolve, reject) {
                userDbPreference = dbName;
                _getem('remove_collection', dbName, collName)
                    .then(function (data) {
                        currentColl = {};
                        resolve(data);
                    }, function(data){
                            reject(data);
                        });
            });
        }

        function addCollection(collData) {
            return $q(function (resolve, reject) {
                var dbobj = breakdown_components(collData);
                userDbPreference = collData[dbobj.db];
                _getem('add_collection', userDbPreference, '', '', '', collData)
                    .then(function (data) {
                        currentColl.dbName = userDbPreference;
                        resolve(data);
                    }, function(data){
                            reject(data);
                        });
            });
        }

        function _getem(operation, dbName, collName, docName, thekey, thevalue) {
            return $q(function (resolve, reject) {
                if (db) {
                    if (db.filename === dbName) {
                        getdata();
                    } else {
                        loadDb(dbName)
                            .then(function () {
                                getdata();
                            });
                    }
                } else {
                    if (statesChecked) {
                        loadDb(dbName)
                            .then(function () {
                                getdata();
                            });
                    } else {
                        checkStates().then(function () {
                            getdata();
                        }, function(data){
                            reject(data);
                        });
                    }
                }
                
                

                function getdata() {
                    var found;

                    if (operation === 'update_doc' || operation === 'insert_item_in_doc') {
                        db.loadDatabase(dbName);
                        var coll = db.getCollection(collName);
                        
                        //docName is not simply a docname, this is an object like: {name: 'user settings'}
                        for(var i in docName) {
                            currentDoc.key = i;
                            currentDoc.value = docName[i];
                        }
                        for (var x = 0; x < coll.data.length; x++){
                            if (coll.data[x][currentDoc.key] === currentDoc.value){
                                currentDoc.lokiNum = coll.data[x].$loki;
                            }
                        }
                        found = coll.get(parseInt(currentDoc.lokiNum, 10));

                        if (operation === 'update_doc') {
                            found[thekey] = thevalue;
                            coll.update(found);
                        } else {
                            found.insert(thevalue);
                        }
                        db.save();
                        resolve(true);
                    }
                    else if(operation === 'update_current_doc'){
                         db.loadDatabase(dbName);
                        var coll0 = db.getCollection(collName);
                        found = coll0.get(parseInt(currentDoc.lokiNum, 10));
                        found[thekey] = thevalue;
                        coll0.update(found);
                        
                        db.save();
                        resolve(true);
                    } 
                    else if (operation === 'delete_current_doc' || operation === 'delete_doc') {
                        db.loadDatabase(dbName);
                        var coll6 = db.getCollection(collName);
                        if(operation === 'delete_doc'){
                            for(var j in docName) {
                            currentDoc.key = j;
                            currentDoc.value = docName[j];
                        }
                        for (var y = 0; y < coll6.data.length; y++){
                            if (coll6.data[y][currentDoc.key] === currentDoc.value){
                                currentDoc.lokiNum = coll6.data[y].$loki;
                            }
                        }
                        }
                        coll6.remove(currentDoc.lokiNum);                        
                        db.save();
                        resolve(true);
                    }                    
                    else if (operation === 'get_doc' || operation === 'set_doc') {
                        db.loadDatabase(dbName);
                        var coll1 = db.getCollection(collName);
                        found = coll1.find(docName);
                        resolve(angular.fromJson(found));
                    } else if (operation === 'get_collection') {
                        db.loadDatabase(dbName);
                        var coll2 = db.getCollection(collName);
                        resolve(angular.fromJson(coll2));
                    } else if (operation === 'remove_collection') {
                        db.loadDatabase(dbName);
                        db.removeCollection(collName);
                        //coll = db.getCollection(collName);
                        db.save(function () {
                            resolve('collection deleted');
                        });
                    } else if (operation === 'add_collection') {
                        db.loadDatabase(dbName);
                        var dbobj = breakdown_components(thevalue);
                        
                        for (var w=0; w< dbobj.coll_array.length; w++){
                             var items = db.addCollection(thevalue[dbobj.coll_array[w].coll]);
                            items.insert(thevalue[dbobj.coll_array[w].docs]);
                        }
                        
                        db.save(function () {
                            resolve('collection(s) added');
                        });

                    } else if (operation === 'create_doc') {
                        db.loadDatabase(dbName);
                        var coll3 = db.getCollection(collName);
                        coll3.insert(thevalue);
                        db.save(function () {
                            var found = coll3.find({
                                name: thevalue.name
                            });
                            resolve(angular.fromJson(found));
                        });

                    } 
                    // _getem('delete_doc', dbName, collName, "", "", doc)
                    else if (operation === 'delete_current_doc') {
                        var coll5 = db.getCollection(currentDoc.collName);
                        if (!coll5) {
                            reject('You forgot to specify a current doc first');
                        } else {
                            coll5.remove(parseInt(currentDoc.lokiNum, 10));
                            db.save();
                            resolve(true);
                        }
                    }
                }
            });
        }

        function dbExists(databaseName) {
            var value = window.localStorage.getItem(databaseName);
            if (value) {
                return true;
            } else {
                return false;
            }
        }

        function closeAllDbs() {
            return $q(function (resolve, reject) {
                var current = 0;
                for (var x = 0; x < lokidbs.length; x++) {
                    current++;
                    lokidbs[x].close();
                    if (x === (lokidbs.length - 1)) {
                        resolve();
                    }
                }
            });
        }

        function closeDb(databaseName) {
            return $q(function (resolve, reject) {

                for (var x = 0; x < lokidbs.length; x++) {
                    if (lokidbs.filename === databaseName) {
                        lokidbs[x].close();
                        resolve();
                        break;
                    }
                }

            });
        }


        function checkStates() {
            return $q(function (resolve, reject) {
                if (dbitems.length === 0) {
                    initialiseAll().then(function () {
                        console.log('had to initialize all dbs');
                        statesChecked = true;
                        resolve();
                    }, function (data) {
                        reject(data);
                    });
                } else {
                    console.log('db list already initialized');
                    resolve();
                }
            });
        }

        function firstFewItemsOfDbList() {
            return $q(function (resolve, reject) {
                for (var x = 0; x >= 0; x++) {
                    if ($injector.has('json' + (x + 1))) {
                        var item = {};
                        var setting = $injector.get('json' + (x + 1));
                        var dbobj = breakdown_components(setting);
                        if (setting[dbobj.db] === userDbPreference) { //userDbPreference is the name
                            userPrefJsonFile = x + 1; //userPrefJsonFile is the index
                            if (x === (numOfJsonDatabases - 1)) {
                                resolve();
                            }
                        } else {
                            item.filename = dbobj.db;
                            item.json = x + 1;
                            dbitems.push(item);
                            if (x === (numOfJsonDatabases - 1)) {
                                resolve();
                            }
                        }
                    }
                    else {
                        resolve();
                        break;
                    }
                }
            });
        }

        function initialiseDbList() {
            return $q(function (resolve, reject) {                
                firstFewItemsOfDbList()
                    .then(function () {
                        if (userPrefJsonFile === 0){
                            reject('Oops!, you didn\'t specify any starting document');
                        }
                        var currentdb = $injector.get('json' + userPrefJsonFile);
                        var item = {};
                        var dbobj = breakdown_components(currentdb);
                        item.filename = dbobj.db;
                        item.json = userPrefJsonFile;
                        dbitems.push(item);
                        resolve();
                    });
            });
        }

        function getNumberOfJsonDatabases() {
            if (numOfJsonDatabases >= 1) {
                return numOfJsonDatabases;
            } else {
                for (var x = 0; x >= 0; x++) {
                    if ($injector.has('json' + (x + 1))) {
                        numOfJsonDatabases++;
                    }
                    else {
                        break;
                    }

                }
                return numOfJsonDatabases;
            }
        }

        var still_running = false;
        var current_iteration = 1;

        function initialiseAll() {
            return $q(function (resolve, reject) {
                initialiseDbList()
                    .then(function () {

                        function iterate_me() {
                            if ($injector.has('json' + dbitems[current_iteration - 1].json)) {
                                var setting = $injector.get('json' + dbitems[current_iteration - 1].json);

                                console.log('number = ' + current_iteration);
                                var set = angular.fromJson(setting);
                                still_running = true;
                                initiateDb(set)
                                    .then(function () {
                                        //lokidbs.push(angular.copy(db));
                                        if (!doesDBAlreadyExistInArray(db.filename)) {
                                            lokidbs.push(angular.copy(db));
                                        }
                                        still_running = false;
                                        if (current_iteration === (dbitems.length)) {
                                            resolve();
                                        } else {
                                            current_iteration++;
                                            iterate_me();
                                            return;
                                        }
                                    });
                            }
                        }
                        iterate_me();
                    }, function(data){
                        reject(data);
                    });
            });
        }

        function doesDBAlreadyExistInArray(dbname) {
            var answer = false;
            for (var x = 0; x < lokidbs.length; x++) {
                if (lokidbs[x].filename === dbname) {
                    answer = true;
                }
            }
            return answer;
        }

        function getIndexOfDbItem(dbname) {
            var answer = -1;
            for (var x = 0; x < numOfJsonDatabases; x++) {
                if (dbitems[x].filename === dbname) {
                    answer = x;
                }
            }
            return answer;
        }

        function loadDb(databaseName) {
            return $q(function (resolve, reject) {
                for (var x = 0; x < lokidbs.length; x++) {
                    if (lokidbs[x].filename === databaseName) {
                        db = lokidbs[x];
                        resolve();
                    }
                }
            });
        }



        function initiateDb(database) {
            return $q(function (resolve, reject) {
                var dbobj = breakdown_components(database);
                var db_does_exist = false;
                if (dbExists(database[dbobj.db])) {
                    db_does_exist = true;
                }
                db = new loki(database[dbobj.db], {
                    autoload: true,
                    autoloadCallback: loadHandler, //loadHandler, //for some reason this has to be called like this
                    autosave: true,
                    autosaveInterval: 10000
                });

                function loadHandler() {
                    if (db_does_exist) {

                        resolve();
                    } else {
                        var dbobj = breakdown_components(database);
                        for(var x = 0; x < dbobj.coll_array.length; x++){
                            var items = db.addCollection(database[dbobj.coll_array[x].coll]);
                            items.insert(database[dbobj.coll_array[x].docs]);
                        }
                        db.save();
                        resolve();
                    }
                }
            });
        }
        function breakdown_components(db_obj){
              var iterate = 1;
              var db_id = '';
              var coll_id = "";
              var doc_id = "";
              var collections = [];
              for(var i in db_obj){
                  if (iterate > 1){
                      if(isEven(iterate)){
                        coll_id = i;
                      }
                      else{
                          doc_id = i; 
                          var tempobj = {coll: coll_id, docs: doc_id};
                          collections.push(tempobj);
                      }                   
                  }
                  else {
                      db_id = i;
                  }
                  iterate ++;
              }
              
              var dataobj = {db: db_id, coll_array: collections};
              return dataobj;
        }
        function isEven(n) {
            return n % 2 === 0;
        }
        function isOdd(n) {
            return Boolean(n % 2);
        }
    }
    return module;
}));

(function() {

  var debug = false;

  var root = this;

  var EXIF = function(obj) {
    if (obj instanceof EXIF) return obj;
    if (!(this instanceof EXIF)) return new EXIF(obj);
    this.EXIFwrapped = obj;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = EXIF;
    }
    exports.EXIF = EXIF;
  } else {
    root.EXIF = EXIF;
  }

  var ExifTags = EXIF.Tags = {

    // version tags
    0x9000 : "ExifVersion",             // EXIF version
    0xA000 : "FlashpixVersion",         // Flashpix format version

    // colorspace tags
    0xA001 : "ColorSpace",              // Color space information tag

    // image configuration
    0xA002 : "PixelXDimension",         // Valid width of meaningful image
    0xA003 : "PixelYDimension",         // Valid height of meaningful image
    0x9101 : "ComponentsConfiguration", // Information about channels
    0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

    // user information
    0x927C : "MakerNote",               // Any desired information written by the manufacturer
    0x9286 : "UserComment",             // Comments by user

    // related file
    0xA004 : "RelatedSoundFile",        // Name of related sound file

    // date and time
    0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
    0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
    0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
    0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
    0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

    // picture-taking conditions
    0x829A : "ExposureTime",            // Exposure time (in seconds)
    0x829D : "FNumber",                 // F number
    0x8822 : "ExposureProgram",         // Exposure program
    0x8824 : "SpectralSensitivity",     // Spectral sensitivity
    0x8827 : "ISOSpeedRatings",         // ISO speed rating
    0x8828 : "OECF",                    // Optoelectric conversion factor
    0x9201 : "ShutterSpeedValue",       // Shutter speed
    0x9202 : "ApertureValue",           // Lens aperture
    0x9203 : "BrightnessValue",         // Value of brightness
    0x9204 : "ExposureBias",            // Exposure bias
    0x9205 : "MaxApertureValue",        // Smallest F number of lens
    0x9206 : "SubjectDistance",         // Distance to subject in meters
    0x9207 : "MeteringMode",            // Metering mode
    0x9208 : "LightSource",             // Kind of light source
    0x9209 : "Flash",                   // Flash status
    0x9214 : "SubjectArea",             // Location and area of main subject
    0x920A : "FocalLength",             // Focal length of the lens in mm
    0xA20B : "FlashEnergy",             // Strobe energy in BCPS
    0xA20C : "SpatialFrequencyResponse",    //
    0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
    0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
    0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
    0xA214 : "SubjectLocation",         // Location of subject in image
    0xA215 : "ExposureIndex",           // Exposure index selected on camera
    0xA217 : "SensingMethod",           // Image sensor type
    0xA300 : "FileSource",              // Image source (3 == DSC)
    0xA301 : "SceneType",               // Scene type (1 == directly photographed)
    0xA302 : "CFAPattern",              // Color filter array geometric pattern
    0xA401 : "CustomRendered",          // Special processing
    0xA402 : "ExposureMode",            // Exposure mode
    0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
    0xA404 : "DigitalZoomRation",       // Digital zoom ratio
    0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
    0xA406 : "SceneCaptureType",        // Type of scene
    0xA407 : "GainControl",             // Degree of overall image gain adjustment
    0xA408 : "Contrast",                // Direction of contrast processing applied by camera
    0xA409 : "Saturation",              // Direction of saturation processing applied by camera
    0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
    0xA40B : "DeviceSettingDescription",    //
    0xA40C : "SubjectDistanceRange",    // Distance to subject

    // other tags
    0xA005 : "InteroperabilityIFDPointer",
    0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
  };

  var TiffTags = EXIF.TiffTags = {
    0x0100 : "ImageWidth",
    0x0101 : "ImageHeight",
    0x8769 : "ExifIFDPointer",
    0x8825 : "GPSInfoIFDPointer",
    0xA005 : "InteroperabilityIFDPointer",
    0x0102 : "BitsPerSample",
    0x0103 : "Compression",
    0x0106 : "PhotometricInterpretation",
    0x0112 : "Orientation",
    0x0115 : "SamplesPerPixel",
    0x011C : "PlanarConfiguration",
    0x0212 : "YCbCrSubSampling",
    0x0213 : "YCbCrPositioning",
    0x011A : "XResolution",
    0x011B : "YResolution",
    0x0128 : "ResolutionUnit",
    0x0111 : "StripOffsets",
    0x0116 : "RowsPerStrip",
    0x0117 : "StripByteCounts",
    0x0201 : "JPEGInterchangeFormat",
    0x0202 : "JPEGInterchangeFormatLength",
    0x012D : "TransferFunction",
    0x013E : "WhitePoint",
    0x013F : "PrimaryChromaticities",
    0x0211 : "YCbCrCoefficients",
    0x0214 : "ReferenceBlackWhite",
    0x0132 : "DateTime",
    0x010E : "ImageDescription",
    0x010F : "Make",
    0x0110 : "Model",
    0x0131 : "Software",
    0x013B : "Artist",
    0x8298 : "Copyright"
  };

  var GPSTags = EXIF.GPSTags = {
    0x0000 : "GPSVersionID",
    0x0001 : "GPSLatitudeRef",
    0x0002 : "GPSLatitude",
    0x0003 : "GPSLongitudeRef",
    0x0004 : "GPSLongitude",
    0x0005 : "GPSAltitudeRef",
    0x0006 : "GPSAltitude",
    0x0007 : "GPSTimeStamp",
    0x0008 : "GPSSatellites",
    0x0009 : "GPSStatus",
    0x000A : "GPSMeasureMode",
    0x000B : "GPSDOP",
    0x000C : "GPSSpeedRef",
    0x000D : "GPSSpeed",
    0x000E : "GPSTrackRef",
    0x000F : "GPSTrack",
    0x0010 : "GPSImgDirectionRef",
    0x0011 : "GPSImgDirection",
    0x0012 : "GPSMapDatum",
    0x0013 : "GPSDestLatitudeRef",
    0x0014 : "GPSDestLatitude",
    0x0015 : "GPSDestLongitudeRef",
    0x0016 : "GPSDestLongitude",
    0x0017 : "GPSDestBearingRef",
    0x0018 : "GPSDestBearing",
    0x0019 : "GPSDestDistanceRef",
    0x001A : "GPSDestDistance",
    0x001B : "GPSProcessingMethod",
    0x001C : "GPSAreaInformation",
    0x001D : "GPSDateStamp",
    0x001E : "GPSDifferential"
  };

  var StringValues = EXIF.StringValues = {
    ExposureProgram : {
      0 : "Not defined",
      1 : "Manual",
      2 : "Normal program",
      3 : "Aperture priority",
      4 : "Shutter priority",
      5 : "Creative program",
      6 : "Action program",
      7 : "Portrait mode",
      8 : "Landscape mode"
    },
    MeteringMode : {
      0 : "Unknown",
      1 : "Average",
      2 : "CenterWeightedAverage",
      3 : "Spot",
      4 : "MultiSpot",
      5 : "Pattern",
      6 : "Partial",
      255 : "Other"
    },
    LightSource : {
      0 : "Unknown",
      1 : "Daylight",
      2 : "Fluorescent",
      3 : "Tungsten (incandescent light)",
      4 : "Flash",
      9 : "Fine weather",
      10 : "Cloudy weather",
      11 : "Shade",
      12 : "Daylight fluorescent (D 5700 - 7100K)",
      13 : "Day white fluorescent (N 4600 - 5400K)",
      14 : "Cool white fluorescent (W 3900 - 4500K)",
      15 : "White fluorescent (WW 3200 - 3700K)",
      17 : "Standard light A",
      18 : "Standard light B",
      19 : "Standard light C",
      20 : "D55",
      21 : "D65",
      22 : "D75",
      23 : "D50",
      24 : "ISO studio tungsten",
      255 : "Other"
    },
    Flash : {
      0x0000 : "Flash did not fire",
      0x0001 : "Flash fired",
      0x0005 : "Strobe return light not detected",
      0x0007 : "Strobe return light detected",
      0x0009 : "Flash fired, compulsory flash mode",
      0x000D : "Flash fired, compulsory flash mode, return light not detected",
      0x000F : "Flash fired, compulsory flash mode, return light detected",
      0x0010 : "Flash did not fire, compulsory flash mode",
      0x0018 : "Flash did not fire, auto mode",
      0x0019 : "Flash fired, auto mode",
      0x001D : "Flash fired, auto mode, return light not detected",
      0x001F : "Flash fired, auto mode, return light detected",
      0x0020 : "No flash function",
      0x0041 : "Flash fired, red-eye reduction mode",
      0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
      0x0047 : "Flash fired, red-eye reduction mode, return light detected",
      0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
      0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
      0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
      0x0059 : "Flash fired, auto mode, red-eye reduction mode",
      0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
      0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
    },
    SensingMethod : {
      1 : "Not defined",
      2 : "One-chip color area sensor",
      3 : "Two-chip color area sensor",
      4 : "Three-chip color area sensor",
      5 : "Color sequential area sensor",
      7 : "Trilinear sensor",
      8 : "Color sequential linear sensor"
    },
    SceneCaptureType : {
      0 : "Standard",
      1 : "Landscape",
      2 : "Portrait",
      3 : "Night scene"
    },
    SceneType : {
      1 : "Directly photographed"
    },
    CustomRendered : {
      0 : "Normal process",
      1 : "Custom process"
    },
    WhiteBalance : {
      0 : "Auto white balance",
      1 : "Manual white balance"
    },
    GainControl : {
      0 : "None",
      1 : "Low gain up",
      2 : "High gain up",
      3 : "Low gain down",
      4 : "High gain down"
    },
    Contrast : {
      0 : "Normal",
      1 : "Soft",
      2 : "Hard"
    },
    Saturation : {
      0 : "Normal",
      1 : "Low saturation",
      2 : "High saturation"
    },
    Sharpness : {
      0 : "Normal",
      1 : "Soft",
      2 : "Hard"
    },
    SubjectDistanceRange : {
      0 : "Unknown",
      1 : "Macro",
      2 : "Close view",
      3 : "Distant view"
    },
    FileSource : {
      3 : "DSC"
    },

    Components : {
      0 : "",
      1 : "Y",
      2 : "Cb",
      3 : "Cr",
      4 : "R",
      5 : "G",
      6 : "B"
    }
  };

  function addEvent(element, event, handler) {
    if (element.addEventListener) {
      element.addEventListener(event, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + event, handler);
    }
  }

  function imageHasData(img) {
    return !!(img.exifdata);
  }


  function base64ToArrayBuffer(base64, contentType) {
    contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  function objectURLToBlob(url, callback) {
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.responseType = "blob";
    http.onload = function(e) {
      if (this.status == 200 || this.status === 0) {
        callback(this.response);
      }
    };
    http.send();
  }

  function getImageData(img, callback) {
    function handleBinaryFile(binFile) {
      var data = findEXIFinJPEG(binFile);
      var iptcdata = findIPTCinJPEG(binFile);
      img.exifdata = data || {};
      img.iptcdata = iptcdata || {};
      if (callback) {
        callback.call(img);
      }
    }

    if (img.src) {
      if (/^data\:/i.test(img.src)) { // Data URI
        var arrayBuffer = base64ToArrayBuffer(img.src);
        handleBinaryFile(arrayBuffer);

      } else if (/^blob\:/i.test(img.src)) { // Object URL
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
          handleBinaryFile(e.target.result);
        };
        objectURLToBlob(img.src, function (blob) {
          fileReader.readAsArrayBuffer(blob);
        });
      } else {
        var http = new XMLHttpRequest();
        http.onload = function() {
          if (this.status == 200 || this.status === 0) {
            handleBinaryFile(http.response);
          } else {
            throw "Could not load image";
          }
          http = null;
        };
        http.open("GET", img.src, true);
        http.responseType = "arraybuffer";
        http.send(null);
      }
    } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
      var fileReader = new FileReader();
      fileReader.onload = function(e) {
        if (debug) console.log("Got file of length " + e.target.result.byteLength);
        handleBinaryFile(e.target.result);
      };

      fileReader.readAsArrayBuffer(img);
    }
  }

  function findEXIFinJPEG(file) {
    var dataView = new DataView(file);

    if (debug) console.log("Got file of length " + file.byteLength);
    if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
      if (debug) console.log("Not a valid JPEG");
      return false; // not a valid jpeg
    }

    var offset = 2,
      length = file.byteLength,
      marker;

    while (offset < length) {
      if (dataView.getUint8(offset) != 0xFF) {
        if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
        return false; // not a valid marker, something is wrong
      }

      marker = dataView.getUint8(offset + 1);
      if (debug) console.log(marker);

      // we could implement handling for other markers here,
      // but we're only looking for 0xFFE1 for EXIF data

      if (marker == 225) {
        if (debug) console.log("Found 0xFFE1 marker");

        return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

        // offset += 2 + file.getShortAt(offset+2, true);

      } else {
        offset += 2 + dataView.getUint16(offset+2);
      }

    }

  }

  function findIPTCinJPEG(file) {
    var dataView = new DataView(file);

    if (debug) console.log("Got file of length " + file.byteLength);
    if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
      if (debug) console.log("Not a valid JPEG");
      return false; // not a valid jpeg
    }

    var offset = 2,
      length = file.byteLength;


    var isFieldSegmentStart = function(dataView, offset){
      return (
        dataView.getUint8(offset) === 0x38 &&
        dataView.getUint8(offset+1) === 0x42 &&
        dataView.getUint8(offset+2) === 0x49 &&
        dataView.getUint8(offset+3) === 0x4D &&
        dataView.getUint8(offset+4) === 0x04 &&
        dataView.getUint8(offset+5) === 0x04
      );
    };

    while (offset < length) {

      if ( isFieldSegmentStart(dataView, offset )){

        // Get the length of the name header (which is padded to an even number of bytes)
        var nameHeaderLength = dataView.getUint8(offset+7);
        if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
        // Check for pre photoshop 6 format
        if(nameHeaderLength === 0) {
          // Always 4
          nameHeaderLength = 4;
        }

        var startOffset = offset + 8 + nameHeaderLength;
        var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

        return readIPTCData(file, startOffset, sectionLength);

        break;

      }


      // Not the marker, continue searching
      offset++;

    }

  }
  var IptcFieldMap = {
    0x78 : 'caption',
    0x6E : 'credit',
    0x19 : 'keywords',
    0x37 : 'dateCreated',
    0x50 : 'byline',
    0x55 : 'bylineTitle',
    0x7A : 'captionWriter',
    0x69 : 'headline',
    0x74 : 'copyright',
    0x0F : 'category'
  };
  function readIPTCData(file, startOffset, sectionLength){
    var dataView = new DataView(file);
    var data = {};
    var fieldValue, fieldName, dataSize, segmentType, segmentSize;
    var segmentStartPos = startOffset;
    while(segmentStartPos < startOffset+sectionLength) {
      if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
        segmentType = dataView.getUint8(segmentStartPos+2);
        if(segmentType in IptcFieldMap) {
          dataSize = dataView.getInt16(segmentStartPos+3);
          segmentSize = dataSize + 5;
          fieldName = IptcFieldMap[segmentType];
          fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
          // Check if we already stored a value with this name
          if(data.hasOwnProperty(fieldName)) {
            // Value already stored with this name, create multivalue field
            if(data[fieldName] instanceof Array) {
              data[fieldName].push(fieldValue);
            }
            else {
              data[fieldName] = [data[fieldName], fieldValue];
            }
          }
          else {
            data[fieldName] = fieldValue;
          }
        }

      }
      segmentStartPos++;
    }
    return data;
  }



  function readTags(file, tiffStart, dirStart, strings, bigEnd) {
    var entries = file.getUint16(dirStart, !bigEnd),
      tags = {},
      entryOffset, tag,
      i;

    for (i=0;i<entries;i++) {
      entryOffset = dirStart + i*12 + 2;
      tag = strings[file.getUint16(entryOffset, !bigEnd)];
      if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
      tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
    }
    return tags;
  }


  function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
    var type = file.getUint16(entryOffset+2, !bigEnd),
      numValues = file.getUint32(entryOffset+4, !bigEnd),
      valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
      offset,
      vals, val, n,
      numerator, denominator;

    switch (type) {
      case 1: // byte, 8-bit unsigned int
      case 7: // undefined, 8-bit byte, value depending on field
        if (numValues == 1) {
          return file.getUint8(entryOffset + 8, !bigEnd);
        } else {
          offset = numValues > 4 ? valueOffset : (entryOffset + 8);
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getUint8(offset + n);
          }
          return vals;
        }

      case 2: // ascii, 8-bit byte
        offset = numValues > 4 ? valueOffset : (entryOffset + 8);
        return getStringFromDB(file, offset, numValues-1);

      case 3: // short, 16 bit int
        if (numValues == 1) {
          return file.getUint16(entryOffset + 8, !bigEnd);
        } else {
          offset = numValues > 2 ? valueOffset : (entryOffset + 8);
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getUint16(offset + 2*n, !bigEnd);
          }
          return vals;
        }

      case 4: // long, 32 bit int
        if (numValues == 1) {
          return file.getUint32(entryOffset + 8, !bigEnd);
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
          }
          return vals;
        }

      case 5:    // rational = two long values, first is numerator, second is denominator
        if (numValues == 1) {
          numerator = file.getUint32(valueOffset, !bigEnd);
          denominator = file.getUint32(valueOffset+4, !bigEnd);
          val = new Number(numerator / denominator);
          val.numerator = numerator;
          val.denominator = denominator;
          return val;
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
            denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
            vals[n] = new Number(numerator / denominator);
            vals[n].numerator = numerator;
            vals[n].denominator = denominator;
          }
          return vals;
        }

      case 9: // slong, 32 bit signed int
        if (numValues == 1) {
          return file.getInt32(entryOffset + 8, !bigEnd);
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
          }
          return vals;
        }

      case 10: // signed rational, two slongs, first is numerator, second is denominator
        if (numValues == 1) {
          return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
          }
          return vals;
        }
    }
  }

  function getStringFromDB(buffer, start, length) {
    var outstr = "";
    for (n = start; n < start+length; n++) {
      outstr += String.fromCharCode(buffer.getUint8(n));
    }
    return outstr;
  }

  function readEXIFData(file, start) {
    if (getStringFromDB(file, start, 4) != "Exif") {
      if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
      return false;
    }

    var bigEnd,
      tags, tag,
      exifData, gpsData,
      tiffOffset = start + 6;

    // test for TIFF validity and endianness
    if (file.getUint16(tiffOffset) == 0x4949) {
      bigEnd = false;
    } else if (file.getUint16(tiffOffset) == 0x4D4D) {
      bigEnd = true;
    } else {
      if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
      return false;
    }

    if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
      if (debug) console.log("Not valid TIFF data! (no 0x002A)");
      return false;
    }

    var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

    if (firstIFDOffset < 0x00000008) {
      if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
      return false;
    }

    tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

    if (tags.ExifIFDPointer) {
      exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
      for (tag in exifData) {
        switch (tag) {
          case "LightSource" :
          case "Flash" :
          case "MeteringMode" :
          case "ExposureProgram" :
          case "SensingMethod" :
          case "SceneCaptureType" :
          case "SceneType" :
          case "CustomRendered" :
          case "WhiteBalance" :
          case "GainControl" :
          case "Contrast" :
          case "Saturation" :
          case "Sharpness" :
          case "SubjectDistanceRange" :
          case "FileSource" :
            exifData[tag] = StringValues[tag][exifData[tag]];
            break;

          case "ExifVersion" :
          case "FlashpixVersion" :
            exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
            break;

          case "ComponentsConfiguration" :
            exifData[tag] =
              StringValues.Components[exifData[tag][0]] +
              StringValues.Components[exifData[tag][1]] +
              StringValues.Components[exifData[tag][2]] +
              StringValues.Components[exifData[tag][3]];
            break;
        }
        tags[tag] = exifData[tag];
      }
    }

    if (tags.GPSInfoIFDPointer) {
      gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
      for (tag in gpsData) {
        switch (tag) {
          case "GPSVersionID" :
            gpsData[tag] = gpsData[tag][0] +
              "." + gpsData[tag][1] +
              "." + gpsData[tag][2] +
              "." + gpsData[tag][3];
            break;
        }
        tags[tag] = gpsData[tag];
      }
    }

    return tags;
  }

  EXIF.getData = function(img, callback) {
    if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

    if (!imageHasData(img)) {
      getImageData(img, callback);
    } else {
      if (callback) {
        callback.call(img);
      }
    }
    return true;
  }

  EXIF.getTag = function(img, tag) {
    if (!imageHasData(img)) return;
    return img.exifdata[tag];
  }

  EXIF.getAllTags = function(img) {
    if (!imageHasData(img)) return {};
    var a,
      data = img.exifdata,
      tags = {};
    for (a in data) {
      if (data.hasOwnProperty(a)) {
        tags[a] = data[a];
      }
    }
    return tags;
  }

  EXIF.pretty = function(img) {
    if (!imageHasData(img)) return "";
    var a,
      data = img.exifdata,
      strPretty = "";
    for (a in data) {
      if (data.hasOwnProperty(a)) {
        if (typeof data[a] == "object") {
          if (data[a] instanceof Number) {
            strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
          } else {
            strPretty += a + " : [" + data[a].length + " values]\r\n";
          }
        } else {
          strPretty += a + " : " + data[a] + "\r\n";
        }
      }
    }
    return strPretty;
  }

  EXIF.readFromBinaryFile = function(file) {
    return findEXIFinJPEG(file);
  }

  if (typeof define === 'function' && define.amd) {
    define('exif-js', [], function() {
      return EXIF;
    });
  }
}.call(this));

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


'use strict';
angular.module('main')
.controller('MenuCtrl', function ($log) {

  $log.log('Hello from your Controller: MenuCtrl in module main:. This is your controller:', this);

});

'use strict';
angular.module('main')
  .controller('ExifCtrl', function ($scope) {

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

      vm.selectresult = 'before select my.db';
      query = 'SELECT url FROM Expense';
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

    vm.select = function () {
      //vm.selectresult = 'before select my.db';
      //var query = 'SELECT url FROM Expense';
      //$cordovaSQLite.execute(db, query).then(function (res) {
      //  if (res.rows.length > 0)
      //  {
      //    console.log('SELECTED ->' + res.rows.item(0).url);
      //    vm.selectresult = 'SELECTED' + res.rows.item(0).url;
      //  }else {
      //    vm.createresult3 = 'No results found';
      //    console.log('No results found');
      //  }
      //}, function (err) {
      //  vm.selectresult = err;
      //  console.error(err);
      //});
    };

    vm.delete = function () {
      $cordovaSQLite.deleteDB('my.db');
      vm.deleteresult = 'my.db deleted';
    };
  });



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



"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var LokiCordovaFSAdapterError = (function (_Error) {
    function LokiCordovaFSAdapterError() {
        _classCallCheck(this, LokiCordovaFSAdapterError);

        if (_Error != null) {
            _Error.apply(this, arguments);
        }
    }

    _inherits(LokiCordovaFSAdapterError, _Error);

    return LokiCordovaFSAdapterError;
})(Error);

var TAG = "[LokiCordovaFSAdapter]";

var LokiCordovaFSAdapter = (function () {
    function LokiCordovaFSAdapter(options) {
        _classCallCheck(this, LokiCordovaFSAdapter);

        this.options = options;
    }

    _createClass(LokiCordovaFSAdapter, {
        saveDatabase: {
            value: function saveDatabase(dbname, dbstring, callback) {
                var _this = this;

                console.log(TAG, "saving database");
                this._getFile(dbname, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function () {
                            if (fileWriter.length === 0) {
                                var blob = _this._createBlob(dbstring, "text/plain");
                                fileWriter.write(blob);
                                callback();
                            }
                        };
                        fileWriter.truncate(0);
                    }, function (err) {
                        console.error(TAG, "error writing file", err);
                        throw new LokiCordovaFSAdapterError("Unable to write file" + JSON.stringify(err));
                    });
                }, function (err) {
                    console.error(TAG, "error getting file", err);
                    throw new LokiCordovaFSAdapterError("Unable to get file" + JSON.stringify(err));
                });
            }
        },
        loadDatabase: {
            value: function loadDatabase(dbname, callback) {
                console.log(TAG, "loading database");

                this._getFile(dbname, function (fileEntry) {
                    alert("fileEntry fullpath " + fileEntry.fullPath);
                    fileEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function (event) {
                            var contents = event.target.result;
                            if (contents.length === 0) {
                                console.warn(TAG, "couldn't find database");
                                callback(null);
                            } else {
                                callback(contents);
                            }
                        };
                        reader.readAsText(file);
                    }, function (err) {
                        console.error(TAG, "error reading file", err);
                        alert("error reading file");
                        callback(new LokiCordovaFSAdapterError("Unable to read file" + err.message));
                    });
                }, function (err) {
                    console.error(TAG, "error getting file", err);
                    alert("error getting file");
                    callback(new LokiCordovaFSAdapterError("Unable to get file: " + err.message));
                });
            }
        },
        deleteDatabase: {
            value: function deleteDatabase(dbname, callback) {
                var _this = this;
                console.log(TAG, "delete database");
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                    var fileName = _this.options.prefix + "__" + dbname;
                    // Very important to have { create: true }
                    dir.getFile(fileName, { create: true }, function(fileEntry) {
                        fileEntry.remove(function() {
                            callback();
                        }, function (err) {
                            console.error(TAG, "error delete file", err);
                            throw new LokiCordovaFSAdapterError("Unable delete file" + JSON.stringify(err));
                        });
                    }, function (err) {
                        console.error(TAG, "error delete database", err);
                        throw new LokiCordovaFSAdapterError("Unable delete database" + JSON.stringify(err));
                    });
                }, function (err) {
                    alert("Unable to resolve local file system URL" + JSON.stringify(err));
                    throw new LokiCordovaFSAdapterError("Unable to resolve local file system URL" + JSON.stringify(err));
                });
            }
        },
        _getFile: {
            value: function _getFile(name, handleSuccess, handleError) {
                var _this = this;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                    var fileName = _this.options.prefix + "__" + name;
                    alert('fileName ' + fileName);
                    alert('cordova.file.dataDirectory ' + cordova.file.dataDirectory);
                    dir.getFile(fileName, { create: true }, handleSuccess, handleError);
                }, function (err) {
                    alert("Unable to resolve local file system URL" + JSON.stringify(err));
                    throw new LokiCordovaFSAdapterError("Unable to resolve local file system URL" + JSON.stringify(err));
                });
            }
        },
        _createBlob: {

            // adapted from http://stackoverflow.com/questions/15293694/blob-constructor-browser-compatibility

            value: function _createBlob(data, datatype) {
                var blob = undefined;

                try {
                    blob = new Blob([data], { type: datatype });
                } catch (err) {
                    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;

                    if (err.name === "TypeError" && window.BlobBuilder) {
                        var bb = new window.BlobBuilder();
                        bb.append(data);
                        blob = bb.getBlob(datatype);
                    } else if (err.name === "InvalidStateError") {
                        // InvalidStateError (tested on FF13 WinXP)
                        blob = new Blob([data], { type: datatype });
                    } else {
                        // We're screwed, blob constructor unsupported entirely
                        throw new LokiCordovaFSAdapterError("Unable to create blob" + JSON.stringify(err));
                    }
                }
                return blob;
            }
        }
    });

    return LokiCordovaFSAdapter;
})();

// Uncomment this next line to be able to do `var LokiCordovaFSAdapter = require("./loki-cordova-fs-adapter")`
//module.exports = LokiCordovaFSAdapter;

/**
 * Created by hyunwu00 on 03/02/2016.
 */
//Based on MinifyJpeg
//http://elicon.blog57.fc2.com/blog-entry-206.html

var ExifRestorer = (function()
{

  var ExifRestorer = {};

  ExifRestorer.KEY_STR = "ABCDEFGHIJKLMNOP" +
    "QRSTUVWXYZabcdef" +
    "ghijklmnopqrstuv" +
    "wxyz0123456789+/" +
    "=";

  ExifRestorer.encode64 = function(input)
  {
    var output = "",
      chr1, chr2, chr3 = "",
      enc1, enc2, enc3, enc4 = "",
      i = 0;

    do {
      chr1 = input[i++];
      chr2 = input[i++];
      chr3 = input[i++];

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        this.KEY_STR.charAt(enc1) +
        this.KEY_STR.charAt(enc2) +
        this.KEY_STR.charAt(enc3) +
        this.KEY_STR.charAt(enc4);
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
  };

  ExifRestorer.restore = function(origFileBase64, resizedFileBase64)
  {
    if (!origFileBase64.match("data:image/jpeg;base64,"))
    {
      return resizedFileBase64;
    }

    var rawImage = this.decode64(origFileBase64.replace("data:image/jpeg;base64,", ""));
    var segments = this.slice2Segments(rawImage);

    var image = this.exifManipulation(resizedFileBase64, segments);

    return this.encode64(image);

  };


  ExifRestorer.exifManipulation = function(resizedFileBase64, segments)
  {
    var exifArray = this.getExifArray(segments),
      newImageArray = this.insertExif(resizedFileBase64, exifArray),
      aBuffer = new Uint8Array(newImageArray);

    return aBuffer;
  };


  ExifRestorer.getExifArray = function(segments)
  {
    var seg;
    for (var x = 0; x < segments.length; x++)
    {
      seg = segments[x];
      if (seg[0] == 255 & seg[1] == 225) //(ff e1)
      {
        return seg;
      }
    }
    return [];
  };


  ExifRestorer.insertExif = function(resizedFileBase64, exifArray)
  {
    var imageData = resizedFileBase64.replace("data:image/jpeg;base64,", ""),
      buf = this.decode64(imageData),
      separatePoint = buf.indexOf(255,3),
      mae = buf.slice(0, separatePoint),
      ato = buf.slice(separatePoint),
      array = mae;

    array = array.concat(exifArray);
    array = array.concat(ato);
    return array;
  };



  ExifRestorer.slice2Segments = function(rawImageArray)
  {
    var head = 0,
      segments = [];

    while (1)
    {
      if (rawImageArray[head] == 255 & rawImageArray[head + 1] == 218){break;}
      if (rawImageArray[head] == 255 & rawImageArray[head + 1] == 216)
      {
        head += 2;
      }
      else
      {
        var length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3],
          endPoint = head + length + 2,
          seg = rawImageArray.slice(head, endPoint);
        segments.push(seg);
        head = endPoint;
      }
      if (head > rawImageArray.length){break;}
    }

    return segments;
  };



  ExifRestorer.decode64 = function(input)
  {
    var output = "",
      chr1, chr2, chr3 = "",
      enc1, enc2, enc3, enc4 = "",
      i = 0,
      buf = [];

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
      alert("There were invalid base64 characters in the input text.\n" +
        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
        "Expect errors in decoding.");
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    do {
      enc1 = this.KEY_STR.indexOf(input.charAt(i++));
      enc2 = this.KEY_STR.indexOf(input.charAt(i++));
      enc3 = this.KEY_STR.indexOf(input.charAt(i++));
      enc4 = this.KEY_STR.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      buf.push(chr1);

      if (enc3 != 64) {
        buf.push(chr2);
      }
      if (enc4 != 64) {
        buf.push(chr3);
      }

      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = "";

    } while (i < input.length);

    return buf;
  };


  return ExifRestorer;
})();

(function() {

  var debug = false;

  var root = this;

  var EXIF = function(obj) {
    if (obj instanceof EXIF) return obj;
    if (!(this instanceof EXIF)) return new EXIF(obj);
    this.EXIFwrapped = obj;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = EXIF;
    }
    exports.EXIF = EXIF;
  } else {
    root.EXIF = EXIF;
  }

  var ExifTags = EXIF.Tags = {

    // version tags
    0x9000 : "ExifVersion",             // EXIF version
    0xA000 : "FlashpixVersion",         // Flashpix format version

    // colorspace tags
    0xA001 : "ColorSpace",              // Color space information tag

    // image configuration
    0xA002 : "PixelXDimension",         // Valid width of meaningful image
    0xA003 : "PixelYDimension",         // Valid height of meaningful image
    0x9101 : "ComponentsConfiguration", // Information about channels
    0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

    // user information
    0x927C : "MakerNote",               // Any desired information written by the manufacturer
    0x9286 : "UserComment",             // Comments by user

    // related file
    0xA004 : "RelatedSoundFile",        // Name of related sound file

    // date and time
    0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
    0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
    0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
    0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
    0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

    // picture-taking conditions
    0x829A : "ExposureTime",            // Exposure time (in seconds)
    0x829D : "FNumber",                 // F number
    0x8822 : "ExposureProgram",         // Exposure program
    0x8824 : "SpectralSensitivity",     // Spectral sensitivity
    0x8827 : "ISOSpeedRatings",         // ISO speed rating
    0x8828 : "OECF",                    // Optoelectric conversion factor
    0x9201 : "ShutterSpeedValue",       // Shutter speed
    0x9202 : "ApertureValue",           // Lens aperture
    0x9203 : "BrightnessValue",         // Value of brightness
    0x9204 : "ExposureBias",            // Exposure bias
    0x9205 : "MaxApertureValue",        // Smallest F number of lens
    0x9206 : "SubjectDistance",         // Distance to subject in meters
    0x9207 : "MeteringMode",            // Metering mode
    0x9208 : "LightSource",             // Kind of light source
    0x9209 : "Flash",                   // Flash status
    0x9214 : "SubjectArea",             // Location and area of main subject
    0x920A : "FocalLength",             // Focal length of the lens in mm
    0xA20B : "FlashEnergy",             // Strobe energy in BCPS
    0xA20C : "SpatialFrequencyResponse",    //
    0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
    0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
    0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
    0xA214 : "SubjectLocation",         // Location of subject in image
    0xA215 : "ExposureIndex",           // Exposure index selected on camera
    0xA217 : "SensingMethod",           // Image sensor type
    0xA300 : "FileSource",              // Image source (3 == DSC)
    0xA301 : "SceneType",               // Scene type (1 == directly photographed)
    0xA302 : "CFAPattern",              // Color filter array geometric pattern
    0xA401 : "CustomRendered",          // Special processing
    0xA402 : "ExposureMode",            // Exposure mode
    0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
    0xA404 : "DigitalZoomRation",       // Digital zoom ratio
    0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
    0xA406 : "SceneCaptureType",        // Type of scene
    0xA407 : "GainControl",             // Degree of overall image gain adjustment
    0xA408 : "Contrast",                // Direction of contrast processing applied by camera
    0xA409 : "Saturation",              // Direction of saturation processing applied by camera
    0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
    0xA40B : "DeviceSettingDescription",    //
    0xA40C : "SubjectDistanceRange",    // Distance to subject

    // other tags
    0xA005 : "InteroperabilityIFDPointer",
    0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
  };

  var TiffTags = EXIF.TiffTags = {
    0x0100 : "ImageWidth",
    0x0101 : "ImageHeight",
    0x8769 : "ExifIFDPointer",
    0x8825 : "GPSInfoIFDPointer",
    0xA005 : "InteroperabilityIFDPointer",
    0x0102 : "BitsPerSample",
    0x0103 : "Compression",
    0x0106 : "PhotometricInterpretation",
    0x0112 : "Orientation",
    0x0115 : "SamplesPerPixel",
    0x011C : "PlanarConfiguration",
    0x0212 : "YCbCrSubSampling",
    0x0213 : "YCbCrPositioning",
    0x011A : "XResolution",
    0x011B : "YResolution",
    0x0128 : "ResolutionUnit",
    0x0111 : "StripOffsets",
    0x0116 : "RowsPerStrip",
    0x0117 : "StripByteCounts",
    0x0201 : "JPEGInterchangeFormat",
    0x0202 : "JPEGInterchangeFormatLength",
    0x012D : "TransferFunction",
    0x013E : "WhitePoint",
    0x013F : "PrimaryChromaticities",
    0x0211 : "YCbCrCoefficients",
    0x0214 : "ReferenceBlackWhite",
    0x0132 : "DateTime",
    0x010E : "ImageDescription",
    0x010F : "Make",
    0x0110 : "Model",
    0x0131 : "Software",
    0x013B : "Artist",
    0x8298 : "Copyright"
  };

  var GPSTags = EXIF.GPSTags = {
    0x0000 : "GPSVersionID",
    0x0001 : "GPSLatitudeRef",
    0x0002 : "GPSLatitude",
    0x0003 : "GPSLongitudeRef",
    0x0004 : "GPSLongitude",
    0x0005 : "GPSAltitudeRef",
    0x0006 : "GPSAltitude",
    0x0007 : "GPSTimeStamp",
    0x0008 : "GPSSatellites",
    0x0009 : "GPSStatus",
    0x000A : "GPSMeasureMode",
    0x000B : "GPSDOP",
    0x000C : "GPSSpeedRef",
    0x000D : "GPSSpeed",
    0x000E : "GPSTrackRef",
    0x000F : "GPSTrack",
    0x0010 : "GPSImgDirectionRef",
    0x0011 : "GPSImgDirection",
    0x0012 : "GPSMapDatum",
    0x0013 : "GPSDestLatitudeRef",
    0x0014 : "GPSDestLatitude",
    0x0015 : "GPSDestLongitudeRef",
    0x0016 : "GPSDestLongitude",
    0x0017 : "GPSDestBearingRef",
    0x0018 : "GPSDestBearing",
    0x0019 : "GPSDestDistanceRef",
    0x001A : "GPSDestDistance",
    0x001B : "GPSProcessingMethod",
    0x001C : "GPSAreaInformation",
    0x001D : "GPSDateStamp",
    0x001E : "GPSDifferential"
  };

  var StringValues = EXIF.StringValues = {
    ExposureProgram : {
      0 : "Not defined",
      1 : "Manual",
      2 : "Normal program",
      3 : "Aperture priority",
      4 : "Shutter priority",
      5 : "Creative program",
      6 : "Action program",
      7 : "Portrait mode",
      8 : "Landscape mode"
    },
    MeteringMode : {
      0 : "Unknown",
      1 : "Average",
      2 : "CenterWeightedAverage",
      3 : "Spot",
      4 : "MultiSpot",
      5 : "Pattern",
      6 : "Partial",
      255 : "Other"
    },
    LightSource : {
      0 : "Unknown",
      1 : "Daylight",
      2 : "Fluorescent",
      3 : "Tungsten (incandescent light)",
      4 : "Flash",
      9 : "Fine weather",
      10 : "Cloudy weather",
      11 : "Shade",
      12 : "Daylight fluorescent (D 5700 - 7100K)",
      13 : "Day white fluorescent (N 4600 - 5400K)",
      14 : "Cool white fluorescent (W 3900 - 4500K)",
      15 : "White fluorescent (WW 3200 - 3700K)",
      17 : "Standard light A",
      18 : "Standard light B",
      19 : "Standard light C",
      20 : "D55",
      21 : "D65",
      22 : "D75",
      23 : "D50",
      24 : "ISO studio tungsten",
      255 : "Other"
    },
    Flash : {
      0x0000 : "Flash did not fire",
      0x0001 : "Flash fired",
      0x0005 : "Strobe return light not detected",
      0x0007 : "Strobe return light detected",
      0x0009 : "Flash fired, compulsory flash mode",
      0x000D : "Flash fired, compulsory flash mode, return light not detected",
      0x000F : "Flash fired, compulsory flash mode, return light detected",
      0x0010 : "Flash did not fire, compulsory flash mode",
      0x0018 : "Flash did not fire, auto mode",
      0x0019 : "Flash fired, auto mode",
      0x001D : "Flash fired, auto mode, return light not detected",
      0x001F : "Flash fired, auto mode, return light detected",
      0x0020 : "No flash function",
      0x0041 : "Flash fired, red-eye reduction mode",
      0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
      0x0047 : "Flash fired, red-eye reduction mode, return light detected",
      0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
      0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
      0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
      0x0059 : "Flash fired, auto mode, red-eye reduction mode",
      0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
      0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
    },
    SensingMethod : {
      1 : "Not defined",
      2 : "One-chip color area sensor",
      3 : "Two-chip color area sensor",
      4 : "Three-chip color area sensor",
      5 : "Color sequential area sensor",
      7 : "Trilinear sensor",
      8 : "Color sequential linear sensor"
    },
    SceneCaptureType : {
      0 : "Standard",
      1 : "Landscape",
      2 : "Portrait",
      3 : "Night scene"
    },
    SceneType : {
      1 : "Directly photographed"
    },
    CustomRendered : {
      0 : "Normal process",
      1 : "Custom process"
    },
    WhiteBalance : {
      0 : "Auto white balance",
      1 : "Manual white balance"
    },
    GainControl : {
      0 : "None",
      1 : "Low gain up",
      2 : "High gain up",
      3 : "Low gain down",
      4 : "High gain down"
    },
    Contrast : {
      0 : "Normal",
      1 : "Soft",
      2 : "Hard"
    },
    Saturation : {
      0 : "Normal",
      1 : "Low saturation",
      2 : "High saturation"
    },
    Sharpness : {
      0 : "Normal",
      1 : "Soft",
      2 : "Hard"
    },
    SubjectDistanceRange : {
      0 : "Unknown",
      1 : "Macro",
      2 : "Close view",
      3 : "Distant view"
    },
    FileSource : {
      3 : "DSC"
    },

    Components : {
      0 : "",
      1 : "Y",
      2 : "Cb",
      3 : "Cr",
      4 : "R",
      5 : "G",
      6 : "B"
    }
  };

  function addEvent(element, event, handler) {
    if (element.addEventListener) {
      element.addEventListener(event, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + event, handler);
    }
  }

  function imageHasData(img) {
    return !!(img.exifdata);
  }


  function base64ToArrayBuffer(base64, contentType) {
    contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  function objectURLToBlob(url, callback) {
    var http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.responseType = "blob";
    http.onload = function(e) {
      if (this.status == 200 || this.status === 0) {
        callback(this.response);
      }
    };
    http.send();
  }

  function getImageData(img, callback) {
    function handleBinaryFile(binFile) {
      var data = findEXIFinJPEG(binFile);
      var iptcdata = findIPTCinJPEG(binFile);
      img.exifdata = data || {};
      img.iptcdata = iptcdata || {};
      if (callback) {
        callback.call(img);
      }
    }

    if (img.src) {
      if (/^data\:/i.test(img.src)) { // Data URI
        var arrayBuffer = base64ToArrayBuffer(img.src);
        handleBinaryFile(arrayBuffer);

      } else if (/^blob\:/i.test(img.src)) { // Object URL
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
          handleBinaryFile(e.target.result);
        };
        objectURLToBlob(img.src, function (blob) {
          fileReader.readAsArrayBuffer(blob);
        });
      } else {
        var http = new XMLHttpRequest();
        http.onload = function() {
          if (this.status == 200 || this.status === 0) {
            handleBinaryFile(http.response);
          } else {
            throw "Could not load image";
          }
          http = null;
        };
        http.open("GET", img.src, true);
        http.responseType = "arraybuffer";
        http.send(null);
      }
    } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
      var fileReader = new FileReader();
      fileReader.onload = function(e) {
        if (debug) console.log("Got file of length " + e.target.result.byteLength);
        handleBinaryFile(e.target.result);
      };

      fileReader.readAsArrayBuffer(img);
    }
  }

  function findEXIFinJPEG(file) {
    var dataView = new DataView(file);

    if (debug) console.log("Got file of length " + file.byteLength);
    if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
      if (debug) console.log("Not a valid JPEG");
      return false; // not a valid jpeg
    }

    var offset = 2,
      length = file.byteLength,
      marker;

    while (offset < length) {
      if (dataView.getUint8(offset) != 0xFF) {
        if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
        return false; // not a valid marker, something is wrong
      }

      marker = dataView.getUint8(offset + 1);
      if (debug) console.log(marker);

      // we could implement handling for other markers here,
      // but we're only looking for 0xFFE1 for EXIF data

      if (marker == 225) {
        if (debug) console.log("Found 0xFFE1 marker");

        return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

        // offset += 2 + file.getShortAt(offset+2, true);

      } else {
        offset += 2 + dataView.getUint16(offset+2);
      }

    }

  }

  function findIPTCinJPEG(file) {
    var dataView = new DataView(file);

    if (debug) console.log("Got file of length " + file.byteLength);
    if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
      if (debug) console.log("Not a valid JPEG");
      return false; // not a valid jpeg
    }

    var offset = 2,
      length = file.byteLength;


    var isFieldSegmentStart = function(dataView, offset){
      return (
        dataView.getUint8(offset) === 0x38 &&
        dataView.getUint8(offset+1) === 0x42 &&
        dataView.getUint8(offset+2) === 0x49 &&
        dataView.getUint8(offset+3) === 0x4D &&
        dataView.getUint8(offset+4) === 0x04 &&
        dataView.getUint8(offset+5) === 0x04
      );
    };

    while (offset < length) {

      if ( isFieldSegmentStart(dataView, offset )){

        // Get the length of the name header (which is padded to an even number of bytes)
        var nameHeaderLength = dataView.getUint8(offset+7);
        if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
        // Check for pre photoshop 6 format
        if(nameHeaderLength === 0) {
          // Always 4
          nameHeaderLength = 4;
        }

        var startOffset = offset + 8 + nameHeaderLength;
        var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

        return readIPTCData(file, startOffset, sectionLength);

        break;

      }


      // Not the marker, continue searching
      offset++;

    }

  }
  var IptcFieldMap = {
    0x78 : 'caption',
    0x6E : 'credit',
    0x19 : 'keywords',
    0x37 : 'dateCreated',
    0x50 : 'byline',
    0x55 : 'bylineTitle',
    0x7A : 'captionWriter',
    0x69 : 'headline',
    0x74 : 'copyright',
    0x0F : 'category'
  };
  function readIPTCData(file, startOffset, sectionLength){
    var dataView = new DataView(file);
    var data = {};
    var fieldValue, fieldName, dataSize, segmentType, segmentSize;
    var segmentStartPos = startOffset;
    while(segmentStartPos < startOffset+sectionLength) {
      if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
        segmentType = dataView.getUint8(segmentStartPos+2);
        if(segmentType in IptcFieldMap) {
          dataSize = dataView.getInt16(segmentStartPos+3);
          segmentSize = dataSize + 5;
          fieldName = IptcFieldMap[segmentType];
          fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
          // Check if we already stored a value with this name
          if(data.hasOwnProperty(fieldName)) {
            // Value already stored with this name, create multivalue field
            if(data[fieldName] instanceof Array) {
              data[fieldName].push(fieldValue);
            }
            else {
              data[fieldName] = [data[fieldName], fieldValue];
            }
          }
          else {
            data[fieldName] = fieldValue;
          }
        }

      }
      segmentStartPos++;
    }
    return data;
  }



  function readTags(file, tiffStart, dirStart, strings, bigEnd) {
    var entries = file.getUint16(dirStart, !bigEnd),
      tags = {},
      entryOffset, tag,
      i;

    for (i=0;i<entries;i++) {
      entryOffset = dirStart + i*12 + 2;
      tag = strings[file.getUint16(entryOffset, !bigEnd)];
      if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
      tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
    }
    return tags;
  }


  function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
    var type = file.getUint16(entryOffset+2, !bigEnd),
      numValues = file.getUint32(entryOffset+4, !bigEnd),
      valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
      offset,
      vals, val, n,
      numerator, denominator;

    switch (type) {
      case 1: // byte, 8-bit unsigned int
      case 7: // undefined, 8-bit byte, value depending on field
        if (numValues == 1) {
          return file.getUint8(entryOffset + 8, !bigEnd);
        } else {
          offset = numValues > 4 ? valueOffset : (entryOffset + 8);
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getUint8(offset + n);
          }
          return vals;
        }

      case 2: // ascii, 8-bit byte
        offset = numValues > 4 ? valueOffset : (entryOffset + 8);
        return getStringFromDB(file, offset, numValues-1);

      case 3: // short, 16 bit int
        if (numValues == 1) {
          return file.getUint16(entryOffset + 8, !bigEnd);
        } else {
          offset = numValues > 2 ? valueOffset : (entryOffset + 8);
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getUint16(offset + 2*n, !bigEnd);
          }
          return vals;
        }

      case 4: // long, 32 bit int
        if (numValues == 1) {
          return file.getUint32(entryOffset + 8, !bigEnd);
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
          }
          return vals;
        }

      case 5:    // rational = two long values, first is numerator, second is denominator
        if (numValues == 1) {
          numerator = file.getUint32(valueOffset, !bigEnd);
          denominator = file.getUint32(valueOffset+4, !bigEnd);
          val = new Number(numerator / denominator);
          val.numerator = numerator;
          val.denominator = denominator;
          return val;
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
            denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
            vals[n] = new Number(numerator / denominator);
            vals[n].numerator = numerator;
            vals[n].denominator = denominator;
          }
          return vals;
        }

      case 9: // slong, 32 bit signed int
        if (numValues == 1) {
          return file.getInt32(entryOffset + 8, !bigEnd);
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
          }
          return vals;
        }

      case 10: // signed rational, two slongs, first is numerator, second is denominator
        if (numValues == 1) {
          return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
        } else {
          vals = [];
          for (n=0;n<numValues;n++) {
            vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
          }
          return vals;
        }
    }
  }

  function getStringFromDB(buffer, start, length) {
    var outstr = "";
    for (n = start; n < start+length; n++) {
      outstr += String.fromCharCode(buffer.getUint8(n));
    }
    return outstr;
  }

  function readEXIFData(file, start) {
    if (getStringFromDB(file, start, 4) != "Exif") {
      if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
      return false;
    }

    var bigEnd,
      tags, tag,
      exifData, gpsData,
      tiffOffset = start + 6;

    // test for TIFF validity and endianness
    if (file.getUint16(tiffOffset) == 0x4949) {
      bigEnd = false;
    } else if (file.getUint16(tiffOffset) == 0x4D4D) {
      bigEnd = true;
    } else {
      if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
      return false;
    }

    if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
      if (debug) console.log("Not valid TIFF data! (no 0x002A)");
      return false;
    }

    var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

    if (firstIFDOffset < 0x00000008) {
      if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
      return false;
    }

    tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

    if (tags.ExifIFDPointer) {
      exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
      for (tag in exifData) {
        switch (tag) {
          case "LightSource" :
          case "Flash" :
          case "MeteringMode" :
          case "ExposureProgram" :
          case "SensingMethod" :
          case "SceneCaptureType" :
          case "SceneType" :
          case "CustomRendered" :
          case "WhiteBalance" :
          case "GainControl" :
          case "Contrast" :
          case "Saturation" :
          case "Sharpness" :
          case "SubjectDistanceRange" :
          case "FileSource" :
            exifData[tag] = StringValues[tag][exifData[tag]];
            break;

          case "ExifVersion" :
          case "FlashpixVersion" :
            exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
            break;

          case "ComponentsConfiguration" :
            exifData[tag] =
              StringValues.Components[exifData[tag][0]] +
              StringValues.Components[exifData[tag][1]] +
              StringValues.Components[exifData[tag][2]] +
              StringValues.Components[exifData[tag][3]];
            break;
        }
        tags[tag] = exifData[tag];
      }
    }

    if (tags.GPSInfoIFDPointer) {
      gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
      for (tag in gpsData) {
        switch (tag) {
          case "GPSVersionID" :
            gpsData[tag] = gpsData[tag][0] +
              "." + gpsData[tag][1] +
              "." + gpsData[tag][2] +
              "." + gpsData[tag][3];
            break;
        }
        tags[tag] = gpsData[tag];
      }
    }

    return tags;
  }

  EXIF.getData = function(img, callback) {
    if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

    if (!imageHasData(img)) {
      getImageData(img, callback);
    } else {
      if (callback) {
        callback.call(img);
      }
    }
    return true;
  }

  EXIF.getTag = function(img, tag) {
    if (!imageHasData(img)) return;
    return img.exifdata[tag];
  }

  EXIF.getAllTags = function(img) {
    if (!imageHasData(img)) return {};
    var a,
      data = img.exifdata,
      tags = {};
    for (a in data) {
      if (data.hasOwnProperty(a)) {
        tags[a] = data[a];
      }
    }
    return tags;
  }

  EXIF.pretty = function(img) {
    if (!imageHasData(img)) return "";
    var a,
      data = img.exifdata,
      strPretty = "";
    for (a in data) {
      if (data.hasOwnProperty(a)) {
        if (typeof data[a] == "object") {
          if (data[a] instanceof Number) {
            strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
          } else {
            strPretty += a + " : [" + data[a].length + " values]\r\n";
          }
        } else {
          strPretty += a + " : " + data[a] + "\r\n";
        }
      }
    }
    return strPretty;
  }

  EXIF.readFromBinaryFile = function(file) {
    return findEXIFinJPEG(file);
  }

  if (typeof define === 'function' && define.amd) {
    define('exif-js', [], function() {
      return EXIF;
    });
  }
}.call(this));

'use strict';
angular.module('Test', [
  // load your modules here
  'main', // starting with the main module
]);
