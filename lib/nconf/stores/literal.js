/*
 * literal.js: Simple literal Object store for nconf.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var util = require('util'), 
    Memory = require('./memory').Memory

var Literal = exports.Literal = function Literal (store) {
  Memory.call(this);
  this.type = 'literal'
  this.store = store || {};
};

// Inherit from Memory store.
util.inherits(Literal, Memory);