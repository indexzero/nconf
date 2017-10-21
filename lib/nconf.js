/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var common = require('./nconf/common'),
    Provider = require('./nconf/provider').Provider;

//
// `nconf` is by default an instance of `nconf.Provider`.
//
var nconf = module.exports = new Provider();

//
// Expose the version from the package.json
//
nconf.version = require('../package.json').version;

//
// Setup all stores as lazy-loaded getters.
//
['argv', 'env', 'file', 'literal', 'memory'].forEach(function (store) {
    var name = common.capitalize(store);

    nconf.__defineGetter__(name, function () {
        return require('./nconf/stores/' + store)[name];
    });
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
