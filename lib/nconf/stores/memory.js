/*
 * memory.js: Simple memory storage engine for nconf configuration(s)
 *
 * (C) 2011, Charlie Robbins
 *
 */

var nconf = require('nconf');

//
// ### function Memory (options)
// #### @options {Object} Options for this instance
// Constructor function for the Memory nconf store which maintains
// a nested json structure based on key delimiters `:`.
//
// e.g. `my:nested:key` ==> `{ my: { nested: { key: } } }` 
//
var Memory = exports.Memory = function (options) {
  options     = options || {};
  this.type   = 'memory';
  this.store  = {};
  this.mtimes = {};
};

//
// ### function get (key)
// #### @key {string} Key to retrieve for this instance.
// Retrieves the value for the specified key (if any).
//
Memory.prototype.get = function (key) {
  var target = this.store, 
      path   = nconf.path(key);

  //
  // Scope into the object to get the appropriate nested context
  //
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

//
// ### function set (key, value)
// #### @key {string} Key to set in this instance
// #### @value {literal|Object} Value for the specified key
// Sets the `value` for the specified `key` in this instance.
//
Memory.prototype.set = function (key, value) {
  var target = this.store, 
      path   = nconf.path(key);
  
  //
  // Update the `mtime` (modified time) of the key
  //
  this.mtimes[key] = Date.now();
  
  //
  // Scope into the object to get the appropriate nested context
  //
  while (path.length > 1) {
    key = path.shift();
    if (!target[key]) {
      target[key] = {};
    }
    
    target = target[key];
  }

  // Set the specified value in the nested JSON structure
  key = path.shift();
  target[key] = value;
  return true;
};

//
// ### function clear (key)
// #### @key {string} Key to remove from this instance
// Removes the value for the specified `key` from this instance.
//
Memory.prototype.clear = function (key) {
  var target = this.store, 
      path   = nconf.path(key);
  
  //
  // Remove the key from the set of `mtimes` (modified times)
  //
  delete this.mtimes[key];
  
  //
  // Scope into the object to get the appropriate nested context
  //
  while (path.length > 1) {
    key = path.shift();
    if (!target[key]) {
      return;
    }
    
    target = target[key];
  }
  
  // Delete the key from the nested JSON structure
  key = path.shift();
  delete target[key];
  return true;
};

//
// ### function reset (callback)
// Clears all keys associated with this instance.
//
Memory.prototype.reset = function () {
  this.mtimes = {};
  this.store  = {};
  return true;
}