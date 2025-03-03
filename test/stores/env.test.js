/*
 * env-test.js: Tests for the nconf env store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var nconf = require('../../lib/nconf');

process.env.DEEP__NESTED__VALUE = 'foo';
process.env.DEEP2__NESTED__VALUE = 'bar';

describe('nconf/stores/env, An instance of nconf.Env', () => {
  it("should have the correct methods defined", () => {
    var env = new nconf.Env();
    expect(typeof env.loadSync).toBe('function');
    expect(typeof env.loadEnv).toBe('function');
    expect(env.whitelist instanceof Array).toBeTruthy();
    expect(env.whitelist.length).toEqual(0);
    expect(env.inputSeparator).toEqual('__');
  });
  it("should have the correct methods defined and with readOnly false", () => {
    var env = new nconf.Env({readOnly: false});
    expect(typeof env.loadSync).toBe('function');
    expect(typeof env.loadEnv).toBe('function');
    expect(env.whitelist instanceof Array).toBeTruthy();
    expect(env.whitelist.length).toEqual(0);
    expect(env.inputSeparator).toEqual('__');
    expect(env.readOnly).toBe(false);
  });
  it("should be able to retrieve a value using the logical separator", () => {
    var env = new nconf.Env({accessSeparator: '.', inputSeparator: '__'});
    env.loadSync();

    expect(env.accessSeparator).toBe('.');
    expect(env.get('DEEP.NESTED.VALUE')).toBe('foo');
  });
  it("should filter and strip prefix from environment variables", () => {
    var env = new nconf.Env({prefix: 'DEEP2__'});
    env.loadSync();
    expect(env.get('DEEP__NESTED__VALUE')).toBeUndefined();
    expect(env.get('NESTED__VALUE')).toBe('bar');
  });
  it("should filter and strip prefix from environment variables with input and access separator", () => {
    var env = new nconf.Env({prefix: 'DEEP2__', accessSeparator: '.', inputSeparator: '__' });
    env.loadSync();
    expect(env.get('DEEP.NESTED.VALUE')).toBeUndefined();
    expect(env.get('NESTED.VALUE')).toBe('bar');
  });
});
