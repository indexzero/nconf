/*
 * nconf-change-argv.js: Test fixture for changing argv on the fly
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
var nconf = require('../../../lib/nconf').argv();

//
// Remove 'badValue', 'evenWorse' and 'OHNOEZ'
//
process.argv.splice(3, 3);
nconf._stores['argv'].loadArgv();
process.stdout.write(nconf.get('something'));

