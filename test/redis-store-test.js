/*
 * redis-store-test.js: Tests for the redis nconf storage engine.
 *
 * (C) 2011, Charlie Robbins
 *
 */

require.paths.unshift(require('path').join(__dirname, '..', 'lib'));

var vows = require('vows'),
    assert = require('assert'),
    nconf = require('nconf'),
    data = require('./fixtures/data').data;

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
      },
      "with a nested Object value": {
        topic: function (store) {
          store.get('foo:object:auth', this.callback);
        },
        "should respond with the correct value": function (err, value) {
          assert.deepEqual(value, data.obj.auth);
        }
      }
    }
  }
}).addBatch({
  "When using the nconf redis store": {
    topic: new nconf.stores.Redis(),  
    "the clear() method": {
      topic: function (store) {
        var that = this;
        store.clear('foo', function (err) {
          if (err) {
            return that.callback(err);
          }
          
          store.get('foo', that.callback);
        });
      },
      "should actually remove the value from Redis": function (err, value) {
        assert.isNull(err);
        assert.isNull(value);
      }
    }
  }
}).addBatch({
  "When using the nconf redis store": {
    topic: new nconf.stores.Redis(),  
    "the save() method": {
      topic: function (store) {
        var that = this;
        store.save(data, function (err) {
          if (err) {
            return that.callback(err);
          }
          
          store.get('obj', that.callback);
        });
      },
      "should set all values correctly": function (err, value) {
        assert.isNull(err);
        assert.deepEqual(value, data.obj);
      }
    }
  }
}).addBatch({
  "When using the nconf redis store": {
    topic: new nconf.stores.Redis(),  
    "the load() method": {
      topic: function (store) {
        store.load(this.callback);
      },
      "should respond with the correct object": function (err, value) {
        assert.isNull(err);
        assert.deepEqual(value, data);
      }
    }
  }
}).addBatch({
  "When using the nconf redis store": {
    topic: new nconf.stores.Redis(),  
    "the reset() method": {
      topic: function (store) {
        var that = this;
        this.store = store;
        
        store.reset(function (err) {
          if (err) {
            return that.callback(err);
          }
          
          store.get('obj', that.callback);
        });
      },
      "should remove all keys from redis": function (err, value) {
        assert.isNull(err);
        assert.isNull(value);
        assert.length(Object.keys(this.store.cache.store), 0);
      }
    }
  }
}).export(module);