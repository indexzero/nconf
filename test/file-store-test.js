/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins
 *
 */

require.paths.unshift(require('path').join(__dirname, '..', 'lib'));

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('nconf'),
    data = require('./fixtures/data').data, 
    store;

vows.describe('nconf/stores/file').addBatch({
  "When using the nconf file store": {
    topic: function () {
      var filePath = path.join(__dirname, 'fixtures', 'store.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      store = new nconf.stores.File({ file: filePath });
      return null;
    },
    "the load() method": {
      topic: function () {
        store.load(this.callback);
      },
      "should load the data correctly": function (err, data) {
        assert.isNull(err);
        assert.deepEqual(data, store.store);
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var tmpPath = path.join(__dirname, 'fixtures', 'tmp.json'),
          tmpStore = new nconf.stores.File({ file: tmpPath });
      return tmpStore;
    },
    "the save() method": {
      topic: function (tmpStore) {
        var that = this;
        
        Object.keys(store.store).forEach(function (key) {
          tmpStore.set(key, store.store[key]);
        });
        
        tmpStore.save(function () {
          fs.readFile(tmpStore.file, function (err, data) {
            return err ? that.callback(err) : that.callback(err, JSON.parse(data.toString()));
          });
        });
      },
      "should save the data correctly": function (err, data) {
        assert.isNull(err);
        assert.deepEqual(data, store.store);
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    "the set() method": {
      "should respond with true": function () {
        assert.isTrue(store.set('foo:bar:bazz', 'buzz'));
      }
    },
    "the get() method": {
      "should respond with the correct value": function () {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
      }
    },
    "the clear() method": {
      "should respond with the true": function () {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
        assert.isTrue(store.clear('foo:bar:bazz'));
        assert.isTrue(typeof store.get('foo:bar:bazz') === 'undefined');
      }
    }
  }
}).export(module);