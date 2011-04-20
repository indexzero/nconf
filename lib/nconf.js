/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins
 *
 */

require.paths.unshift(__dirname);

var nconf = exports;

//
// ### Version 0.1.7 :: 4/20/2011
//
nconf.version = [0, 1, 7];

//
// Include the various store types exposed by nconf
//
nconf.stores  = require('nconf/stores');

//
// ### function use (type, options)
// #### @type {string} Type of the nconf store to use.
// #### @options {Object} Options for the store instance.
// Sets the active `nconf.store` to a new instance of the 
// specified `type`.
//
nconf.use = function (type, options) {
  if (!nconf.store || type.toLowerCase() !== nconf.store.type) {
    nconf.store = new nconf.stores.create(type, options);
  }
};

//
// ### function get (key, callback)
// #### @key {string} Key to retrieve for this instance.
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Retrieves the value for the specified key (if any).
//
nconf.get = function (key, callback) {
  return nconf.store.get(key, callback);
};

//
// ### function set (key, value, callback)
// #### @key {string} Key to set in this instance
// #### @value {literal|Object} Value for the specified key
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Sets the `value` for the specified `key` in this instance.
//
nconf.set = function (key, value, callback) {
  return nconf.store.set(key, value, callback);
};

//
// ### function clear (key, callback)
// #### @key {string} Key to remove from this instance
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Removes the value for the specified `key` from this instance.
//
nconf.clear = function (key, callback) {
  return nconf.store.clear(key, callback);
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
nconf.load = function (callback) {
  //
  // If we don't have a callback and the current 
  // store is capable of loading synchronously
  // then do so.
  //
  if (!callback && nconf.store.loadSync) {
    return nconf.store.loadSync();
  }
  
  
  if (!nconf.store.load) {
    var error = new Error('nconf store ' + nconf.store.type + ' has no load() method');
    if (callback) {
      return callback (error);
    }
    
    throw error;
  }
  
  return nconf.store.load(callback);
};

//
// ### function save (value, callback) 
// #### @value {Object} **Optional** Config object to set for this instance
// #### @callback {function} Continuation to respond to when complete.
// Removes any existing configuration settings that may exist in this
// instance and then adds all key-value pairs in `value`. 
//
nconf.save = function (value, callback) {
  if (!callback) {
    callback = value;
    value = null;
    
    //
    // If we still don't have a callback and the
    // current store is capable of saving synchronously
    // then do so.
    //
    if (!callback && nconf.store.saveSync) {
      return nconf.store.saveSync();
    }
  }
  
  if (!nconf.store.save) {
    var error = new Error('nconf store ' + nconf.store.type + ' has no save() method');
    if (callback) {
      return callback (error);
    }
    
    throw error;
  }
  
  return nconf.store.save(value, callback);
};

//
// ### function reset (callback)
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Clears all keys associated with this instance.
//
nconf.reset = function (callback) {
  return nconf.store.reset(callback);
};

//
// ### function key (arguments)
// Returns a `:` joined string from the `arguments`.
//
nconf.key = function () {
  return Array.prototype.slice.call(arguments).join(':');
};

//
// ### function path (key)
// #### @key {string} The ':' delimited key to split
// Returns a fully-qualified path to a nested nconf key. 
//
nconf.path = function (key) {
  return key.split(':');
};

//
// Use the `memory` engine by default
//
nconf.use('memory');
