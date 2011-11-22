

var util = require('util'), 
    Memory = require('./memory').Memory;

util.inherits(Literal, Memory);

function Literal (store) {
  Memory.call(this);
  this.type = 'literal';
  this.store = store || {};
}

exports.Literal = Literal;