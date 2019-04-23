/*
 * common.js: Tests for common utility function in nconf.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');
var nconf = require('../lib/nconf');

var mergeDir = path.join(__dirname, 'fixtures', 'merge');
var files = fs.readdirSync(mergeDir).map(function (f) { return path.join(mergeDir, f) });

describe('nconf/common', () => {
  describe('Using nconf.common module', () => {
    it('the loadFiles() method should merge the files correctly', done => {
        nconf.loadFiles(files, (err, res) => {
            helpers.assertMerged(err, res);
            done();
        });
    });
    it("the loadFilesSync() method should merge the files correctly", () => {
        helpers.assertMerged(null, nconf.loadFilesSync(files));
    });
  });
});