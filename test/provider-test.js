/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('../lib/nconf')

var first = '/path/to/file1',
    second = '/path/to/file2';

vows.describe('nconf/provider').addBatch({
  "When using an instance of nconf.Provier": {
    "calling the use() method with the same store type and different options": {
      topic: new nconf.Provider().use('file', { file: first }),
      "should use a new instance of the store type": function (provider) {
        var old = provider.store;

        assert.equal(provider.store.file, first);
        provider.use('file', { file: second });

        assert.notStrictEqual(old, provider.store);
        assert.equal(provider.store.file, second);
      }
    }
  }
}).export(module);