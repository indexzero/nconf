/*
 * literal-test.js: Tests for the nconf literal store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const nconf = require('../../lib/nconf');

describe('nconf/stores/literal, An instance of nconf.Literal', () => {
  const envOptions = {foo: 'bar', one: 2};
  it("should have the correct methods defined", () => {
    const literal = new nconf.Literal(envOptions);
    expect(literal.type).toEqual('literal');
    expect(typeof literal.get).toBe('function');
    expect(typeof literal.set).toBe('function');
    expect(typeof literal.merge).toBe('function');
    expect(typeof literal.loadSync).toBe('function');
  });
  it("should have the correct values in the store", () => {
    const literal = new nconf.Literal(envOptions);
    expect(literal.store.foo).toEqual('bar');
    expect(literal.store.one).toEqual(2);
  });
});
