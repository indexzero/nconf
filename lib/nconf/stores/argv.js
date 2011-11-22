

var util = require('util'), 
    Memory = require('./memory').Memory, 
    optimist = require('optimist');

util.inherits(Argv, Memory);

function Argv (options) {
  Memory.call(this);
  this.type = 'argv';
  if('object' == typeof options) {
    this.store = optimist.options(options).argv;
  }
  else {
    this.store = optimist.argv;
  }
}

exports.Argv = Argv;