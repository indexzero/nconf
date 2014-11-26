/*
 * argv.js: Simple memory-based store for command-line arguments.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var util = require('util'),
    Memory = require('./memory').Memory;

//
// ### function Argv (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Argv nconf store, a simple abstraction
// around the Memory store that can read command-line arguments.
//
var Argv = exports.Argv = function (options, usage) {
  Memory.call(this, options);

  this.type     = 'argv';
  this.readOnly = true;
  this.options  = options || false;
  this.usage    = usage;
};

// Inherit from the Memory store
util.inherits(Argv, Memory);

//
// ### function loadSync ()
// Loads the data passed in from `process.argv` into this instance.
//
Argv.prototype.loadSync = function () {
  this.loadArgv();
  return this.store;
};

//
// ### function loadArgv ()
// Loads the data passed in from the command-line arguments
// into this instance.
//
Argv.prototype.loadArgv = function () {
  var self = this,
      optimist, argv;

  optimist = typeof this.options === 'object'
    ? require('optimist')(process.argv.slice(2)).options(this.options)
    : require('optimist')(process.argv.slice(2));

  if (typeof this.usage === 'string') { optimist.usage(this.usage) }

  argv = optimist.argv

  if (!argv) {
    return;
  }

  this.readOnly = false;
  Object.keys(argv).forEach(function (key) {
    self.set(key, argv[key]);
  });

  this.showHelp = optimist.showHelp
  this.help     = optimist.help

  this.readOnly = true;
  return this.store;
};