/*
 * provider-save-test.js: Ensures consistency for Provider `save` operations.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const nconf = require('../lib/nconf');

//
// Expose `nconf.Mock`
//
require('./mocks/mock-store');

describe('nconf/provider/save', () => {
  describe("When using nconf an instance of 'nconf.Provider' with a Mock store", () => {
    const nconfMock = nconf.use('mock');
    it("the save() method should actually save before responding", done => {
      const mock = nconf.stores.mock;

      mock.on('save', function () {
        nconfMock.saved = true;
      });

      nconf.save(() => {
        expect(nconfMock.saved).toBeTruthy();
        done();
      });
    })
  })
});