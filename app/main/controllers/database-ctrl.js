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


