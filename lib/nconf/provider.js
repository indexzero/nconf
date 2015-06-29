/*
 * provider.js: Abstraction providing an interface into pluggable configuration storage.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var async = require('async'),
    common = require('./common');

//
// ### function Provider (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Provider object responsible
// for exposing the pluggable storage features of `nconf`.
//
var Provider = exports.Provider = function (options) {
  //
  // Setup default options for working with `stores`,
  // `overrides`, `process.env` and `process.argv`.
  //
  options       = options || {};
  this.stores  = {};
  this.sources = [];

  //
  // Actual values stores on this instance.
  //
  this.store    = {};
  this.mtimes   = {};
  this.readOnly = false;
  this.loadFrom = options.loadFrom || null;
  this.logicalSeparator = options.logicalSeparator || ':';

  if (this.loadFrom) {
    this.store = common.loadFilesSync(this.loadFrom);
  }

  this.init(options);
};

//
// Define wrapper functions for using basic stores
// in this instance
//

['argv', 'env'].forEach(function (type) {
  Provider.prototype[type] = function () {
    var args = [type].concat(Array.prototype.slice.call(arguments));
    return this.add.apply(this, args);
  };
});

//
// ### function file (key, options)
// #### @key {string|Object} Fully qualified options, name of file store, or path.
// #### @path {string|Object} **Optional** Full qualified options, or path.
// Adds a new `File` store to this instance. Accepts the following options
//
//    nconf.file({ file: '.jitsuconf', dir: process.env.HOME, search: true });
//    nconf.file('path/to/config/file');
//    nconf.file('userconfig', 'path/to/config/file');
//    nconf.file('userconfig', { file: '.jitsuconf', search: true });
//
Provider.prototype.file = function (key, options) {
  if (arguments.length == 1) {
    options = typeof key === 'string' ? { file: key } : key;
    key = 'file';
  }
  else {
    options = typeof options === 'string'
      ? { file: options }
      : options;
  }

  options.type = 'file';
  return this.add(key, options);
};

//
// Define wrapper functions for using
// overrides and defaults
//
['defaults', 'overrides'].forEach(function (type) {
  Provider.prototype[type] = function (options) {
    options = options || {};
    if (!options.type) {
      options.type = 'literal';
    }

    return this.add(type, options);
  };
});

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
Provider.prototype.add = function (name, options, usage) {
  options  = options      || {};
  var type = options.type || name;

  if (!require('../nconf')[common.storeType(type)]) {
    throw new Error('Cannot add store with unknown type: ' + type);
  }

  this.stores[name] = this.create(type, options, usage);

  if (this.stores[name].loadSync) {
    this.stores[name].loadSync();
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
  delete this.stores[name];
  return this;
};

//
// ### function create (type, options)
// #### @type {string} Type of the nconf store to use.
// #### @options {Object} Options for the store instance.
// Creates a store of the specified `type` using the
// specified `options`.
//
Provider.prototype.create = function (type, options, usage) {
  return new (require('../nconf')[common.storeType(type)])(options, usage);
};

//
// ### function init (options)
// #### @options {Object} Options to initialize this instance with.
// Initializes this instance with additional `stores` or `sources` in the
// `options` supplied.
//
Provider.prototype.init = function (options) {
  var self = this;

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
// ### function get (key)
// #### @key {string} Key to retrieve for this instance.
// Retrieves the value for the specified key (if any).
//
Provider.prototype.get = function (key) {
  var target = this.store,
      path   = common.path(key, this.logicalSeparator);

  //
  // Scope into the object to get the appropriate nested context
  //
  while (path.length > 0) {
    key = path.shift();
    if (target && target.hasOwnProperty(key)) {
      target = target[key];
      continue;
    }
    return undefined;
  }

  return target;
};

//
// ### function set (key, value)
// #### @key {string} Key to set in this instance
// #### @value {literal|Object} Value for the specified key
// Sets the `value` for the specified `key` in this instance.
//
Provider.prototype.set = function (key, value) {
  if (this.readOnly) {
    return false;
  }

  var target = this.store,
      path   = common.path(key, this.logicalSeparator);

  if (path.length === 0) {
    //
    // Root must be an object
    //
    if (!value || typeof value !== 'object') {
      return false;
    }
    else {
      this.reset();
      this.store = value;
      return true;
    }
  }

  //
  // Update the `mtime` (modified time) of the key
  //
  this.mtimes[key] = Date.now();

  //
  // Scope into the object to get the appropriate nested context
  //
  while (path.length > 1) {
    key = path.shift();
    if (!target[key] || typeof target[key] !== 'object') {
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
Provider.prototype.clear = function (key) {
  if (this.readOnly) {
    return false;
  }

  var target = this.store,
      value  = target,
      path   = common.path(key, this.logicalSeparator);

  //
  // Remove the key from the set of `mtimes` (modified times)
  //
  delete this.mtimes[key];

  //
  // Scope into the object to get the appropriate nested context
  //
  for (var i = 0; i < path.length - 1; i++) {
    key = path[i];
    value = target[key];
    if (typeof value !== 'function' && typeof value !== 'object') {
      return false;
    }
    target = value;
  }

  // Delete the key from the nested JSON structure
  key = path[i];
  delete target[key];
  return true;
};

//
// ### function merge (key, value)
// #### @key {string} Key to merge the value into
// #### @value {literal|Object} Value to merge into the key
// Merges the properties in `value` into the existing object value
// at `key`. If the existing value `key` is not an Object, it will be
// completely overwritten.
//
Provider.prototype.merge = function (key, value) {
  if (this.readOnly) {
    return false;
  }

  //
  // If the key is not an `Object` or is an `Array`,
  // then simply set it. Merging is for Objects.
  //
  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    return this.set(key, value);
  }

  var self    = this,
      target  = this.store,
      path    = common.path(key, this.logicalSeparator),
      fullKey = key;

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

  //
  // If the current value at the key target is not an `Object`,
  // or is an `Array` then simply override it because the new value
  // is an Object.
  //
  if (typeof target[key] !== 'object' || Array.isArray(target[key])) {
    target[key] = value;
    return true;
  }

  return Object.keys(value).every(function (nested) {
    return self.merge(common.keyed(self.logicalSeparator, fullKey, nested), value[nested]);
  });
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
Provider.prototype.load = function (callback) {
  var self = this;

  function getStores () {
    var stores = Object.keys(self.stores);
    stores.reverse();
    return stores.map(function (name) {
      return self.stores[name];
    });
  }

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
      self.use('sources', {
        type: 'literal',
        store: data
      });
    }
  }

  function loadSources () {
    var sourceHierarchy = self.sources.splice(0);
    sourceHierarchy.reverse();

    //
    // If we don't have a callback and the current
    // store is capable of loading synchronously
    // then do so.
    //
    if (!callback) {
      mergeSources(loadBatch(sourceHierarchy));
      return loadBatch(getStores());
    }

    loadBatch(sourceHierarchy, function (err, data) {
      if (err) {
        return callback(err);
      }

      mergeSources(data);
      return loadBatch(getStores(), callback);
    });
  }

  return self.sources.length
    ? loadSources()
    : loadBatch(getStores(), callback);
};

//
// ### function save (callback)
// #### @callback {function} **optional**  Continuation to respond to when
// complete.
// Instructs each provider to save.  If a callback is provided, we will attempt
// asynchronous saves on the providers, falling back to synchronous saves if
// this isn't possible.  If a provider does not know how to save, it will be
// ignored.  Returns an object consisting of all of the data which was
// actually saved.
//
Provider.prototype.sync = function (value, callback) {
  if (!callback && typeof value === 'function') {
    callback = value;
    value = null;
  }

  var self = this,
      names = Object.keys(this.stores);

  function saveStoreSync(memo, name) {
    var store = self.stores[name];

    //
    // If the `store` doesn't have a `saveSync` method,
    // just ignore it and continue.
    //
    if (store.saveSync) {
      var ret = store.saveSync();
      if (typeof ret == 'object' && ret !== null) {
        memo.push(ret);
      }
    }
    return memo;
  }

  function saveStore(memo, name, next) {
    var store = self.stores[name];

    //
    // If the `store` doesn't have a `save` or saveSync`
    // method(s), just ignore it and continue.
    //

    if (store.save) {
      return store.save(function (err, data) {
        if (err) {
          return next(err);
        }

        if (typeof data == 'object' && data !== null) {
          memo.push(data);
        }

        next(null, memo);
      });
    }
    else if (store.saveSync) {
      memo.push(store.saveSync());
    }

    next(null, memo);
  }

  //
  // If we don't have a callback and the current
  // store is capable of saving synchronously
  // then do so.
  //
  if (!callback) {
    return common.merge(names.reduce(saveStoreSync, []));
  }

  async.reduce(names, [], saveStore, function (err, objs) {
    return err ? callback(err) : callback(null, common.merge(objs));
  });
};
