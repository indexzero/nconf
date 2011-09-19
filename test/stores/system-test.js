/*
 * system-test.js: Tests for the nconf system store.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    helpers = require('../helpers'),
    nconf = require('../../lib/nconf');

vows.describe('nconf/stores/system').addBatch({
  "An instance of nconf.stores.System": {
    topic: new nconf.stores.System(),
    "should have the correct methods defined": function (system) {
      assert.isFunction(system.loadSync);
      assert.isFunction(system.loadOverrides);
      assert.isFunction(system.loadArgv);
      assert.isFunction(system.loadEnv);
      assert.isFalse(system.argv);
      assert.isFalse(system.env);
      assert.isNull(system.overrides);
    }
  }
}).export(module);