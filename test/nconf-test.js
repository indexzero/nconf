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
        nconf.use('redis');
        assert.instanceOf(nconf.store, nconf.stores.Redis);
      }
    }
  }
})/*.addBatch({
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
})*/.export(module);