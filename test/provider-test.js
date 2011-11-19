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
    override = JSON.parse(fs.readFileSync(files[0]), 'utf8');

vows.describe('nconf/provider').addBatch({
  "When using nconf": {
    "an instance of 'nconf.Provider'": {
      "calling the use() method with the same store type and different options": {
        topic: new nconf.Provider().use('file', { file: files[0] }),
        "should use a new instance of the store type": function (provider) {
          var old = provider.file;

          assert.equal(provider.file.file, files[0]);
          provider.use('file', { file: files[1] });

          assert.notStrictEqual(old, provider.file);
          assert.equal(provider.file.file, files[1]);
        }
      },
      "when 'argv' is true": helpers.assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'provider-argv.js'),
        argv: ['--something', 'foobar']
      }),
      "when 'env' is true": helpers.assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'provider-env.js'),
        env: { SOMETHING: 'foobar' }
      }),
    },
    "the default nconf provider": {
      "when 'argv' is set to true": helpers.assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'nconf-argv.js'),
        argv: ['--something', 'foobar'],
        env: { SOMETHING: true }
      }),
      "when 'env' is set to true": helpers.assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'nconf-env.js'),
        env: { SOMETHING: 'foobar' }
      }),
      "when 'argv' is set to true and process.argv is modified": helpers.assertSystemConf({
        script: path.join(fixturesDir, 'scripts', 'nconf-change-argv.js'),
        argv: ['--something', 'badValue', 'evenWorse', 'OHNOEZ', 'foobar']
      })
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
          helpers.assertMerged(null, provider.file.store);
        }
      },
      "when sources are passed in": {
        topic: new nconf.Provider({
          sources: {
            user: {
              type: 'file',
              file: files[0]
            },
            global: {
              type: 'file',
              file: files[1]
            }
          }
        }),
        "should have the result merged in": function (provider) {
          helpers.assertMerged(null, provider.load());
        }
      }
    }
  }
}).export(module);

