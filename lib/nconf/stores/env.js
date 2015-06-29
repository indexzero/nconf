/*
 * env.js: Simple memory-based store for environment variables
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

//
// ### function Env (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Env nconf store, a simple abstraction
// around the Memory store that can read process environment variables.
//
var Env = exports.Env = function (options) {
  options        = options || {};
  this.type      = 'env';
  this.readOnly  = true;
  this.whitelist = options.whitelist || [];
  this.separator = options.separator || '';

  if (typeof options.match === 'function'
      && typeof options !== 'string') {
    this.match = options.match;
  }

  if (options instanceof Array) {
    this.whitelist = options;
  }
  if (typeof(options) === 'string') {
    this.separator = options;
  }
};

//
// ### function loadSync ()
// Loads the data passed in from `process.env` into this instance.
//
Env.prototype.loadSync = function () {
  var self = this;

  return Object.keys(process.env).filter(function (key) {
    var matched = !self.match || key.match(self.match),
    var whitelisted = !self.whitelist || !self.whitelist.length
      || self.whitelist.indexOf(key) !== -1;

    return matched && whitelisted;
  }).reduce(function (acc, key) {
    key = self.separator
      ? common.key.apply(common, key.split(self.separator)
      : key;

    //
    // TODO: Support mappings of ENV var names to other
    // config names.
    //

    acc[key] = process.env[key];
    return acc;
  });
};
