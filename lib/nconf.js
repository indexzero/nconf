/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins
 *
 */

var fs = require('fs'),
    async = require('async'),
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
// ### function loadFiles (files)
// #### @files {Array} List of files to load.
// Loads all the data in the specified `files`.
//
nconf.loadFiles = function (files, callback) {
  if (!files) {
    return callback(null, {});
  }

  var allData = {};

  function loadFile (file, next) {
    fs.readFile(file, function (err, data) {
      if (err) {
        return next(err);
      }

      data = JSON.parse(data.toString());
      Object.keys(data).forEach(function (key) {
        allData[key] = data[key];
      });

      next();
    });
  }

  async.forEach(files, loadFile, function (err) {
    return err ? callback(err) : callback(null, allData);
  });
};

//
// Expose the various components included with nconf
//
nconf.stores   = require('./nconf/stores');
nconf.Provider = Provider;