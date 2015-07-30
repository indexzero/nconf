/*
 * argv.js: Simple memory-based store for command-line arguments.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var util = require('util');

/**
 * function Argv (opts)
 * @param {opts} Object Options for this instance.
 *
 * Constructor function for the Argv nconf store, a simple abstraction
 * around the Memory store that can read command-line arguments.
 */
var Argv = module.exports = function (opts) {
  if (!(this instanceof Argv)) { return new Argv(opts); }

  opts = opts || {};
  this.readOnly = true;
  this.type = 'argv';
  this.args = opts.args;
  this.source = opts.source;
  this.usage = opts.usage;
};

/**
 * function loadSync ()
 * Loads the data passed in from `process.argv` into this instance.
 */
Argv.prototype.loadSync = function (source) {
  source = source || this.source || process.argv.slice(2);
  var self = this,
      yargs,
      argv;

  yargs = require('yargs')(source);
  if (typeof this.args === 'object') {
    yargs = yargs.options(this.args);
  }

  if (typeof this.usage === 'string') {
    yargs.usage(this.usage);
  }

  //
  // Remark: should we deep clone this object?
  //
  argv = this.data = yargs.argv;
  if (!argv) {
    return;
  }

  this.showHelp = yargs.showHelp;
  this.help     = yargs.help;
  return argv;
};
