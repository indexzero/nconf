/*
 * utils.js: Utility functions for the nconf module.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    formats = require('./formats'),
    Memory = require('./stores/memory').Memory;

var common = exports;

//
// ### function path (key)
// #### @key {string} The ':' delimited key to split
// Returns a fully-qualified path to a nested nconf key.
// If given null or undefined it should return an empty path.
// '' should still be respected as a path.
//
common.path = function (key, separator) {
  separator = separator || ':';
  return key == null ? [] : key.split(separator);
};

//
// ### function key (arguments)
// Returns a `:` joined string from the `arguments`.
//
common.key = function () {
  return Array.prototype.slice.call(arguments).join(':');
};

//
// ### function key (arguments)
// Returns a joined string from the `arguments`,
// first argument is the join delimiter.
//
common.keyed = function () {
  return Array.prototype.slice.call(arguments, 1).join(arguments[0]);
};

//
// ### function getFileFormat (file, format)
// Detect file format and return format object
//
common.getFileFormat = function (file, format) {
  format = format || path.extname(this.file).slice(1);

  if (typeof format === 'string' && formats[format]) {
    format = formats[format];
  }

  if (!format.parse || !format.stringify) {
    format = formats.json;
  }

  return format;
};

//
// ### function loadFiles (files, callback)
// #### @files {Object|Array} List of files (or settings object) to load.
// #### @callback {function} Continuation to respond to when complete.
// Loads all the data in the specified `files`.
//
common.loadFiles = function (files, callback) {
  if (!files) {
    return callback(null, {});
  }

  var options = Array.isArray(files) ? { files: files } : files;

  function parseFile (file, next) {
    fs.readFile(file, function (err, data) {
      var format = common.getFileFormat(file, options.format);
      return !err
        ? next(null, format.parse(data.toString()), options.formatOptions)
        : next(err);
    });
  }

  async.map(options.files, parseFile, function (err, objs) {
    return err ? callback(err) : callback(null, common.merge(objs));
  });
};

//
// ### function loadFilesSync (files)
// #### @files {Object|Array} List of files (or settings object) to load.
// Loads all the data in the specified `files` synchronously.
//
common.loadFilesSync = function (files) {
  if (!files) {
    return;
  }

  var options = Array.isArray(files) ? { files: files } : files;

  return common.merge(options.files.map(function (file) {
    var format = common.getFileFormat(file, options.format);
    return format.parse(fs.readFileSync(file, 'utf8'), options.formatOptions);
  }));
};

//
// ### function merge (objs)
// #### @objs {Array} Array of object literals to merge
// Merges the specified `objs` using a temporary instance
// of `stores.Memory`.
//
common.merge = function (objs) {
  var store = new Memory();

  objs.forEach(function (obj) {
    Object.keys(obj).forEach(function (key) {
      store.merge(key, obj[key]);
    });
  });

  return store.store;
};

//
// ### function capitalize (str)
// #### @str {string} String to capitalize
// Capitalizes the specified `str`.
//
common.capitalize = function (str) {
  return str && str[0].toUpperCase() + str.slice(1);
};
