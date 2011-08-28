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
    nconf = require('../lib/nconf');
    
var mergeFixtures = path.join(__dirname, 'fixtures', 'merge'),
    files = [path.join(mergeFixtures, 'file1.json'), path.join(mergeFixtures, 'file2.json')],
    override = JSON.parse(fs.readFileSync(files[0]), 'utf8'),
    first = '/path/to/file1',
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

function assertMerged (provider) {
  var store = provider.store.store;
  assert.isTrue(store.apples);
  assert.isTrue(store.bananas);
  assert.isTrue(store.candy.something1);
  assert.isTrue(store.candy.something2);
  assert.isTrue(store.candy.something3);
  assert.isTrue(store.candy.something4);
  assert.isTrue(store.dates);
  assert.isTrue(store.elderberries);
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
}).addBatch({
  "When using nconf": {
    "an instance of 'nconf.Provider'": {
      "the merge() method": {
        topic: new nconf.Provider().use('file', { file: files[1] }),
        "should have the result merged in": function (provider) {
          provider.load();
          provider.merge(override);
          assertMerged(provider);
        }
      },
      "the mergeFiles() method": {
        topic: function () {
          var provider = new nconf.Provider().use('memory');
          provider.mergeFiles(files, this.callback.bind(this, null, provider))
        },
        "should have the result merged in": function (_, provider) {
          assertMerged(provider);
        }
      }
    }
  }
}).export(module);