/*
 * nconf-safe.js: Tests for the safe nconf.
 *
 * (C) 2017, Alexey Yaroshevich and the Contributors.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    Nconf = require('../lib/safe')

vows.describe('Nconf (safe)').addBatch({
  "When using the Nconf": {
    "Contrustor": {
      "should have the correct methods set": function () {
        assert.isFunction(Nconf.key);
        assert.isFunction(Nconf.path);
        assert.isFunction(Nconf.loadFiles);
        assert.isFunction(Nconf.loadFilesSync);
        assert.isFunction(Nconf.Provider);
      },
      "should have formats fields with correct": function () {
        Object.keys(Nconf.formats).forEach(function(k) {
          assert.isFunction(Nconf.formats[k].parse, k);
          assert.isFunction(Nconf.formats[k].stringify, k);
        });
      }
    },
    "should have the correct methods set": function () {
      var nconf = new Nconf();
      assert.isFunction(nconf.use);
      assert.isFunction(nconf.any);
      assert.isFunction(nconf.get);
      assert.isFunction(nconf.set);
      assert.isFunction(nconf.clear);
      assert.isFunction(nconf.load);
      assert.isFunction(nconf.save);
      assert.isFunction(nconf.reset);
      assert.isFunction(nconf.required);
    },
    "the use() method": {
      "should instaniate the correct store": function () {
        var nconf = new Nconf();
        nconf.use('memory');
        nconf.load();
        assert.instanceOf(nconf.stores['memory'], nconf.Memory);
      }
    },
    "it should": {
      topic: function () {
        fs.readFile(path.join(__dirname, '..', 'package.json'), this.callback);
      },
      "have the correct version set": function (err, data) {
        assert.isNull(err);
        data = JSON.parse(data.toString());
        assert.equal(Nconf.version, data.version);
      }
    },
    "the required() method": {
      "should throw error with missing keys": function() {
        var nconf = new Nconf();
        nconf.use('memory');
        nconf.set('foo:bar:bazz', 'buzz');
        assert.throws(nconf.required.bind(nconf, ['missing', 'foo:bar:bazz']), Error);
      },
      "should return true if all required keys exist": function() {
        var nconf = new Nconf();
        nconf.use('memory');
        nconf.set('foo:bar:bazz', 'buzz');
        assert.isTrue(nconf.required(['foo:bar:bazz']));
      }
    }
  }
}).addBatch({
  "When using the nconf": {
    "with the memory store": {
      topic: function() {
        var nconf = new Nconf();
        nconf.use('memory');
        return nconf;
      },

      "the set() method": {
        "should respond with true": function (err, nconf) {
          assert.isTrue(nconf.set('foo:bar:bazz', 'buzz'));
        }
      },
      "the get() method": {
        "without a callback": {
          "should respond with the correct value": function (err, nconf) {
            assert.equal(nconf.get('foo:bar:bazz'), 'buzz');
          }
        },
        "with a callback": {
          topic: function (nconf) {
            nconf.get('foo:bar:bazz', this.callback);
          },

          "should respond with the correct value": function (err, value) {
            assert.equal(value, 'buzz');
          }
        }
      }
    }
  }
}).addBatch({
  "When using the nconf": {
    topic: new Nconf(),

    "with the memory store": {
      topic: nconf => { nconf.use('memory'); return nconf },

      "the get() method": {
        "should respond allow access to the root": function (err, nconf) {
          assert(nconf.get(null));
          assert(nconf.get(undefined));
          assert(nconf.get());
        }
      },
      "the set() method": {
        "should respond allow access to the root and complain about non-objects": function (err, nconf) {
          assert(!nconf.set(null, null));
          assert(!nconf.set(null, undefined));
          assert(!nconf.set(null));
          assert(!nconf.set(null, ''));
          assert(!nconf.set(null, 1));
          var original = nconf.get();
          assert(nconf.set(null, nconf.get()));
          assert.notEqual(nconf.get(), original);
          assert.deepEqual(nconf.get(), original)
        }
      }
    }
  }
}).export(module);
