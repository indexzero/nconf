/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var async = require('async'),
    common = require('./nconf/common'),
    Provider = require('./nconf/provider').Provider,
    argv = require('./nconf/stores/argv'),
    env = require('./nconf/stores/env'),
    file = require('./nconf/stores/file'),
    literal = require('./nconf/stores/literal'),
    memory = require('./nconf/stores/memory');

//
// `nconf` is by default an instance of `nconf.Provider`.
//
var nconf = module.exports = new Provider();

//
// Expose the version from the package.json
//
nconf.version = require('../package.json').version;

//
// Setup all stores as getters
//
Object.defineProperty(nconf, 'Argv', {
  enumerable: true,
  get: function () {
    return argv;
  }
});

Object.defineProperty(nconf, 'Env', {
  enumerable: true,
  get: function () {
    return env;
  }
});

Object.defineProperty(nconf, 'File', {
  enumerable: true,
  get: function () {
    return file;
  }
});

Object.defineProperty(nconf, 'Literal', {
  enumerable: true,
  get: function () {
    return literal;
  }
});

Object.defineProperty(nconf, 'Memory', {
  enumerable: true,
  get: function () {
    return memory;
  }
});

//
// Expose the various components included with nconf
//
nconf.key           = common.key;
nconf.path          = common.path;
nconf.loadFiles     = common.loadFiles;
nconf.loadFilesSync = common.loadFilesSync;
nconf.formats       = require('./nconf/formats');
nconf.Provider      = Provider;
