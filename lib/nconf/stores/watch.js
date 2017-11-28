/*
 * watch.js: Watcher for nconf files
 *
 * (C) 2017, 21/23 and the Contributors.
 *
 */

var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    File = require('./file').File,
    formats = require('../formats'),
    Memory = require('./memory').Memory;

var noop = function () {},
    existsSync = fs.existsSync || path.existsSync;

//
// ### function Watch (options)
// #### @options {Object} Options for this instance
// Constructor function for the Watch nconf store, a simple abstraction
// around the Memory store that can watch configuration file,
// automatically update it self and notify about updates.
//
var Watch = exports.Watch = function (options) {
  if (!options || !options.file) {
    throw new Error('Missing required option `file`');
  }

  var self = this;

  Memory.call(this, options);

  this.type     = 'watch';
  this.file     = options.file;
  this.format   = options.format || formats.json;
  this.onChange = options.onChange || noop;

  if (existsSync(this.file)) {
    this.watcher = fs.watch(this.file, function () {
      self.load(function () {
        self.onChange();
      });
    });
  }
};

// Inherit from the Memory store
util.inherits(Watch, Memory);

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
Watch.prototype.load = function (callback) {
  return File.prototype.load.call(this, callback);
};

//
// ### function loadSync
// Attempts to load the data stored in `this.file` synchronously
// and responds appropriately.
//
Watch.prototype.loadSync = function () {
  return File.prototype.loadSync.call(this);
};

//
// ### function parse (contents)
// Returns a parsed content
//
Watch.prototype.parse = function (contents) {
  return this.format.parse(contents);
};

//
// ### function remove
// Removes the existing watcher
//
Watch.prototype.remove = function () {
  if (this.watcher) {
    this.watcher.close();
    this.watcher = null;
  }
};
