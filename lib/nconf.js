/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins
 *
 */

require.paths.unshift(__dirname);

var nconf = exports;

nconf.utils  = require('nconf/utils');
nconf.stores = require('nconf/stores');

nconf.use = function (type, options) {
  nconf.store = new nconf.stores[type](options);
};

nconf.get = function (key, callback) {
  return nconf.store.get(key, callback);
};

nconf.set = function (key, value, callback) {
  return nconf.store.set(key, value, callback);
};

nconf.clear = function (key, callback) {
  return nconf.store.clear(key, callback);
};

nconf.load = function (callback) {
  if (!nconf.store.load) {
    var error = new Error('nconf store ' + nconf.store.type + ' has no load() method');
    if (callback) {
      return callback (err);
    }
    
    throw error;
  }
  
  return nconf.store.load(callback);
};

nconf.save = function (callback) {
  if (!nconf.store.save) {
    var error = new Error('nconf store ' + nconf.store.type + ' has no save() method');
    if (callback) {
      return callback (err);
    }
    
    throw error;
  }
  
  return nconf.store.save(callback);
};