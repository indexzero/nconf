/*
 * common.js: Tests for common utility function in nconf.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const nconf = require('../lib/nconf');

const mergeDir = path.join(__dirname, 'fixtures', 'merge');
const files = fs.readdirSync(mergeDir).map(function (f) { return path.join(mergeDir, f) });

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