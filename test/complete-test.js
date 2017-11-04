/*
 * complete-test.js: Complete test for multiple stores.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs'),
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('../lib/nconf'),
    data = require('./fixtures/data').data,
    helpers = require('./helpers');

var completeTest = helpers.fixture('complete-test.json'),
    complete = helpers.fixture('complete.json');

// prime the process.env
process.env['NCONF_foo'] = 'bar';
process.env.FOO = 'bar';
process.env.BAR = 'zalgo';
process.env.NODE_ENV = 'debug';
process.env.FOOBAR = 'should not load';
process.env.json_array = JSON.stringify(['foo', 'bar', 'baz']);
process.env.json_obj = JSON.stringify({foo: 'bar', baz: 'foo'});

vows.describe('nconf/multiple-stores').addBatch({
  "When using the nconf with multiple providers": {
    topic: function () {
      var that = this;
      helpers.cp(complete, completeTest, function () {
        nconf.env({
          // separator: '__',
          match: /^NCONF_/,
          whitelist: ['NODE_ENV', 'FOO', 'BAR']
        });
        nconf.file({ file: completeTest });
        nconf.use('argv', { type: 'literal', store: data });
        that.callback();
      });
    },
    "should have the correct `stores`": function () {
      assert.isObject(nconf.stores.env);
      assert.isObject(nconf.stores.argv);
      assert.isObject(nconf.stores.file);
    },
    "env vars": {
      "are present": function () {
        ['NODE_ENV', 'FOO', 'BAR', 'NCONF_foo'].forEach(function (key) {
          assert.equal(nconf.get(key), process.env[key]);
        });
      }
    },
    "json vars": {
      topic: function () {
        fs.readFile(complete, 'utf8', this.callback);
      },
      "are present": function (err, data) {
        assert.isNull(err);
        data = JSON.parse(data);
        Object.keys(data).forEach(function (key) {
          assert.deepEqual(nconf.get(key), data[key]);
        });
      }
    },
    "literal vars": {
      "are present": function () {
        Object.keys(data).forEach(function (key) {
          assert.deepEqual(nconf.get(key), data[key]);
        });
      }
    },
    "and saving *synchronously*": {
      topic: function () {
        nconf.set('weebls', 'stuff');
        return nconf.save();
      },
      "correct return value": function (topic) {
        Object.keys(topic).forEach(function (key) {
          assert.deepEqual(topic[key], nconf.get(key));
        });
      },
      "the file": {
        topic: function () {
          fs.readFile(completeTest, 'utf8', this.callback);
        },
        "saved correctly": function (err, data) {
          data = JSON.parse(data);
          Object.keys(data).forEach(function (key) {
            assert.deepEqual(data[key], nconf.get(key));
          });
          assert.equal(nconf.get('weebls'), 'stuff');
        }
      }
    },
    teardown: function () {
      // remove the file so that we can test saving it async
      fs.unlinkSync(completeTest);
    }
  }
}).addBatch({
  // Threw this in it's own batch to make sure it's run separately from the
  // sync check
  "When using the nconf with multiple providers": {
    "and saving *asynchronously*": {
      topic: function () {
        nconf.set('weebls', 'crap');
        nconf.save(this.callback);
      },
      "correct return value": function (err, data) {
        assert.isNull(err);
        Object.keys(data).forEach(function (key) {
          assert.deepEqual(data[key], nconf.get(key));
        });
      },
      "the file": {
        topic: function () {
          fs.readFile(completeTest, 'utf8', this.callback);
        },
        "saved correctly": function (err, data) {
          assert.isNull(err);
          data = JSON.parse(data);
          Object.keys(data).forEach(function (key) {
            assert.deepEqual(nconf.get(key), data[key]);
          });
          assert.equal(nconf.get('weebls'), 'crap');
        }
      }
    },
    teardown: function () {
      fs.unlinkSync(completeTest);
      nconf.remove('file');
      nconf.remove('memory');
      nconf.remove('argv');
      nconf.remove('env');
    }
  }
}).addBatch({
  // Threw this in it's own batch to make sure it's run separately from the
  // sync check
  "When using env with lowerCase:true": {
    topic: function () {
      var that = this;
      helpers.cp(complete, completeTest, function () {
        nconf.env({ lowerCase: true });
        that.callback();
      });
    },
    "env vars": {
      "keys also available as lower case": function () {
        Object.keys(process.env).forEach(function (key) {
          assert.equal(nconf.get(key.toLowerCase()), process.env[key]);
        });
      }
    },
    teardown: function () {
      nconf.remove('env');
    }
  }
}).addBatch({
  // Threw this in it's own batch to make sure it's run separately from the
  // sync check
  "When using env with parseValues:true": {
    topic: function () {
      var that = this;
      helpers.cp(complete, completeTest, function () {
        nconf.env({ parseValues: true });
        that.callback();
      });
    },
    "env vars": {
      "JSON keys properly parsed": function () {
        Object.keys(process.env).forEach(function (key) {
          var val = process.env[key];
          
          try {
            val = JSON.parse(val);
          } catch (err) {}

          assert.deepEqual(nconf.get(key), val);
        });
      }
    },
    teardown: function () {
      nconf.remove('env');
    }
  },
}).addBatch({
  // Threw this in it's own batch to make sure it's run separately from the
  // sync check
  "When using env with transform:fn": {
    topic: function () {

      function testTransform(obj) {
        if (obj.key === 'FOO') {
          obj.key = 'FOOD';
          obj.value = 'BARFOO';
        }

        return obj;
      }

      var that = this;
      helpers.cp(complete, completeTest, function () {
        nconf.env({ transform: testTransform })
        that.callback();
      });
    }, "env vars": {
      "port key/value properly transformed": function() {
        assert.equal(nconf.get('FOOD'), 'BARFOO');
      }
    }
  },
  teardown: function () {
    nconf.remove('env');
  }
}).addBatch({
  // Threw this in it's own batch to make sure it's run separately from the
  // sync check
  "When using env with a transform:fn that drops an entry": {
    topic: function () {

      function testTransform(obj) {
        if (obj.key === 'FOO') {
          return false;
        }

        return obj;
      }

      var that = this;
      helpers.cp(complete, completeTest, function () {
        nconf.env({ transform: testTransform });
        that.callback();
      });
    }, "env vars": {
      "port key/value properly transformed": function() {
        assert.equal(typeof nconf.get('FOO'), 'undefined');
      }
    }
  },
  teardown: function () {
    nconf.remove('env');
  }
}).addBatch({
  // Threw this in it's own batch to make sure it's run separately from the
  // sync check
  "When using env with a transform:fn that return an undefined value": {
    topic: function () {

      function testTransform(obj) {
        if (obj.key === 'FOO') {
          return {key: 'FOO', value: undefined};
        }

        return obj;
      }

      var that = this;
      helpers.cp(complete, completeTest, function () {
        nconf.env({ transform: testTransform });
        that.callback();
      });
    }, "env vars": {
      "port key/value properly transformed": function() {
        assert.equal(typeof nconf.get('FOO'), 'undefined');
      }
    }
  },
  teardown: function () {
    nconf.remove('env');
  }
}).addBatch({
  // Threw this in it's own batch to make sure it's run separately from the
  // sync check
  "When using env with a bad transform:fn": {
    topic: function () {
      function testTransform() {
        return {foo: 'bar'};
      }

      var that = this;
      helpers.cp(complete, completeTest, function () {
        try {
          nconf.env({ transform: testTransform });
          that.callback();
        } catch (err) {
          that.callback(null, err);
        }
      });
    }, "env vars": {
      "port key/value throws transformation error": function(err) {
        assert.equal(err.name, 'RuntimeError');
      }
    }
  },
  teardown: function () {
    nconf.remove('env');
  }
}).export(module);