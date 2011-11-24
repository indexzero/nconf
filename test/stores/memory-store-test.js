/*
 * memory-store-test.js: Tests for the nconf Memory store.
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    nconf = require('../../lib/nconf'),
    merge = require('../fixtures/data').merge;

vows.describe('nconf/stores/memory').addBatch({
  "When using the nconf memory store": {
    topic: new nconf.Memory(),
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
    },
    "the merge() method": {
      "when overriding an existing literal value": function (store) {
        store.set('merge:literal', 'string-value');
        store.merge('merge:literal', merge);
        assert.deepEqual(store.get('merge:literal'), merge);
      },
      "when overriding an existing Array value": function (store) {
        store.set('merge:array', [1,2,3,4]);
        store.merge('merge:array', merge);
        assert.deepEqual(store.get('merge:literal'), merge);
      },
      "when merging into an existing Object value": function (store) {
        store.set('merge:object', {
          prop1: 2, 
          prop2: 'prop2',
          prop3: {
            bazz: 'bazz'
          },
          prop4: ['foo', 'bar']
        });
        store.merge('merge:object', merge);

        assert.equal(store.get('merge:object:prop1'), 1);
        assert.equal(store.get('merge:object:prop2').length, 3);
        assert.deepEqual(store.get('merge:object:prop3'), {
          foo: 'bar',
          bar: 'foo',
          bazz: 'bazz'
        });
        assert.equal(store.get('merge:object:prop4').length, 2);        
      }
    }
  }
}).export(module);