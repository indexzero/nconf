/*
 * provider-test.js: Tests for the nconf Provider object.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const nconf = require('../lib/nconf');

const fixturesDir = path.join(__dirname, 'fixtures');
const mergeFixtures = path.join(fixturesDir, 'merge');
const files = [path.join(mergeFixtures, 'file1.json'), path.join(mergeFixtures, 'file2.json')];
const override = JSON.parse(fs.readFileSync(files[0]), 'utf8');

describe('nconf/provider When using nconf', () => {
  describe("an instance of 'nconf.Provider'", () => {
    it("calling the use() method with the same store type and different options"
      + " should use a new instance of the store type", () => {
      const provider = new nconf.Provider().use('file', {file: files[0]});
      const old = provider.stores['file'];

      expect(provider.stores.file.file).toEqual(files[0]);
      provider.use('file', {file: files[1]});

      expect(old).not.toEqual(provider.stores.file);
      expect(provider.stores.file.file).toEqual(files[1]);
    })
  });
  it("respond with correct arg when 'argv' is true",
    helpers.assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'provider-argv.js'),
      argv: ['--something', 'foobar']
    }));
  it("respond with correct arg when 'env' is true", helpers.assertSystemConf({
    script: path.join(fixturesDir, 'scripts', 'provider-env.js'),
    env: {SOMETHING: 'foobar'}
  }));

  it("respond with correct arg when 'env' is true and 'parseValues' option is true", () => {
    const env = {
      SOMETHING: 'foobar',
      SOMEBOOL: 'true',
      SOMENULL: 'null',
      SOMEUNDEF: 'undefined',
      SOMEINT: '3600',
      SOMEFLOAT: '0.5',
      SOMEBAD: '5.1a'
    };
    const oenv = {};
    Object.keys(env).forEach(function (key) {
      if (process.env[key]) oenv[key] = process.env[key];
      process.env[key] = env[key];
    });
    const provider = new nconf.Provider().use('env', {parseValues: true});
    Object.keys(env).forEach(function (key) {
      delete process.env[key];
      if (oenv[key]) process.env[key] = oenv[key];
    });

    expect(provider.get('SOMETHING')).toEqual('foobar');
    expect(provider.get('SOMEBOOL')).toEqual(true);
    expect(provider.get('SOMEBOOL')).not.toEqual('true');
    expect(provider.get('SOMENULL')).toEqual(null);
    expect(provider.get('SOMEUNDEF')).toEqual(undefined);
    expect(provider.get('SOMEINT')).toEqual(3600);
    expect(provider.get('SOMEFLOAT')).toEqual(.5);
    expect(provider.get('SOMEBAD')).toEqual('5.1a');
  });

  describe("the default nconf provider", () => {

    it("respond with correct arg when 'argv' is set to true", helpers.assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'nconf-argv.js'),
      argv: ['--something', 'foobar'],
      env: {SOMETHING: true}
    }));

    it("respond with correct arg when 'env' is set to true", helpers.assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'nconf-env.js'),
      env: {SOMETHING: 'foobar'}
    }));

    it("respond with correct arg when 'argv' is set to true and process.argv is modified", helpers.assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'nconf-change-argv.js'),
      argv: ['--something', 'badValue', 'evenWorse', 'OHNOEZ', 'foobar']
    }));

    it("respond with correct arg when hierarchical 'argv' get", helpers.assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'nconf-hierarchical-file-argv.js'),
      argv: ['--something', 'foobar'],
      env: {SOMETHING: true}
    }));

    it("respond with correct arg when 'env' is set to true with a nested separator", helpers.assertSystemConf({
      script: path.join(fixturesDir, 'scripts', 'nconf-nested-env.js'),
      env: {SOME_THING: 'foobar'}
    }));
  });

  describe("an instance of 'nconf.Provider'", () => {
    describe("the merge() method", () => {
      it("should have the result merged in", () => {
        const provider = new nconf.Provider().use('file', {file: files[1]});
        provider.load();
        provider.merge(override);
        helpers.assertMerged(null, provider.stores.file.store);
        expect(provider.stores.file.store.candy.something).toEqual('file1');
      });
      it("should merge Objects over null", () => {
        const provider = new nconf.Provider().use('file', {file: files[1]});
        provider.load();
        provider.merge(override);
        expect(provider.stores.file.store.unicorn.exists).toEqual(true);
      });
    })
    describe("the load() method", () => {
      it("should respect the hierarchy when sources are passed in", () => {
        const provider = new nconf.Provider({
          sources: {
            user: {
              type: 'file',
              file: files[0]
            },
            global: {
              type: 'file',
              file: files[1]
            }
          }
        });
        const merged = provider.load();
        helpers.assertMerged(null, merged);
        expect(merged.candy.something).toEqual('file1');
      })
      it("should respect the hierarchy when multiple stores are used", () => {
        const provider = new nconf.Provider().overrides({foo: {bar: 'baz'}})
          .add('file1', {type: 'file', file: files[0]})
          .add('file2', {type: 'file', file: files[1]});

        const merged = provider.load();

        helpers.assertMerged(null, merged);
        expect(merged.foo.bar).toEqual('baz');
        expect(merged.candy.something).toEqual('file1');
      })
    })
  })
  describe("the .file() method", () => {
    it("should use the correct File store with a single filepath", () => {
      const provider = new nconf.Provider();
      provider.file(helpers.fixture('store.json'));
      expect(typeof provider.stores.file).toBe('object');
    });
    it("should use the correct File store with a name and a filepath", () => {
      const provider = new nconf.Provider();
      provider.file('custom', helpers.fixture('store.json'));
      expect(typeof provider.stores.custom).toBe('object');
    });
    it("should use the correct File store with a single object", () => {
      const provider = new nconf.Provider();
      provider.file({
        dir: helpers.fixture(''),
        file: 'store.json',
        search: true
      });

      expect(typeof provider.stores.file).toBe('object');
      expect(provider.stores.file.file).toEqual(helpers.fixture('store.json'));
    });
    it("should use the correct File store with a name and an object", () => {
      const provider = new nconf.Provider();
      provider.file('custom', {
        dir: helpers.fixture(''),
        file: 'store.json',
        search: true
      });

      expect(typeof provider.stores.custom).toBe('object');
      expect(provider.stores.custom.file).toEqual(helpers.fixture('store.json'));
    })
    describe("the any() method", () => {
      const provider = new nconf.Provider({
        type: 'literal',
        store: {
          key: "getThisValue"
        }
      })
      describe("without a callback", () => {
        it("should respond with the correct value given an array of keys with one matching", () => {
          expect(provider.any(["notthis", "orthis", "key"])).toEqual('getThisValue');
        })
        it("should respond with null given an array of keys with no match", () => {
          expect(provider.any(["notthis", "orthis"])).toBe(null);
        });
        it("should respond with the correct value given a variable argument list of keys with one matching", () => {
          expect(provider.any("notthis", "orthis", "key")).toEqual('getThisValue');
        });
        it("should respond with null given no arguments", () => {
          expect(provider.any()).toBe(null);
        });
      })
      describe("with a callback", () => {
        it("should respond with the correct value given an array of keys with one matching", done => {
          provider.any(["notthis", "orthis", "key"], (err, value) => {
            expect(value).toEqual('getThisValue');
            done();
          });
        });
        it("should respond with an undefined value given an array of keys with no match", done => {
          provider.any(["notthis", "orthis"], (err, value) => {
            expect(value).toBe(undefined)
            done();
          });
        });
        it("should respond with the correct value given a variable argument list of keys with one matching", done => {
          provider.any("notthis", "orthis", "key", (err, value) => {
            expect(value).toEqual('getThisValue');
            done();
          });
        });

        it("should respond with an undefined value given no keys", done => {
          provider.any((err, value) => {
            expect(value).toBe(undefined)
            done();
          });
        });
      })
    })
  })
});
