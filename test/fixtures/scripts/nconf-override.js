/*
 * nconf-override.js: Test fixture for using optimist defaults with nconf.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var nconf = require('../../../lib/nconf');

var provider = new (nconf.Provider)({ useArgv: true });

process.stdout.write(provider.get('something'));