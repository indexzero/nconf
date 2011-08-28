/*
 * utils.js: Utility functions for the nconf module.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var fs = require('fs'),
    async = require('async'),
    formats = require('./formats'),
    stores = require('./stores');

var common = exports;

//
// ### function loadFiles (files)
// #### @files {Object|Array} List of files (or settings object) to load.
// #### @callback {function} Continuation to respond to when complete.
// Loads all the data in the specified `files`.
//
common.loadFiles = function (files, callback) {
  if (!files) {
    return callback(null, {});
  }

  var options = Array.isArray(files) ? { files: files } : files,
      store = new stores.Memory();

  //
  // Set the default JSON format if not already
  // specified
  //
  options.format = options.format || formats.json;

  function loadFile (file, next) {
    fs.readFile(file, function (err, data) {
      if (err) {
        return next(err);
      }

      data = options.format.parse(data.toString());
      Object.keys(data).forEach(function (key) {
        store.merge(key, data[key]);
      });

      next();
    });
  }

  async.forEach(files, loadFile, function (err) {
    return err ? callback(err) : callback(null, store.store);
  });
};