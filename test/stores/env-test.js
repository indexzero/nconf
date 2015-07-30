/*
 * argv-test.js: Tests for the nconf argv store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var assume = require('assume'),
    nconf = require('../../lib/nconf'),
    Env = require('../../lib/nconf/stores/env');

describe('nconf/stores/env', function () {
  var store;
  beforeEach(function () {
    store = nconf.Env();
  });

  it('should be exposed correctly on nconf', function () {
    assume(Env).equals(nconf.Env);
  })

  it('should have the correct methods defined', function () {
    var props = Object.keys(store);
    ['type', 'readOnly', 'whitelist', 'separator', 'source']
      .forEach(function (key) {
        assume(props).includes(key);
      });

    assume(store.readOnly).equals(true);
    assume(store.type).equals('env');
    assume(store.whitelist).is.a('array');
    assume(store.whitelist.length).equals(0);
    assume(store.separator).equals('');
    assume(store.source).equals(undefined);
  });

  it('loadSync()');
  it('loadSync(source)');
  it('loadSync() { whitelist }');
  it('loadSync() { whitelist, match }');
  it('loadSync() { whitelist, match, separator }');
});
