/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('../lib/nconf'),
    yargs = require('yargs')

vows.describe('nconf/argv').addBatch({
  "When using the nconf": {
    "with a custom yargs": {
      topic: function () {
        fs.readFile(path.join(__dirname, '..', 'package.json'), this.callback);
      },
    },
    "with the default yars": {
    }
  }
}).export(module);
