/*
 * nconf-override.js: Test fixture for using optimist defaults with nconf.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var nconf = require('../../../lib/nconf');

nconf.useArgv = true;
process.stdout.write(nconf.get('something'));