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
  var self = this;  
  
  //
  // Setup default options for working with `stores`,
  // `overrides`, `process.env` and `process.argv`.
  //
  options         = options           || {};
  this._overrides = options.overrides || null;
  this._argv      = options.argv      || false;
  this._env       = options.env       || false;
  this._reserved  = Object.keys(Provider.prototype);
  this._stores    = [];
  this.sources    = [];
  
  //
  // Add the default `system` store for working with
  // `overrides`, `process.env`, `process.argv` and
  // a simple in-memory objects.
  //
  this.add('system', options);
  
  //
  // Add any stores passed in through the options
  // to this instance.
  //
  if (options.type) {
    this.add(options.type, options);
  }
  else if (options.store) {
    this.add(options.store.name || options.store.type, options.store);
  }
  else if (options.stores) {
    Object.keys(options.stores).forEach(function (name) {
      var store = options.stores[name];
      self.add(store.name || name || store.type, store);
    });
  }
  
  //
  // Add any read-only sources to this instance
  //
  if (options.source) {
    this.sources.push(this.create(options.source.type || options.source.name, options.source));
  }
  else if (options.sources) {
    Object.keys(options.sources).forEach(function (name) {
      var source = options.sources[name];
      self.sources.push(self.create(source.type || source.name || name, source));
    });
  }
};

//
// ### function use (name, options)
// #### @type {string} Type of the nconf store to use.
// #### @options {Object} Options for the store instance.
// Adds (or replaces) a new store with the specified `name` 
// and `options`. If `options.type` is not set, then `name` 
// will be used instead:
//
//    provider.use('file');
//    provider.use('file', { type: 'file', filename: '/path/to/userconf' })
//
Provider.prototype.use = function (name, options) {
  if (name === 'system') {
    return;
  }
  else if (this._reserved.indexOf(name) !== -1) {
    throw new Error('Cannot use reserved name: ' + name);
  }
  
  options  = options      || {};
  var type = options.type || name;

  function sameOptions (store) {
    return Object.keys(options).every(function (key) {
      return options[key] === store[key];
    });
  }
  
  var store = this[name],
      update = store && !sameOptions(store);
  
  if (!store || update) {
    if (update) {
      this.remove(name);
    }
    
    this.add(name, options);
  }
  
  return this;
};

//
// ### function add (name, options)
// #### @name {string} Name of the store to add to this instance
// #### @options {Object} Options for the store to create
// Adds a new store with the specified `name` and `options`. If `options.type`
// is not set, then `name` will be used instead:
//
//    provider.add('memory');
//    provider.add('userconf', { type: 'file', filename: '/path/to/userconf' })
//
Provider.prototype.add = function (name, options) {
  if (this._reserved.indexOf(name) !== -1) {
    throw new Error('Cannot use reserved name: ' + name);
  }
  
  options  = options      || {};
  var type = options.type || name;
  
  if (Object.keys(stores).indexOf(common.capitalize(type)) === -1) {
    throw new Error('Cannot add store with unknown type: ' + type);
  }
  
  this[name] = this.create(type, options);
  this._stores.push(name);
  
  if (this[name].loadSync) {
    this[name].loadSync();
  }
  
  return this;
};

//
// ### function remove (name) 
// #### @name {string} Name of the store to remove from this instance
// Removes a store with the specified `name` from this instance. Users
// are allowed to pass in a type argument (e.g. `memory`) as name if
// this was used in the call to `.add()`.
//
Provider.prototype.remove = function (name) {
  if (this._reserved.indexOf(name) !== -1) {
    throw new Error('Cannot use reserved name: ' + name);
  }
  else if (!this[name]) {
    throw new Error('Cannot remove store that does not exist: ' + name);
  }
  
  delete this[name];
  this._stores.splice(this._stores.indexOf(name), 1);
  return this;
};

//
// ### function create (type, options)
// #### @type {string} Type of the nconf store to use.
// #### @options {Object} Options for the store instance.
// Creates a store of the specified `type` using the 
// specified `options`.
//
Provider.prototype.create = function (type, options) {
  return new stores[common.capitalize(type.toLowerCase())](options);
};

//
// ### function get (key, callback)
// #### @key {string} Key to retrieve for this instance.
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Retrieves the value for the specified key (if any).
//
Provider.prototype.get = function (key, callback) {
  //
  // If there is no callback we can short-circuit into the default
  // logic for traversing stores.
  //
  if (!callback) {
    return this._execute('get', 1, key, callback);
  }
  
  //
  // Otherwise the asynchronous, hierarchical `get` is 
  // slightly more complicated because we do not need to traverse
  // the entire set of stores, but up until there is a defined value.
  //
  var current = 0,
      self = this,
      response;
      
  async.whilst(function () {
    return typeof response === 'undefined' && current < self._stores.length;
  }, function (next) {
    var store = self[self._stores[current]];
    current++;
    
    if (store.get.length >= 2) {
      return store.get(key, function (err, value) {
        if (err) {
          return next(err);
        }
        
        response = value;
        next();
      });
    }
    
    response = store.get(key);
    next();
  }, function (err) {
    return err ? callback(err) : callback(null, response);
  });
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
// ### function reset (callback)
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Clears all keys associated with this instance.
//
Provider.prototype.reset = function (callback) {
  return this._execute('reset', 0, callback);  
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
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
Provider.prototype.load = function (callback) {
  var self = this,
      stores = this._stores.map(function (name) { return self[name] });
  
  function loadStoreSync(store) {
    if (!store.loadSync) {
      throw new Error('nconf store ' + store.type + ' has no loadSync() method');
    }
    
    return store.loadSync();
  }
  
  function loadStore(store, next) {
    if (!store.load && !store.loadSync) {
      return next(new Error('nconf store ' + store.type + ' has no load() method'));
    }
    
    return store.loadSync
      ? next(null, store.loadSync())
      : store.load(next);
  }
  
  function loadBatch (targets, done) {
    if (!done) {
      return common.merge(targets.map(loadStoreSync));
    }

    async.map(targets, loadStore, function (err, objs) {
      return err ? done(err) : done(null, common.merge(objs));
    });
  }
  
  function mergeSources (data) {
    //
    // If `data` was returned then merge it into 
    // the system store.
    //
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(function (key) {
        self.system.merge(key, data[key]);
      });
    }
  }
  
  function loadSources () {
    //
    // If we don't have a callback and the current 
    // store is capable of loading synchronously
    // then do so.
    //
    if (!callback) {
      mergeSources(loadBatch(self.sources));
      return loadBatch(stores);
    }
    
    loadBatch(self.sources, function (err, data) {
      if (err) {
        return callback(err);
      }
      
      mergeSources(data);
      return loadBatch(stores, callback);
    });
  }
  
  return self.sources.length 
    ? loadSources()
    : loadBatch(stores, callback);
};

//
// ### function save (value, callback) 
// #### @value {Object} **Optional** Config object to set for this instance
// #### @callback {function} Continuation to respond to when complete.
// Removes any existing configuration settings that may exist in this
// instance and then adds all key-value pairs in `value`. 
//
Provider.prototype.save = function (value, callback) {
  if (!callback && typeof value === 'function') {
    callback = value;
    value = null;
  }
  
  var self = this;
  
  function saveStoreSync(name) {
    var store = self[name];
    
    if (!store.saveSync) {
      throw new Error('nconf store ' + store.type + ' has no saveSync() method');
    }
    
    return store.saveSync();
  }
  
  function saveStore(name, next) {
    var store = self[name];
    
    if (!store.save && !store.saveSync) {
      return next(new Error('nconf store ' + store.type + ' has no save() method'));
    }
    
    return store.saveSync
      ? next(null, store.saveSync())
      : store.save(next);
  }
  
  //
  // If we don't have a callback and the current 
  // store is capable of saving synchronously
  // then do so.
  //
  if (!callback) {
    return common.merge(this._stores.map(saveStoreSync));
  }
  
  async.map(this._stores, saveStore, function (err, objs) {
    return err ? callback(err) : callback();
  });  
};

//
// ### @private function _execute (action, syncLength, [arguments])
// #### @action {string} Action to execute on `this.store`.
// #### @syncLength {number} Function length of the sync version.
// #### @arguments {Array} Arguments array to apply to the action
// Executes the specified `action` on all stores for this instance, ensuring a callback supplied
// to a synchronous store function is still invoked.
//
Provider.prototype._execute = function (action, syncLength /* [arguments] */) {
  var args = Array.prototype.slice.call(arguments, 2),
      callback = typeof args[args.length - 1] === 'function' && args.pop(),
      self = this,
      response;
  
  function runAction (name, next) {
    var store = self[name]
    
    return store[action].length > syncLength
      ? store[action].apply(store, args.concat(next))
      : next(null, store[action].apply(store, args));
  }
  
  if (callback) {
    return async.forEach(self._stores, runAction, function (err) {
      return err ? callback(err) : callback();
    });
  }

  this._stores.forEach(function (name) {
    var store = self[name];
    response = store[action].apply(store, args);
  });
    
  return response;
}

//
// ### @argv {boolean}
// Gets or sets a property representing overrides which supercede all 
// other values for this instance.
//
Provider.prototype.__defineSetter__('overrides', function (val) { updateSystem.call(this, 'overrides', val) });
Provider.prototype.__defineGetter__('overrides', function () { return this._argv });

//
// ### @argv {boolean}
// Gets or sets a property indicating if we should wrap calls to `.get` 
// by checking `optimist.argv`. Can be a boolean or the pass-thru
// options for `optimist`.
//
Provider.prototype.__defineSetter__('argv', function (val) { updateSystem.call(this, 'argv', val) });
Provider.prototype.__defineGetter__('argv', function () { return this._argv });

//
// ### @env {boolean}
// Gets or sets a property indicating if we should wrap calls to `.get` 
// by checking `process.env`. Can be a boolean or an Array of 
// environment variables to extract.
//
Provider.prototype.__defineSetter__('env', function (val) { updateSystem.call(this, 'env', val) });
Provider.prototype.__defineGetter__('env', function () { return this._env });

//
// Throw the `err` if a callback is not supplied
//
function onError(err, callback) {
  if (callback) {
    return callback(err);
  }
  
  throw err;
}

//
// Helper function for working with the
// default `system` store for providers.
//
function updateSystem(prop, value) {
  var system = this['system'];
  
  if (system[prop] === value) {
    return;
  }
  
  value = value || false;
  this['_' + prop] = value;
  system[prop] = value;
  system.loadSync();
}