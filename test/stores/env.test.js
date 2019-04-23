/*
 * env-test.js: Tests for the nconf env store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var nconf = require('../../lib/nconf');

describe('nconf/stores/env, An instance of nconf.Env', () => {
  it("should have the correct methods defined", () => {
    var env = new nconf.Env();
    expect(typeof env.loadSync).toBe('function');
    expect(typeof env.loadEnv).toBe('function');
    expect(env.whitelist instanceof Array).toBeTruthy();
    expect(env.whitelist.length).toEqual(0);
    expect(env.separator).toEqual('');
  });
  it("should have the correct methods defined and with readOnly false", () => {
    var env = new nconf.Env({readOnly: false});
    expect(typeof env.loadSync).toBe('function');
    expect(typeof env.loadEnv).toBe('function');
    expect(env.whitelist instanceof Array).toBeTruthy();
    expect(env.whitelist.length).toEqual(0);
    expect(env.separator).toEqual('');
    expect(env.readOnly).toBe(false);
  });
});
