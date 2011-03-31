/*
 * redis.js: Redis storage engine for nconf configuration(s)
 *
 * (C) 2011, Charlie Robbins
 *
 */

var async = require('async'),
    redis = require('redis'),
    nconf = require('nconf'),
    Memory = require('./Memory').Memory;

var Redis = exports.Redis = function (options) {
  this.namespace = options.namespace || 'nconf';
  this.host      = options.host || 'localhost';
  this.port      = options.port || 6379;
  this.cache     = new Memory();
  this.redis     = redis.createClient(options.port, options.host);
};

Redis.prototype.get = function (key, callback) {
  
};

Redis.prototype.set = function (key, value, callback) {
  var self = this,
      path = nconf.utils.path(key);
  
  function addKey (partial, next) {
    var index  = path.indexOf(partial),
        base   = [self.namespace].concat(path.slice(0, index)),
        parent = nconf.utils.key(base.concat('keys'));
    
    self.redis.rpush(parent, partial, next);
  };
  
  async.forEach(path, addKey, function (err) {
    if (err) {
      return callback(err);
    }
    
    
  });
};

Redis.prototype.clear = function (key, callback) {
  
};
