/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('../lib/nconf'),
    data = require('./fixtures/data').data;

vows.describe('nconf').addBatch({
  "When using the nconf": {
    "should have the correct methods set": function () {
      assert.isFunction(nconf.key);
      assert.isFunction(nconf.path);
      assert.isFunction(nconf.use);
      assert.isFunction(nconf.get);
      assert.isFunction(nconf.set);
      assert.isFunction(nconf.clear);
      assert.isFunction(nconf.load);
      assert.isFunction(nconf.save);
      assert.isFunction(nconf.reset);
    },
    "the use() method": {
      "should instaniate the correct store": function () {
        nconf.use('memory');
        assert.instanceOf(nconf.store, nconf.stores.Memory);
      }
    },
    "it should": {
      topic: function () {
        fs.readFile(path.join(__dirname, '..', 'package.json'), this.callback);
      },
      "have the correct version set": function (err, data) {
        assert.isNull(err);
        data = JSON.parse(data.toString());
        assert.equal(nconf.version, data.version);
      }
    }
  }
}).addBatch({
  "When using the nconf": {
    "with the memory store": {
      "the set() method": {
        "should respond with true": function () {
          assert.isTrue(nconf.set('foo:bar:bazz', 'buzz'));
        }
      },
      "the get() method": {
        "should respond with the correct value": function () {
          assert.equal(nconf.get('foo:bar:bazz'), 'buzz');
        }
      },
      "the clear() method": {
        "should respond with the true": function () {
          assert.equal(nconf.get('foo:bar:bazz'), 'buzz');
          assert.isTrue(nconf.clear('foo:bar:bazz'));
          assert.isTrue(typeof nconf.get('foo:bar:bazz') === 'undefined');
        }
      },
      "the load() method": {
        "without a callback": {
          "should throw an exception": function () {
            assert.throws(function () {
              nconf.load();
            })
          }
        },
        "with a callback": {
          topic: function () {
            nconf.load(this.callback.bind(null, null)); 
          },
          "should respond with an error": function (ign, err) {
            assert.isNotNull(err);
          }
        }
      },
      "the save() method": {
        "without a callback": {
          "should throw an exception": function () {
            assert.throws(function () {
              nconf.save();
            })
          }
        },
        "with a callback": {
          topic: function () {
            nconf.save(this.callback.bind(null, null)); 
          },
          "should respond with an error": function (ign, err) {
            assert.isNotNull(err);
          }
        }
      }
    }
  }
}).export(module);