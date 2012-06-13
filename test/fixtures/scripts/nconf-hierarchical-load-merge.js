/*
 * nconf-hierarchical-load-merge.js: Test fixture for loading and merging nested objects across stores.
 *
 * (C) 2012, Nodejitsu Inc.
 * (C) 2012, Michael Hart
 *
 */
 
var path = require('path'),
    nconf = require('../../../lib/nconf');

nconf.argv();
nconf.add('file', {
  file: path.join(__dirname, '../store.json')
});

process.stdout.write(JSON.stringify(nconf.get('obj')));
