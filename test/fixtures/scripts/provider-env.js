/*
 * provider-argv.js: Test fixture for using process.env defaults with nconf.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var nconf = require('../../../lib/nconf');

var provider = new (nconf.Provider)({ env: true });

process.stdout.write(provider.get('SOMETHING'));