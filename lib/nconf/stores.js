/*
 * stores.js: Top-level include for all nconf stores
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var fs = require('fs'),
    stores = exports;

function capitalize (str) {
  return str && str[0].toUpperCase() + str.slice(1);
};

//
// Setup all stores as lazy-loaded getters.
//
fs.readdirSync(__dirname + '/stores').forEach(function (file) {
  var store = file.replace('.js', ''),
      name  = capitalize(store);
      
  stores.__defineGetter__(name, function () {
    return require('./stores/' + store)[name];
  });
});

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