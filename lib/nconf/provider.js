/*
 * provider.js: Abstraction providing an interface into pluggable configuration storage.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var stores = require('./stores');

//
// ### function Provider (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Provider object responsible
// for exposing the pluggable storage features of `nconf`.
//
var Provider = exports.Provider = function (options) {
  options = options || {};
  this.store = stores.create(options.type || 'memory', options);
};

//
// ### function use (type, options)
// #### @type {string} Type of the nconf store to use.
// #### @options {Object} Options for the store instance.
// Sets the active `this.store` to a new instance of the 
// specified `type`.
//
Provider.prototype.use = function (type, options) {
  var self = this;
  options = options || {};

  function sameOptions () {
    return Object.keys(options).every(function (key) {
      return options[key] === self.store[key];
    });
  }
  
  if (!this.store || type.toLowerCase() !== this.store.type 
    || !sameOptions()) {
    this.store = stores.create(type, options);
  }
  
  return this;
};

//
// ### function get (key, callback)
// #### @key {string} Key to retrieve for this instance.
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Retrieves the value for the specified key (if any).
//
Provider.prototype.get = function (key, callback) {
  return this.store.get(key, callback);
};

//
// ### function set (key, value, callback)
// #### @key {string} Key to set in this instance
// #### @value {literal|Object} Value for the specified key
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Sets the `value` for the specified `key` in this instance.
//
Provider.prototype.set = function (key, value, callback) {
  return this.store.set(key, value, callback);
};

//
// ### function merge (key, value)
// #### @key {string} Key to merge the value into
// #### @value {literal|Object} Value to merge into the key
// Merges the properties in `value` into the existing object value
// at `key`. If the existing value `key` is not an Object, it will be
// completely overwritten.
//
Provider.prototype.merge = function (key, value, callback) {
  return this.store.merge(key, value, callback);
}

//
// ### function clear (key, callback)
// #### @key {string} Key to remove from this instance
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Removes the value for the specified `key` from this instance.
//
Provider.prototype.clear = function (key, callback) {
  return this.store.clear(key, callback);
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
Provider.prototype.load = function (callback) {
  //
  // If we don't have a callback and the current 
  // store is capable of loading synchronously
  // then do so.
  //
  if (!callback && this.store.loadSync) {
    return this.store.loadSync();
  }
  
  
  if (!this.store.load) {
    var error = new Error('nconf store ' + this.store.type + ' has no load() method');
    if (callback) {
      return callback (error);
    }
    
    throw error;
  }
  
  return this.store.load(callback);
};

//
// ### function save (value, callback) 
// #### @value {Object} **Optional** Config object to set for this instance
// #### @callback {function} Continuation to respond to when complete.
// Removes any existing configuration settings that may exist in this
// instance and then adds all key-value pairs in `value`. 
//
Provider.prototype.save = function (value, callback) {
  if (!callback) {
    callback = value;
    value = null;
    
    //
    // If we still don't have a callback and the
    // current store is capable of saving synchronously
    // then do so.
    //
    if (!callback && this.store.saveSync) {
      return this.store.saveSync();
    }
  }
  
  if (!this.store.save) {
    var error = new Error('nconf store ' + this.store.type + ' has no save() method');
    if (callback) {
      return callback (error);
    }
    
    throw error;
  }
  
  return this.store.save(value, callback);
};

//
// ### function reset (callback)
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Clears all keys associated with this instance.
//
Provider.prototype.reset = function (callback) {
  return this.store.reset(callback);
};