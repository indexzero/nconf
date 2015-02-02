/*
 * safe.js: Instance constructor the nconf module
 *
 * (C) 2017, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs'),
    common = require('./nconf/common'),
    Provider = require('./nconf/provider').Provider;

//
// Nconf instance constructor
//
module.exports = Nconf;
function Nconf(options) {
    return new Provider(options);
};

//
// Expose the version from the package.json
//
Nconf.version = require('../package.json').version;

//
// Setup all stores as lazy-loaded getters.
//
['argv', 'env', 'file', 'literal', 'memory'].forEach(function (store) {
    var name = common.capitalize(store);

    Provider.prototype.__defineGetter__(name, function () {
        return require('./nconf/stores/' + store)[name];
    });
});

//
// Expose the various components included with nconf
//
Nconf.key           = common.key;
Nconf.path          = common.path;
Nconf.loadFiles     = common.loadFiles;
Nconf.loadFilesSync = common.loadFilesSync;
Nconf.formats       = require('./nconf/formats');
Nconf.Provider      = Provider;
