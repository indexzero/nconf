/*
 * literal.js: Simple literal Object store for nconf.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var Literal = exports.Literal = function Literal(options) {
  options       = options || {};
  this.type     = 'literal';
  this.readOnly = true;
  this.store    = options.store || options;
};

//
// ### function loadSync (callback)
// Returns the data stored in `this.store` synchronously.
//
Literal.prototype.loadSync = function () {
  return this.store;
};
