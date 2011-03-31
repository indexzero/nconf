/*
 * memory.js: Simple memory storage engine for nconf configuration(s)
 *
 * (C) 2011, Charlie Robbins
 *
 */

var nconf = require('nconf');

var Memory = exports.Memory = function (options) {
  options    = options || {};
  this.store = {};
};

Memory.prototype.get = function (key) {
  var target = this.store, 
      path   = nconf.utils.path(key);

  while (path.length > 0) {
    key = path.shift();
    if (!target[key]) {
      return;
    }
    
    target = target[key];
    if (path.length === 0) {
      return target;
    }
  }
};

Memory.prototype.set = function (key, value) {
  var target = this.store, 
      path   = nconf.utils.path(key);
  
  while (path.length > 1) {
    key = path.shift();
    if (!target[key]) {
      target[key] = {};
    }
    
    target = target[key];
  }

  key = path.shift();
  target[key] = value;
  return true;
};

Memory.prototype.clear = function (key) {
  var target = this.store, 
      path   = nconf.utils.path(key);
  
  while (path.length > 1) {
    key = path.shift();
    if (!target[key]) {
      return;
    }
    
    target = target[key];
  }
  
  key = path.shift();
  delete target[key];
  return true;
};