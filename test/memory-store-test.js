/*
 * memory-store-test.js: Tests for the nconf Memory store.
 *
 * (C) 2011, Charlie Robbins
 *
 */

require.paths.unshift(require('path').join(__dirname, '..', 'lib'));

var vows = require('vows'),
    assert = require('assert'),
    nconf = require('nconf');
    
vows.describe('nconf/stores/memory').addBatch({
  "When using the nconf memory store": {
    topic: new nconf.stores.Memory(),
    "the set() method": {
      "should respond with true": function (store) {
        assert.isTrue(store.set('foo:bar:bazz', 'buzz'));
      }
    },
    "the get() method": {
      "should respond with the correct value": function (store) {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
      }
    },
    "the clear() method": {
      "should respond with the true": function (store) {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
        assert.isTrue(store.clear('foo:bar:bazz'));
        assert.isTrue(typeof store.get('foo:bar:bazz') === 'undefined');
      }
    }
  }
}).export(module);