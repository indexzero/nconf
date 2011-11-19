/*
 * nconf-change-argv.js: Test fixture for changing argv on the fly
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var nconf = require('../../../lib/nconf');

nconf.argv = true;

//
// Remove 'badValue', 'evenWorse' and 'OHNOEZ'
//
process.argv.splice(3, 3);
nconf.system.loadArgv();
process.stdout.write(nconf.get('something'));

