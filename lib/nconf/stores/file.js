/*
 * file.js: Simple file storage engine for nconf files
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var fs = require('fs'),
    util = require('util'),
    Memory = require('./memory').Memory;
 
//
// ### function File (options)
// #### @options {Object} Options for this instance
// Constructor function for the File nconf store, a simple abstraction
// around the Memory store that can persist configuration to disk.
//
var File = exports.File = function (options) {
  if (!options.file) {
    throw new Error ('Missing required option `files`');
  } 

  Memory.call(this, options);

  this.file   = options.file;
  this.format = options.format || JSON;
};

// Inherit from the Memory store
util.inherits(File, Memory);

//
// ### function save (value, callback) 
// #### @value {Object} _Ignored_ Left here for consistency
// #### @callback {function} Continuation to respond to when complete.
// Saves the current configuration object to disk at `this.file` 
// using the format specified by `this.format`.
//
File.prototype.save = function (value, callback) {
  if (!callback) {
    callback = value;
    value = null;
  }
  
  fs.writeFile(this.file, this.format.stringify(this.store), function (err) {
    return err ? callback(err) : callback();
  });
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
File.prototype.load = function (callback) {
  var self = this;
  fs.readFile(this.file, function (err, data) {
    if (err) {
      return callback(err);
    }
    
    data = self.format.parse(data.toString());
    self.store = data;
    callback(null, self.store);
  });
};