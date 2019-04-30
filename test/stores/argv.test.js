/*
 * argv-test.js: Tests for the nconf argv store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var yargs = require('yargs');
var nconf = require('../../lib/nconf');

describe('nconf/stores/argv, An instance of nconf.Argv', () => {

  it("should have the correct methods defined", () => {
    var argv = new nconf.Argv();
    expect(typeof argv.loadSync).toBe('function');
    expect(typeof argv.loadArgv).toBe('function');
    expect(argv.options).toEqual({});
  });

  describe("can be created with a custom yargs", () => {
    var yargsInstance = yargs.alias('s', 'somearg').default('s', 'false');

    it("and can give access to them", () => {
      var argv = new nconf.Argv(yargsInstance);
      expect(argv.options).toBe(yargsInstance);
    });

    it("values are the one from the custom yargv", () => {
      var argv = new nconf.Argv(yargsInstance);
      argv.loadSync();
      expect(argv.get('somearg')).toBe('false');
      expect(argv.get('s')).toBe('false');
    });
  });

  describe("can be created with a nconf yargs", () => {
    var options = {somearg: {alias: 's', default: 'false'}};
    it("and can give access to them", () => {
      var argv = new nconf.Argv(options);
      expect(argv.options).toEqual({somearg: {alias: 's', default: 'false'}});
    });

    it("values are the one from the custom yargv", () => {
      var argv = new nconf.Argv(options);
      argv.loadSync();
      expect(argv.get('somearg')).toBe('false');
      expect(argv.get('s')).toBe('false');
    });

    it("values cannot be altered with set when readOnly:true", () => {
      var argv = new nconf.Argv(options);
      argv.loadSync();
      argv.set('somearg', 'true');
      expect(argv.get('somearg')).toBe('false');
    });
  });
  describe("can be created with readOnly set to be false", () => {
      
    it("readOnly is actually false", () =>  {
      var argv = new nconf.Argv({readOnly: false});
      expect(argv.readOnly).toBe(false);
    });

    it("values can be changed by calling .set", () => {
      var argv = new nconf.Argv({somearg: {alias: 's', default: 'false'}, readOnly: false});
      argv.loadSync();
      expect(argv.get('somearg')).toBe('false');
      argv.set('somearg', 'true');
      expect(argv.get('somearg')).toBe('true');
    });
  });
});
