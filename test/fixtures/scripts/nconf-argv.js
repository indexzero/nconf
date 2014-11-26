/*
 * default-argv.js: Test fixture for using optimist defaults with nconf.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var nconf = require('../../../lib/nconf').argv().env();

process.stdout.write(nconf.get('something'));