/*
 * nconf.js: Top-level include for the nconf module
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var Nconf = require('./safe');

//
// `nconf` is by default an instance of `nconf.Provider`.
//
var nconf = module.exports = new Nconf.Provider();

//
// Expose the various components included with nconf and version
//
['version', 'key', 'path', 'loadFiles', 'loadFilesSync', 'formats', 'Provider'].forEach(function (key) {
    nconf[key] = Nconf[key];
});
