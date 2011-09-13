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
  Memory.call(this, options);

  this.type = 'system';
  this.only = options.only || [];
  this.argv = options.argv || {};
};

// Inherit from the Memory store
util.inherits(System, Memory);

//
// ### function loadSync ()
// Loads the data passed in from `process.env` into this instance.
//
System.prototype.loadSync = function () {
  this.loadEnv();
  this.loadArgv();
  
  return this.store;
};

//
// ### function loadEnv ()
// Loads the data passed in from `process.env` into this instance.
//
System.prototype.loadEnv = function () {
  var self = this;
  
  Object.keys(process.env).filter(function (key) {
    return !self.only.length || self.only.indexOf(key) !== -1;
  }).forEach(function (key) {
    self.set(key, process.env[key]);
  });
    
  return this.store;
};

//
// ### function loadSync ()
// Loads the data passed in from the command-line arguments 
// into this instance.
//
Argv.prototype.loadArgv = function () {
  var self = this, argv = Object.keys(this.argv) > 0
    ? require('optimist').options(this.argv).argv
    : require('optimist').argv;
    
  Object.keys(argv).forEach(function (key) {
    self.set(key, argv[key])
  });
    
  return this.store;
};