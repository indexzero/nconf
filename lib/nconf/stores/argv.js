/*
 * argv.js: Simple memory-based store for command-line arguments.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var util = require('util');

//
// ### function Argv (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Argv nconf store, a simple abstraction
// around the Memory store that can read command-line arguments.
//
var Argv = exports.Argv = function (options, usage) {
  this.type     = 'argv';
  this.options  = options || false;
  this.usage    = usage;
};

//
// ### function loadSync ()
// Loads the data passed in from `process.argv` into this instance.
//
Argv.prototype.loadSync = function () {
  var self = this,
      optimist,
      argv;

  optimist = typeof this.options === 'object'
    ? require('optimist')(process.argv.slice(2)).options(this.options)
    : require('optimist')(process.argv.slice(2));

  if (typeof this.usage === 'string') { optimist.usage(this.usage); }

  argv = optimist.argv;
  if (!argv) {
    return;
  }

  this.showHelp = optimist.showHelp;
  this.help     = optimist.help;
  return argv;
};
