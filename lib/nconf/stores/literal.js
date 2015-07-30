/*
 * literal.js: Simple literal Object store for nconf.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var Literal = module.exports = function Literal(options) {
  if (!(this instanceof Literal)) { return new Literal(options); }

  options       = options || {};
  this.type     = 'literal';
  this.readOnly = true;
  this.data     = options.data || options;
};

//
// ### function loadSync (callback)
// Returns the data stored in `this.data` synchronously.
//
Literal.prototype.loadSync = function () {
  return this.data;
};
