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
    helpers = require('./helpers'),
    nconf = require('../lib/nconf');
    
var fixturesDir = path.join(__dirname, 'fixtures'),
    mergeFixtures = path.join(fixturesDir, 'merge'),
    files = [path.join(mergeFixtures, 'file1.json'), path.join(mergeFixtures, 'file2.json')],
    override = JSON.parse(fs.readFileSync(files[0]), 'utf8'),
    first = '/path/to/file1',
    second = '/path/to/file2';

vows.describe('nconf/provider').addBatch({
  "When using nconf": {
    "an instance of 'nconf.Provider'": {
      "calling the use() method with the same store type and different options": {
        topic: new nconf.Provider().use('file', { file: first }),
        "should use a new instance of the store type": function (provider) {
          var old = provider.file;

          assert.equal(provider.file.file, first);
          provider.use('file', { file: second });

          assert.notStrictEqual(old, provider.file);
          assert.equal(provider.file.file, second);
        }
      },
      //"when 'useArgv' is true": helpers.assertDefaults(path.join(fixturesDir, 'scripts', 'nconf-override.js'))
    },
    /*"the default nconf provider": {
      "when 'useArgv' is true": helpers.assertDefaults(path.join(fixturesDir, 'scripts', 'default-override.js'))
    }*/
  }
})/*.addBatch({
  "When using nconf": {
    "an instance of 'nconf.Provider'": {
      "the merge() method": {
        topic: new nconf.Provider().use('file', { file: files[1] }),
        "should have the result merged in": function (provider) {
          provider.load();
          provider.merge(override);
          helpers.assertMerged(null, provider);
        }
      },
      "the mergeFiles() method": {
        topic: function () {
          var provider = new nconf.Provider().use('memory');
          provider.mergeFiles(files, this.callback.bind(this, null, provider))
        },
        "should have the result merged in": function (_, provider) {
          helpers.assertMerged(null, provider);
        }
      }
    }
  }
})*/.export(module);