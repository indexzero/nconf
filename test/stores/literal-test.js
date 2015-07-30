/*
 * literal-test.js: Tests for the nconf literal store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var assume = require('assume'),
    nconf = require('../../lib/nconf'),
    Literal = require('../../lib/nconf/stores/literal');

describe('nconf/stores/literal', function () {
  it('should be exposed correctly on nconf', function () {
    assume(Literal).equals(nconf.Literal);
  })

  it('should have the correct methods defined', function () {
    var store = nconf.Literal({ foo: 'bar' });
    var props = Object.keys(store);
    ['type', 'readOnly', 'data'].forEach(function (key) {
        assume(props).includes(key);
      });

    assume(store.readOnly).equals(true);
    assume(store.type).equals('literal');
    assume(store.data).deep.equals({ foo: 'bar' });
  });

  it('loadSync()');
});
