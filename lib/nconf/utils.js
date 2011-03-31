/*
 * utils.js: Utils for the nconf module.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var utils = exports;

utils.key = function () {
  return Array.prototype.slice.call(arguments).join(':');
};

utils.path = function (key) {
  return key.split(':');
};