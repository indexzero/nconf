/*
 * provider.js: Abstraction providing an interface into pluggable configuration storage.
 *
 * (C) 2011, Charlie Robbins
 *
 */

var async = require('async'),
    common = require('./common'),
    stores = require('./stores');

//
// ### function Provider (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Provider object responsible
// for exposing the pluggable storage features of `nconf`.
//
var Provider = exports.Provider = function (options) {
  options        = options           || {};
  this.overrides = options.overrides || null
  this.useArgv   = options.useArgv   || false;

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
  if (this.overrides && Object.prototype.hasOwnProperty.call(this.overrides, key)) {
    if (callback) {
      callback(null, this.overrides[key]);
    }
    
    return this.overrides[key];
  }
  
  return this._execute('get', 1, key, callback);
};

//
// ### function set (key, value, callback)
// #### @key {string} Key to set in this instance
// #### @value {literal|Object} Value for the specified key
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Sets the `value` for the specified `key` in this instance.
//
Provider.prototype.set = function (key, value, callback) {
  return this._execute('set', 2, key, value, callback);
};

//
// ### function merge ([key,] value [, callback])
// #### @key {string} Key to merge the value into
// #### @value {literal|Object} Value to merge into the key
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Merges the properties in `value` into the existing object value at `key`. 
//
// 1. If the existing value `key` is not an Object, it will be completely overwritten.
// 2. If `key` is not supplied, then the `value` will be merged into the root.
//
Provider.prototype.merge = function () {
  var self = this,
      args = Array.prototype.slice.call(arguments),
      callback = typeof args[args.length - 1] === 'function' && args.pop(),
      value = args.pop(),
      key = args.pop();
      
  function mergeProperty (prop, next) {
    return self._execute('merge', 2, prop, value[prop], next);
  }
      
  if (!key) {
    if (Array.isArray(value) || typeof value !== 'object') {
      return onError(new Error('Cannot merge non-Object into top-level.'), callback);
    }
    
    return async.forEach(Object.keys(value), mergeProperty, callback || function () { })
  }
  
  return this._execute('merge', 2, key, value, callback);
};

//
// ### function mergeFiles (files, callback)
// #### @files {Object|Array} List of files (or settings object) to load.
// #### @callback {function} Continuation to respond to when complete.
// Merges all `key:value` pairs in the `files` supplied into the 
// store that is managed by this provider instance.
//
Provider.prototype.mergeFiles = function (files, callback) {
  var self = this;
  
  common.loadFiles(files, function (err, merged) {
    return !err 
      ? self.merge(merged, callback)
      : onError(err);
  });
};

//
// ### function clear (key, callback)
// #### @key {string} Key to remove from this instance
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Removes the value for the specified `key` from this instance.
//
Provider.prototype.clear = function (key, callback) {
  return this._execute('clear', 1, key, callback);
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
  
  return !this.store.load
    ? onError(new Error('nconf store ' + this.store.type + ' has no load() method'), callback)
    : this.store.load(callback);
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
  
  return !this.store.save 
    ? onError(new Error('nconf store ' + this.store.type + ' has no save() method'), callback)
    : this.store.save(value, callback);
};

//
// ### function reset (callback)
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Clears all keys associated with this instance.
//
Provider.prototype.reset = function (callback) {
  return this._execute('reset', 0, callback);  
};

//
// ### @private function _execute (action, syncLength, [arguments])
// #### @action {string} Action to execute on `this.store`.
// #### @syncLength {number} Function length of the sync version.
// #### @arguments {Array} Arguments array to apply to the action
// Executes the specified `action` on `this.store`, ensuring a callback supplied
// to a synchronous store function is still invoked.
//
Provider.prototype._execute = function (action, syncLength /* [arguments] */) {
  var args = Array.prototype.slice.call(arguments, 2),
      callback,
      response;
      
  if (this.store[action].length > syncLength) {
    return this.store[action].apply(this.store, args);
  }
  
  callback = typeof args[args.length - 1] === 'function' && args.pop();
  response = this.store[action].apply(this.store, args);
  
  if (callback) {
    callback(null, response);
  }
  
  return response;
}

//
// ### getter @useArgv {boolean}
// Gets a property indicating if we should wrap calls to `.get` 
// by checking `optimist.argv`.
//
Provider.prototype.__defineGetter__('useArgv', function () {
  return this._useArgv;
});

//
// ### setter @useArgv {boolean}
// Sets a property indicating if we should wrap calls to `.get` 
// by checking `optimist.argv`.
//
Provider.prototype.__defineSetter__('useArgv', function (val) {
  this._useArgv  = val            || false;
  
  if (this._useArgv) {
    this._argv     = this._argv     || require('optimist').argv;
    this.overrides = this.overrides || this._argv;
  }
});

//
// Throw the `err` if a callback is not supplied
//
function onError(err, callback) {
  if (callback) {
    return callback(err);
  }
  
  throw err;
}