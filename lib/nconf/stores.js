/*
 * stores.js: Top-level include for all nconf stores
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var fs = require('fs'),
    common = require('./common'),
    stores = exports;

//
// Setup all stores as lazy-loaded getters.
//
fs.readdirSync(__dirname + '/stores').forEach(function (file) {
  var store = file.replace('.js', ''),
      name  = common.capitalize(store);
      
  stores.__defineGetter__(name, function () {
    return require('./stores/' + store)[name];
  });
});