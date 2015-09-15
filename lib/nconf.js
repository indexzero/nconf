/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */
'use strict';

var fs = require('fs'),
    common = require('./nconf/common'),
    Provider = require('./nconf/provider').Provider,
    path = require('path');

var nconf = module.exports = new Provider();

//
// Expose the version from the package.json
//
nconf.version = require('../package.json').version;

//
// Setup all stores as lazy-loaded getters.
//
fs.readdirSync(path.join(__dirname, 'nconf', 'stores')).forEach(function (file) {
  var store = file.replace('.js', ''),
      name  = common.capitalize(store);

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
