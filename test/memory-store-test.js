/*
 * memory-store-test.js: Tests for the nconf Memory store.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    nconf = require('../lib/nconf');
    
vows.describe('nconf/stores/memory').addBatch({
  "When using the nconf memory store": {
    topic: new nconf.stores.Memory(),
    "the set() method": {
      "should respond with true": function (store) {
        assert.isTrue(store.set('foo:bar:bazz', 'buzz'));
        assert.isTrue(store.set('falsy:number', 0));
        assert.isTrue(store.set('falsy:string', ''));
        assert.isTrue(store.set('falsy:boolean', false));
        assert.isTrue(store.set('falsy:object', null));
      }
    },
    "the get() method": {
      "should respond with the correct value": function (store) {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
        assert.equal(store.get('falsy:number'), 0);
        assert.equal(store.get('falsy:string'), '');
        assert.equal(store.get('falsy:boolean'), false);
        assert.equal(store.get('falsy:object'), null);
      },
      "should not fail when retrieving non-existent keys": function (store) {
        assert.doesNotThrow(function() {
          assert.equal(store.get('this:key:does:not:exist'), undefined);
        }, TypeError);
      },
      "should not fail when drilling into non-objects": function (store) {
        assert.doesNotThrow(function() {
          assert.equal(store.get('falsy:number:uh:oh'), undefined);
        }, TypeError);
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