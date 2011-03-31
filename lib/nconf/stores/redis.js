/*
 * redis.js: Redis storage engine for nconf configuration(s)
 *
 * (C) 2011, Charlie Robbins
 *
 */

var async = require('async'),
    eyes = require('eyes'),
    redis = require('redis'),
    nconf = require('nconf'),
    Memory = require('./Memory').Memory;

var Redis = exports.Redis = function (options) {
  options        = options || {}
  this.namespace = options.namespace || 'nconf';
  this.host      = options.host || 'localhost';
  this.port      = options.port || 6379;
  this.cache     = new Memory();
  this.redis     = redis.createClient(options.port, options.host);
};

Redis.prototype.get = function (key, callback) {
  var self    = this,
      result  = {},
      fullKey = nconf.utils.key(this.namespace, key);
  
  this.redis.smembers(nconf.utils.key(fullKey, 'keys'), function (err, keys) {
    function addValue (source, next) {
      self.get(nconf.utils.key(key, source), function (err, value) {
        if (err) {
          return next(err);
        }
        
        result[source] = value;
        next();
      });
    }
    
    if (keys && keys.length > 0) {
      async.forEach(keys, addValue, function (err) {
        return err ? callback(err) : callback(null, result);
      })
    }
    else {
      self.redis.get(fullKey, function (err, value) {
        return err ? callback(err) : callback(null, JSON.parse(value));
      });
    }
  });
};

Redis.prototype.set = function (key, value, callback) {
  var self = this,
      path = nconf.utils.path(key);
  
  function addKey (partial, next) {
    var index  = path.indexOf(partial),
        base   = [self.namespace].concat(path.slice(0, index)),
        parent = nconf.utils.key(base.concat(['keys']));

    self.redis.sadd(parent, partial, next);
  };

  async.forEach(path, addKey, function (err) {
    if (err) {
      return callback(err);
    }
    
    var fullKey = nconf.utils.key(self.namespace, key);
    
    if (!Array.isArray(value) && typeof value === 'object') {
      self._setObject(fullKey, value, callback);
    }
    else {
      value = JSON.stringify(value);
      self.redis.set(fullKey, value, callback);
    }
  });
};

Redis.prototype.clear = function (key, callback) {
  
};

Redis.prototype._setObject = function (key, value, callback) {
  var self = this,
      keys = Object.keys(value);
  
  function addValue (child, next) {
    self.redis.sadd(nconf.utils.key(key, 'keys'), child, function (err) {
      if (err) {
        return next(err);
      }

      var fullKey = nconf.utils.key(key, child),
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
  
  async.forEach(keys, addValue, function (err) {
    return err ? callback(err) : callback();    
  });
};