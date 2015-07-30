/*
 * argv-test.js: Tests for the nconf argv store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var assume = require('assume'),
    nconf = require('../../lib/nconf'),
    Argv = require('../../lib/nconf/stores/argv');

describe('nconf/stores/argv', function () {
  var store;
  beforeEach(function () {
    store = nconf.Argv();
  });

  it('should be exposed correctly on nconf', function () {
    assume(Argv).equals(nconf.Argv);
  })

  it('should have the correct methods defined', function () {
    var props = Object.keys(store);
    ['readOnly', 'type', 'args', 'source', 'usage']
      .forEach(function (key) {
        assume(props).includes(key);
      });

    assume(store.readOnly).equals(true);
    assume(store.type).equals('argv');
    assume(store.options).equals(undefined);
    assume(store.source).equals(undefined);
    assume(store.usage).equals(undefined);
    assume(store.loadSync).is.a('function');
  });

  it('loadSync()');
  it('loadSync(source)');
  it('loadSync() { options }');
  it('loadSync() { options, usage }');
});
