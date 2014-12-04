/*
 * format-yaml-test.js: Tests YAML file format.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('../../lib/nconf'),
    data = require('../fixtures/data').data,
    YAML = require('js-yaml'),
    store;

vows.describe('nconf/formats yaml').addBatch({
  "When using the nconf file store": {
    "with a valid YAML file": {
      topic: function () {
        var filePath = path.join(__dirname, '..', 'fixtures', 'store.yaml');
        fs.writeFileSync(filePath, YAML.safeDump(data));
        this.store = store = new nconf.File({ file: filePath, format: require('nconf-yaml') });
        return null;
      },
      "the load() method": {
        topic: function () {
          this.store.load(this.callback);
        },
        "should load the data correctly": function (err, data) {
          assert.isNull(err);
          assert.deepEqual(data, this.store.store);
        }
      }
    },
    "with a malformed YAML file": {
      topic: function () {
        var filePath = path.join(__dirname, '..', 'fixtures', 'malformed.yaml');
        this.store = new nconf.File({ file: filePath, format: require('nconf-yaml') });
        return null;
      },
      "the load() method with a malformed YAML config file": {
        topic: function () {
          this.store.load(this.callback.bind(null, null));
        },
        "should respond with an error and indicate file name": function (_, err) {
          assert.isTrue(!!err);
          assert.match(err, /malformed\.yaml/);
        }
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.yaml'),
          tmpStore = new nconf.File({ file: tmpPath, format: require('nconf-yaml') });
      return tmpStore;
    },
    "the save() method": {
      topic: function (tmpStore) {
        var that = this;

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        tmpStore.save(function () {
          fs.readFile(tmpStore.file, function (err, d) {
            fs.unlinkSync(tmpStore.file);

            return err
              ? that.callback(err)
              : that.callback(err, YAML.safeLoad(d.toString()));
          });
        });
      },
      "should save the data correctly": function (err, read) {
        assert.isNull(err);
        assert.deepEqual(read, data);
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.yaml'),
          tmpStore = new nconf.File({ file: tmpPath, format: require('nconf-yaml') });
      return tmpStore;
    },
    "the saveSync() method": {
      topic: function (tmpStore) {
        var that = this;

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        var saved = tmpStore.saveSync();

        fs.readFile(tmpStore.file, function (err, d) {
          fs.unlinkSync(tmpStore.file);

          return err
            ? that.callback(err)
            : that.callback(err, YAML.safeLoad(d.toString()), saved);
        });
      },
      "should save the data correctly": function (err, read, saved) {
        assert.isNull(err);
        assert.deepEqual(read, data);
        assert.deepEqual(read, saved);
      }
    }
  }
}).export(module);
