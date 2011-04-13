/*
 * redis.js: Redis storage engine for nconf configuration(s)
 *
 * (C) 2011, Charlie Robbins
 *
 */

var async = require('async'),
    redis = require('redis'),
    nconf = require('nconf'),
    Memory = require('./memory').Memory;

//
// ### function Redis (options)
// #### @options {Object} Options for this instance
// Constructor function for the Redis nconf store which maintains
// a nested Redis key structure based on key delimiters `:`.
//
// e.g. 
//     my:nested:key, 'value' 
//       namespace:keys        ==> ['my']
//       namespace:nested:keys ==> ['key']
//       namespace:nested:key  ==> 'value'
//
var Redis = exports.Redis = function (options) {
  options        = options || {};
  this.type      = 'redis';
  this.namespace = options.namespace || 'nconf';
  this.host      = options.host || 'localhost';
  this.port      = options.port || 6379;
  this.ttl       = options.ttl  || 60 * 60 * 1000;
  this.cache     = new Memory();
  this.redis     = redis.createClient(options.port, options.host);
  
  if (options.auth) {
    this.redis.auth(options.auth);
  }
  
  // Suppress errors from the Redis client
  this.redis.on('error', function (err) { 
    require('eyes').inspect(err);
  });
};

//
// ### function get (key, callback)
// #### @key {string} Key to retrieve for this instance.
// #### @callback {function} Continuation to respond to when complete.
// Retrieves the value for the specified key (if any).
//
Redis.prototype.get = function (key, callback) {
  var self    = this,
      result  = {},
      now     = Date.now(),
      mtime   = this.cache.mtimes[key],
      fullKey = nconf.key(this.namespace, key);
  
  // Set the callback if not provided for "fire and forget"
  callback = callback || function () { };
  
  //
  // If the key exists in the cache and the ttl is less than 
  // the value set for this instance, return from the cache.
  //
  if (mtime && now - mtime < this.ttl) {
    return callback(null, this.cache.get(key));
  }
  
  //
  // Get the set of all children keys for the `key` supplied. If the value
  // to be returned is an Object, this list will not be empty.
  //
  this.redis.smembers(nconf.key(fullKey, 'keys'), function (err, keys) {
    function addValue (source, next) {
      self.get(nconf.key(key, source), function (err, value) {
        if (err) {
          return next(err);
        }
        
        result[source] = value;
        next();
      });
    }
    
    if (keys && keys.length > 0) {
      //
      // If the value to be retrieved is an Object, recursively attempt
      // to get the value from redis. Here we use a recursive call to `this.get`
      // to support nested Object keys.
      //
      async.forEach(keys, addValue, function (err) {
        if (err) {
          return callback(err);
        }
        
        self.cache.set(key, result);
        callback(null, result);
      })
    }
    else {
      //
      // If there are no keys, then the value to be retrieved is a literal
      // and we can simply return the value from redis directly. 
      //
      self.redis.get(fullKey, function (err, value) {
        if (err) {
          return callback(err);
        }
        
        result = JSON.parse(value);
        if (result) {
          self.cache.set(key, result);
        }
        
        callback(null, result);
      });
    }
  });
};

//
// ### function set (key, value, callback)
// #### @key {string} Key to set in this instance
// #### @value {literal|Object} Value for the specified key
// #### @callback {function} Continuation to respond to when complete.
// Sets the `value` for the specified `key` in this instance.
//
Redis.prototype.set = function (key, value, callback) {
  var self = this,
      path = nconf.path(key);
  
  // Set the callback if not provided for "fire and forget"
  callback = callback || function () { };
  
  function addKey (partial, next) {
    var index  = path.indexOf(partial),
        base   = [self.namespace].concat(path.slice(0, index)),
        parent = nconf.key.apply(null, base.concat(['keys']));

    self.redis.sadd(parent, partial, next);
  };

  //
  // Iterate over the entire key path and add each key to the 
  // parent key-set if it doesn't exist already.
  //
  async.forEach(path, addKey, function (err) {
    if (err) {
      return callback(err);
    }
    
    var fullKey = nconf.key(self.namespace, key);
    
    if (!Array.isArray(value) && typeof value === 'object') {
      //
      // If the value is an `Object` (and not an `Array`) then
      // nest into the value and set the child keys appropriately.
      // This is done for efficient lookup when setting Object keys.
      // (i.e. If you set and Object then wish to later retrieve only a 
      // member of that Object, the entire Object need not be retrieved).  
      //
      self._setObject(fullKey, value, callback);
    }
    else {
      //
      // If the value is a simple literal (or an `Array`) then JSON 
      // stringify it and put it into Redis.
      //
      value = JSON.stringify(value);
      self.cache.set(key, value);
      self.redis.set(fullKey, value, callback);
    }
  });
};

//
// ### function clear (key, callback)
// #### @key {string} Key to remove from this instance
// #### @callback {function} Continuation to respond to when complete.
// Removes the value for the specified `key` from this instance.
//
Redis.prototype.clear = function (key, callback) {
  var self    = this,
      result  = {},
      path    = [this.namespace].concat(nconf.path(key)),
      last    = path.pop(),
      fullKey = nconf.key(this.namespace, key);

  // Set the callback if not provided for "fire and forget"
  callback = callback || function () { };

  // 
  // Clear the key from the cache for this instance
  //
  this.cache.clear(key);
  
  //
  // Remove the `key` from the parent set of keys.
  //
  this.redis.srem(nconf.key.apply(null, path.concat(['keys'])), last, function (err) {
    //
    // Remove the value from redis by iterating over the set of keys (if any)
    // and deleting each value. If no keys, then just delete the simple literal.
    //
    self.redis.smembers(nconf.key(fullKey, 'keys'), function (err, keys) {
      function removeValue (child, next) {
        //
        // Recursively call `self.clear` here to ensure we remove any
        // nested Objects completely from this instance.
        //
        self.clear(nconf.key(key, child), next);
      }
       
      if (keys && keys.length > 0) {
        //
        // If there are child keys then iterate over them, 
        // removing each child along the way.
        //
        async.forEach(keys, removeValue, callback);
      }
      else {
        //
        // Otherwise if this is just a simple literal, then 
        // simply remove it from Redis directly.
        //
        self.redis.del(fullKey, callback);
      }
    });
  });
};

//
// ### function save (value, callback) 
// #### @value {Object} Config object to set for this instance
// #### @callback {function} Continuation to respond to when complete.
// Removes any existing configuration settings that may exist in this
// instance and then adds all key-value pairs in `value`. 
//
Redis.prototype.save = function (value, callback) {
  if (Array.isArray(value) || typeof value !== 'object') {
    return callback(new Error('`value` to be saved must be an object.'));
  }
  
  var self = this,
      keys = Object.keys(value);
  
  // Set the callback if not provided for "fire and forget"
  callback = callback || function () { };

  //
  // Clear all existing keys associated with this instance.
  //
  this.reset(function (err) {
    if (err) {
      return callback(err);
    }
    
    //
    // Iterate over the keys in the new value, setting each of them.
    //
    async.forEach(keys, function (key, next) {
      self.set(key, value[key], next);
    }, callback);
  });
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
Redis.prototype.load = function (callback) {
  var self   = this,
      result = {};
  
  // Set the callback if not provided for "fire and forget"
  callback = callback || function () { };

  this.redis.smembers(nconf.key(this.namespace, 'keys'), function (err, keys) {
    if (err) {
      return callback(err);
    }

    function addValue (key, next) {
      self.get(key, function (err, value) {
        if (err) {
          return next(err);
        }
        
        result[key] = value;
        next();
      });
    }
    
    keys = keys || [];
    async.forEach(keys, addValue, function (err) {
      return err ? callback(err) : callback(null, result);
    });
  });
};

//
// ### function reset (callback)
// #### @callback {function} Continuation to respond to when complete.
// Clears all keys associated with this instance.
//
Redis.prototype.reset = function (callback) {
  var self = this;
  
  // Set the callback if not provided for "fire and forget"
  callback = callback || function () { };
  
  //
  // Get the list of of top-level keys, then clear each of them
  //
  this.redis.smembers(nconf.key(this.namespace, 'keys'), function (err, existing) {
    if (err) {
      return callback(err);
    }
    
    existing = existing || [];
    async.forEach(existing, function (key, next) {
      self.clear(key, next);
    }, callback);
  });
};

//
// ### @private function _setObject (key, value, callback)
// #### @key {string} Key to set in this instance
// #### @value {Object} Value for the specified key
// #### @callback {function} Continuation to respond to when complete.
// Internal helper function for setting all keys of a nested object.
//
Redis.prototype._setObject = function (key, value, callback) {
  var self = this,
      keys = Object.keys(value);
  
  function addValue (child, next) {
    //
    // Add the child key to the parent key-set, then set the value.
    // Recursively call `_setObject` in the event of nested Object(s).
    //
    self.redis.sadd(nconf.key(key, 'keys'), child, function (err) {
      if (err) {
        return next(err);
      }

      var fullKey = nconf.key(key, child),
          childValue = value[child];
          
      if (!Array.isArray(childValue) && typeof childValue === 'object') {
        self._setObject(fullKey, childValue, next);
      }
      else {
        childValue = JSON.stringify(childValue);
        self.redis.set(fullKey, childValue, next);
      }
    });
  }
  
  //
  // Iterate over the keys of the Object and set the appropriate values.
  //
  async.forEach(keys, addValue, function (err) {
    return err ? callback(err) : callback();    
  });
};