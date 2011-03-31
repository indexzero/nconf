/*
 * file.js: Simple file storage engine for nconf files
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var fs = require('fs'),
    util = require('util'),
    Memory = require('./memory').Memory;
 
var File = exports.File = function (options) {
  if (!options.file) {
    throw new Error ('Missing required option `files`');
  } 

  nconf.stores.Memory.call(this, options);

  this.file   = options.file;
  this.format = options.format || JSON;
};

util.inherits(File, Memory);

File.prototype.save = function (callback) {
  fs.save(this.file, this.format.stringify(this.store), function (err) {
    return err ? callback(err) : callback();
  });
};

File.prototype.load = function (callback) {
  var self = this;
  fs.load(this.file, function (err, data) {
    if (err) {
      return callback(err);
    }
    
    self.store = self.format.parse(data.toString());
    callback(null, self.store);
  });
};