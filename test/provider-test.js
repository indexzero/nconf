/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    vows = require('vows'),
    nconf = require('../lib/nconf')

var first = '/path/to/file1',
    second = '/path/to/file2';

function assertDefaults (script) {
  return {
    topic: function () {
      spawn('node', [script, '--something', 'foobar'])
        .stdout.once('data', this.callback.bind(this, null));
    },
    "should respond with the value passed into the script": function (_, data) {
      assert.equal(data.toString(), 'foobar');
    }
  }
}

vows.describe('nconf/provider').addBatch({
  "When using nconf": {
    "an instance of 'nconf.Provider'": {
      "calling the use() method with the same store type and different options": {
        topic: new nconf.Provider().use('file', { file: first }),
        "should use a new instance of the store type": function (provider) {
          var old = provider.store;

          assert.equal(provider.store.file, first);
          provider.use('file', { file: second });

          assert.notStrictEqual(old, provider.store);
          assert.equal(provider.store.file, second);
        }
      },
      "when 'useArgv' is true": assertDefaults(path.join(__dirname, 'fixtures', 'scripts', 'nconf-override.js'))
    },
    "the default nconf provider": {
      "when 'useArgv' is true": assertDefaults(path.join(__dirname, 'fixtures', 'scripts', 'default-override.js'))
    }
  }
}).export(module);