/*
 * env-test.js: Tests for the nconf env store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    nconf = require('../../lib/nconf');

process.env.TES = 'TING';
process.env.SEPARATED__VALUE = 'FOO';

vows.describe('nconf/stores/env').addBatch({
  "An instance of nconf.Env": {
    topic: new nconf.Env(),
    "should have the correct methods defined": function (env) {
      assert.isFunction(env.loadSync);
      assert.isFunction(env.loadEnv);
      assert.isArray(env.whitelist);
      assert.lengthOf(env.whitelist, 0);
      assert.equal(env.separator, '');
    }
  },
  "An instance of nconf.Env with readOnly option set to false": {
    topic: new nconf.Env({readOnly: false}),
    "should have it's readOnly property set to false": function (env) {
      assert.isFunction(env.loadSync);
      assert.isFunction(env.loadEnv);
      assert.isArray(env.whitelist);
      assert.lengthOf(env.whitelist, 0);
      assert.ok(!env.readOnly);
    }
},
"An instance of nconf.Env with logicalSeparator option overridden": {
  topic: new nconf.Env({logicalSeparator: '.', separator: '__'}),
  "should be able to retrieve a value using the logical separator": function (env) {
    env.loadEnv();
    assert.isFunction(env.loadSync);
    assert.isFunction(env.loadEnv);
    assert.equal(env.logicalSeparator, '.');
    assert.equal(env.get('SEPARATED.VALUE'), 'FOO');
  }
}
}).export(module);
