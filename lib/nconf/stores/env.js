/*
 * env.js: Simple memory-based store for environment variables
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var util = require('util'),
    common = require('../common'),
    Memory = require('./memory').Memory;

//
// ### function Env (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Env nconf store, a simple abstraction
// around the Memory store that can read process environment variables.
//
var Env = exports.Env = function (options) {
  Memory.call(this, options);

  options        = options || {};
  this.type      = 'env';
  this.readOnly  = true;
  this.filter    = options.filter || [];
  this.separator = options.separator || '';
  // Backwards compatibility
  if (options instanceof Array) {
    this.filter = options;
  }
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
    return !self.filter.length || self.filter.indexOf(key) !== -1;
  }).forEach(function (key) {
    if (self.separator) {
      self.set(common.key.apply(common, key.split(self.separator)), process.env[key]);
    } else {
      self.set(key, process.env[key]);
    }
  });

  this.readOnly = true;
  return this.store;
};

