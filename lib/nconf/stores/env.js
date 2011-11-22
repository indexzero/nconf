

var u = require('utile'), 
    Memory = require('./memory').Memory, 
    optimist = require('optimist');

u.inherits(Env, Memory);

function Env (prefix) {
  var store = {},
      l = prefix.length;

  Memory.call(this);
  this.type = 'env';
  
  u.each(process.env, function (value, name) {
    if(name.indexOf(prefix) === 0) {
      store[name.slice(l)] = value;
    }
  });
  this.store = store;
}

exports.Env = Env;