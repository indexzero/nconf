/*
 * nconf-env.js: Test fixture for using process.env defaults with nconf.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var nconf = require('../../../lib/nconf');

nconf.env = true;
process.stdout.write(nconf.get('SOMETHING'));