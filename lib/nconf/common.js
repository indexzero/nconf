/*
 * utils.js: Utility functions for the nconf module.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs'),
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

  //
  // Set the default JSON format if not already
  // specified
  //
  options.format = options.format || formats.json;

  function parseFile (file, next) {
    fs.readFile(file, function (err, data) {
      return !err
        ? next(null, options.format.parse(data.toString()))
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

  //
  // Set the default JSON format if not already
  // specified
  //
  var options = Array.isArray(files) ? { files: files } : files;
  options.format = options.format || formats.json;

  return common.merge(options.files.map(function (file) {
    return options.format.parse(fs.readFileSync(file, 'utf8'));
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

//
// ### function parseValues (any)
// #### @any {string} String to parse as native data-type or return as is
// try to parse `any` as a native data-type
//
common.parseValues = function (value) {
  var val = value;
  
  try {
    val = JSON.parse(value);
  } catch (ignore) {
    // Check for any other well-known strings that should be "parsed"
    if (value === 'undefined'){
      val = void 0;
    }
  }

  return val;
};

//
// ### function transform(map, fn)
// #### @map {object} Object of key/value pairs to apply `fn` to
// #### @fn {function} Transformation function that will be applied to every key/value pair
// transform a set of key/value pairs and return the transformed result
common.transform = function(map, fn) {
  var pairs = Object.keys(map).map(function(key) {
    var obj = { key: key, value: map[key]};
    var result = fn.call(null, obj);

    if (!result) {
      return null;
    } else if (result.key) {
      return result;
    }

    var error = new Error('Transform function passed to store returned an invalid format: ' + JSON.stringify(result));
    error.name = 'RuntimeError';
    throw error;
  });


  return pairs
    .filter(function(pair) {
      return pair !== null;
    })
    .reduce(function(accumulator, pair) {
      accumulator[pair.key] = pair.value;
      return accumulator;
    }, {});
}
