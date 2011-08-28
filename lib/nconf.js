/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins
 *
 */

var fs = require('fs'),
    async = require('async'),
    common = require('./nconf/common'),
    Provider = require('./nconf/provider').Provider,
    nconf = module.exports = Object.create(Provider.prototype);

//
// Use the memory engine by default.
//
nconf.use('memory');

//
// Expose the version from the package.json using `pkginfo`.
//
require('pkginfo')(module, 'version');

//
// ### function path (key)
// #### @key {string} The ':' delimited key to split
// Returns a fully-qualified path to a nested nconf key. 
//
nconf.path = function (key) {
  return key.split(':');
};

//
// ### function key (arguments)
// Returns a `:` joined string from the `arguments`.
//
nconf.key = function () {
  return Array.prototype.slice.call(arguments).join(':');
};

//
// Expose the various components included with nconf
//
nconf.loadFiles = common.loadFiles;
nconf.formats   = require('./nconf/formats');
nconf.stores    = require('./nconf/stores');
nconf.Provider  = Provider;