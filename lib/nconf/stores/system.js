/*
 * system.js: Simple memory-based store for process environment variables and
 *            command-line arguments.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var util = require('util'),
    Memory = require('./memory').Memory;
 
//
// ### function System (options)
// #### @options {Object} Options for this instance.
// Constructor function for the System nconf store, a simple abstraction
// around the Memory store that can read process environment variables
// and command-line arguments.
//
var System = exports.System = function (options) {
  options = options || {};
  Memory.call(this, options);

  this.type      = 'system';
  this.overrides = options.overrides || null;
  this.env       = options.env       || false;
  this.argv      = options.argv      || false;
};

// Inherit from the Memory store
util.inherits(System, Memory);

//
// ### function loadSync ()
// Loads the data passed in from `process.env` into this instance.
//
System.prototype.loadSync = function () {
  if (this.env) {
    this.loadEnv();
  }
  
  if (this.argv) {
    this.loadArgv();
  }
  
  if (this.overrides) {
    this.loadOverrides();
  }
  
  return this.store;
};

//
// ### function loadOverrides ()
// Loads any overrides set on this instance into
// the underlying managed `Memory` store.
//
System.prototype.loadOverrides = function () {
  if (!this.overrides) {
    return;
  }
  
  var self = this,
      keys = Object.keys(this.overrides);
  
  keys.forEach(function (key) {
    self.set(key, self.overrides[key]);
  });
  
  return this.store;
};

//
// ### function loadArgv ()
// Loads the data passed in from the command-line arguments 
// into this instance.
//
System.prototype.loadArgv = function () {
  var self = this, 
      argv;

  if (typeof this.argv === 'object') {
    argv = require('optimist')(process.argv.slice(2)).options(this.argv).argv;
  }
  else if (this.argv) {
    argv = require('optimist')(process.argv.slice(2)).argv;
  }
  
  if (!argv) {
    return;
  }
  
  Object.keys(argv).forEach(function (key) {
    self.set(key, argv[key]);
  });
  
  return this.store;
};

//
// ### function loadEnv ()
// Loads the data passed in from `process.env` into this instance.
//
System.prototype.loadEnv = function () {
  var self = this;
  
  if (!this.env) {
    return;
  }
  
  Object.keys(process.env).filter(function (key) {
    return !self.env.length || self.env.indexOf(key) !== -1;
  }).forEach(function (key) {
    self.set(key, process.env[key]);
  });
    
  return this.store;
};

