/*
 * redis-test.js: Tests for the redis nconf storage engine.
 *
 * (C) 2011, Charlie Robbins
 *
 */

require.paths.unshift(require('path').join(__dirname, '..', '..', 'lib'));

var vows = require('vows'),
    assert = require('assert'),
    nconf = require('nconf');

var data = {
  literal: 'bazz', 
  arr: ['one', 2, true, { value: 'foo' }],
  obj: {
    host: 'localhost',
    port: 5984,
    array: ['one', 2, true, { foo: 'bar' }],
    auth: {
      username: 'admin',
      password: 'password'
    }
  }
}

vows.describe('nconf/stores/redis').addBatch({
  "When using the nconf redis store": {
    topic: new nconf.stores.Redis(),
    "the set() method": {
      "with a literal": {
        topic: function (store) {
          store.set('foo:literal', 'bazz', this.callback)
        },
        "should respond without an error": function (err, ok) {
          assert.isNull(err);
        }
      },
      "with an Array": {
        topic: function (store) {
          store.set('foo:array', data.arr, this.callback)
        },
        "should respond without an": function (err, ok) {
          assert.isNull(err);
        }
      },
      "with an Object": {
        topic: function (store) {
          store.set('foo:object', data.obj, this.callback)
        },
        "should respond without an error": function (err, ok) {
          assert.isNull(err);
        }
      }
    }
  }
}).addBatch({
  "When using the nconf redis store": {
    topic: new nconf.stores.Redis(),
    "the get() method": {
      "with a literal value": {
        topic: function (store) {
          store.get('foo:literal', this.callback);
        },
        "should respond with the correct value": function (err, value) {
          assert.equal(value, data.literal);
        }
      },
      "with an Array value": {
        topic: function (store) {
          store.get('foo:array', this.callback);
        },
        "should respond with the correct value": function (err, value) {
          assert.deepEqual(value, data.arr);
        }
      },
      "with an Object value": {
        topic: function (store) {
          store.get('foo:object', this.callback);
        },
        "should respond with the correct value": function (err, value) {
          assert.deepEqual(value, data.obj);
        }
      }
    }
  }
}).addBatch({
  /*,
  "the clear() method": {
    "should respond with the true": function (store) {
      assert.equal(store.get('foo:bar:bazz'), 'buzz');
      assert.isTrue(store.clear('foo:bar:bazz'));
      assert.isTrue(typeof store.get('foo:bar:bazz') === 'undefined');
    }
  }*/
}).export(module);