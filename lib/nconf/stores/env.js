/*
 * env.js: Simple memory-based store for environment variables
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var common = require('../common');

//
// ### function Env (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Env nconf store, a simple abstraction
// around the Memory store that can read process environment variables.
//
var Env = module.exports = function (options) {
  if (!(this instanceof Env)) { return new Env(options); }

  options        = options || {};
  this.type      = 'env';
  this.readOnly  = true;
  this.whitelist = options.whitelist || [];
  this.separator = options.separator || '';
  this.source    = options.source;

  if (typeof options.match === 'function'
      && typeof options !== 'string') {
    this.match = options.match;
  }

  if (Array.isArray(options)) {
    this.whitelist = options;
  } else if (typeof options === 'string') {
    this.separator = options;
  }
};

//
// ### function loadSync (source)
// Loads the data passed in from `process.env` into this instance.
//
Env.prototype.loadSync = function (source) {
  source = source || this.source || process.env;
  var self = this;

  return Object.keys(source).filter(function (key) {
    var matched = !self.match || key.match(self.match);

    //
    // TODO: Denormalize whitelist for fast lookup.
    //
    return matched && (!self.whitelist || !self.whitelist.length
      || self.whitelist.indexOf(key) !== -1);
  }).reduce(function (acc, key) {
    key = self.separator
      ? common.key.apply(common, key.split(self.separator))
      : key;

    //
    // TODO: Support mappings of ENV var names to other
    // config names.
    //
    acc[key] = source[key];
    return acc;
  });
};
