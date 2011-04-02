/*
 * stores.js: Top-level include for all nconf stores
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var stores = exports;

function capitalize (str) {
  return str && str[0].toUpperCase() + str.slice(1);
};

stores.Memory = require('nconf/stores/memory').Memory;
stores.File   = require('nconf/stores/file').File;
stores.Redis  = require('nconf/stores/redis').Redis;

//
// ### function create (type, options)
// #### @type {string} Type of the nconf store to use.
// #### @options {Object} Options for the store instance.
// Creates a store of the specified `type` using the 
// specified `options`.
//
stores.create = function (type, options) {
  return new stores[capitalize(type.toLowerCase())](options);
};