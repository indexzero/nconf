/*
 * argv-test.js: Tests for the nconf argv store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const yargs = require('yargs');
const nconf = require('../../lib/nconf');

describe('nconf/stores/argv, An instance of nconf.Argv', () => {

  it("should have the correct methods defined", () => {
    const argv = new nconf.Argv();
    expect(typeof argv.loadSync).toBe('function');
    expect(typeof argv.loadArgv).toBe('function');
    expect(argv.options).toEqual({});
  });

  describe("can be created with a custom yargs", () => {
    const yargsInstance = yargs.alias('v', 'verbose').default('v', 'false');

    it("and can give access to them", () => {
      const argv = new nconf.Argv(yargsInstance);
      expect(argv.options).toBe(yargsInstance);
    });

    it("values are the one from the custom yargv", () => {
      const argv = new nconf.Argv(yargsInstance);
      argv.loadSync();
      expect(argv.get('verbose')).toBe('false');
      expect(argv.get('v')).toBe('false');
    });
  });

  describe("can be created with a nconf yargs", () => {
    const options = {verbose: {alias: 'v', default: 'false'}};
    it("and can give access to them", () => {
      const argv = new nconf.Argv(options);
      expect(argv.options).toEqual({verbose: {alias: 'v', default: 'false'}});
    });

    it("values are the one from the custom yargv", () => {
      const argv = new nconf.Argv(options);
      argv.loadSync();
      expect(argv.get('verbose')).toBe('false');
      expect(argv.get('v')).toBe('false');
    })
  });
  describe("can be created with readOnly set to be false", () => {
    const options = {verbose: {alias: 'v', default: 'false'}, readOnly: false};
      
    it("readOnly is actually false", () =>  {
      const argv = new nconf.Argv(options)
      expect(argv.readOnly).toBe(false);
    });

    it("values can be changed by calling .set", () => {
      const argv = new nconf.Argv(options)
      argv.loadSync()
      expect(argv.get('verbose')).toBe('false');
      argv.set('verbose', 'true');
      expect(argv.get('verbose')).toBe('true');
    });
  });
});
