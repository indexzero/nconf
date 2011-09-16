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
    nconf = module.exports = new Provider();

//
// Expose the version from the package.json using `pkginfo`.
//
require('pkginfo')(module, 'version');

//
// Expose the various components included with nconf
//
nconf.key           = common.key;
nconf.path          = common.path;
nconf.loadFiles     = common.loadFiles;
nconf.loadFilesSync = common.loadFilesSync;
nconf.formats       = require('./nconf/formats');
nconf.stores        = require('./nconf/stores');
nconf.Provider      = Provider;