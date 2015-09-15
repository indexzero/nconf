/*
 * argv-test.js: Tests for the nconf argv store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */
'use strict';

var vows = require('vows'),
    assert = require('assert'),
    nconf = require('../../lib/nconf');

vows.describe('nconf/stores/argv').addBatch({
  'An instance of nconf.Argv': {
    topic: new nconf.Argv(),
    'should have the correct methods defined': function (argv) {
      assert.isFunction(argv.loadSync);
      assert.isFunction(argv.loadArgv);
      assert.isFalse(argv.options);
    }
  }
}).export(module);
