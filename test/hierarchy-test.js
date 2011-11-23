/*
 * hierarchy-test.js: Basic tests for hierarchical file stores.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var assert = require('assert'),
    path = require('path'),
    vows = require('vows'),
    nconf = require('../lib/nconf');

var configDir = path.join(__dirname, 'fixtures', 'hierarchy'),
    globalConfig = path.join(configDir, 'global.json'),
    userConfig = path.join(configDir, 'user.json');

vows.describe('nconf/hierarchy').addBatch({
  "When using nconf": {
    "configured with two file stores": {
      topic: function () {
        nconf.add('user', { type: 'file', file: userConfig })
        nconf.add('global', { type: 'file', file: globalConfig })
        nconf.load();
        return nconf;
      },
      "should have the appropriate keys present": function () {
        assert.equal(nconf.get('title'), 'My specific title');
        assert.equal(nconf.get('color'), 'green');
        assert.equal(nconf.get('movie'), 'Kill Bill');
      }
    }
  }
}).export(module);