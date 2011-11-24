/*
 * env.js: Simple memory-based store for environment variables
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */
 
var util = require('util'),
    Memory = require('./memory').Memory;
 
//
// ### function Env (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Env nconf store, a simple abstraction
// around the Memory store that can read process environment variables.
//
var Env = exports.Env = function (options) {
  Memory.call(this, options);

  this.type     = 'env';
  this.readOnly = true;
  this.options  = options || [];
};

// Inherit from the Memory store
util.inherits(Env, Memory);

//
// ### function loadSync ()
// Loads the data passed in from `process.env` into this instance.
//
Env.prototype.loadSync = function () {
  this.loadEnv();
  return this.store;
};

//
// ### function loadEnv ()
// Loads the data passed in from `process.env` into this instance.
//
Env.prototype.loadEnv = function () {
  var self = this;
  
  this.readOnly = false;
  Object.keys(process.env).filter(function (key) {
    return !self.options.length || self.options.indexOf(key) !== -1;
  }).forEach(function (key) {
    self.set(key, process.env[key]);
  });
  
  this.readOnly = true;
  return this.store;
};

