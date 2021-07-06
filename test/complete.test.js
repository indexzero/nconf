/*
 * complete-test.js: Complete test for multiple stores.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs');
var nconf = require('../lib/nconf');
var data = require('./fixtures/data').data;
var helpers = require('./helpers');
const _ = require('lodash');

var completeTest = helpers.fixture('complete-test.json');
var complete = helpers.fixture('complete.json');

// prime the process.env
process.env['NCONF_foo'] = 'bar';
process.env.FOO = 'bar';
process.env.BAR = 'zalgo';
process.env.NODE_ENV = 'debug';
process.env.FOOBAR = 'should not load';
process.env.json_array = JSON.stringify(['foo', 'bar', 'baz']);
process.env.json_obj = JSON.stringify({ foo: 'bar', baz: 'foo' });
process.env.NESTED__VALUE = 'nested';
process.env.NESTED___VALUE_EXTRA_LODASH = '_nested_';

// Ensure tests only validate a controlled set of env vars
let process_env = _.pick(process.env, ['NCONF_foo', 'FOO', 'BAR', 'NODE_ENV', 'FOOBAR', 'json_array', 'json_obj', 'NESTED__VALUE', 'NESTED___VALUE_EXTRA_LODASH']);

describe('nconf/multiple-stores', () => {
  afterAll(() => {
    try {
      // Cleanup
      fs.unlinkSync(completeTest);
    } catch (err) {
      // No-op - just ensures the test file is cleaned up
      console.log(err);
    }
  })
  describe("When using the nconf with multiple providers", () => {
    beforeAll(done => {
      helpers.cp(complete, completeTest, function () {
        nconf.env({
          // separator: '__',
          match: /^NCONF_/,
          whitelist: ['NODE_ENV', 'FOO', 'BAR']
        });
        nconf.file({ file: completeTest });
        nconf.use('argv', { type: 'literal', store: data });
        done();
      });
    });
    it("should have the correct `stores`", () => {
      expect(typeof nconf.stores.env).toBe('object');
      expect(typeof nconf.stores.argv).toBe('object');
      expect(typeof nconf.stores.file).toBe('object');
    });
    it("env vars, are present", () => {
      ['NODE_ENV', 'FOO', 'BAR', 'NCONF_foo'].forEach(function (key) {
        expect(nconf.get(key)).toEqual(process.env[key]);
      });
    });
    it("json vars are present", done => {
      fs.readFile(complete, 'utf8', (err, data) => {
        expect(err).toBe(null);
        data = JSON.parse(data);
        Object.keys(data).forEach(function (key) {
          expect(nconf.get(key)).toEqual(data[key]);
        });
        done();
      })
    });
    it("literal vars are present", () => {
      Object.keys(data).forEach(function (key) {
        expect(nconf.get(key)).toEqual(data[key]);
      });
    });
    afterAll(() => {
      nconf.remove('file');
      nconf.remove('memory');
      nconf.remove('argv');
      nconf.remove('env');
    });
    describe('saving', () => {
      afterEach(() => {
        // remove the file so that we can test saving it async
        fs.unlinkSync(completeTest);
      });
      it("and saving *synchronously* correct return value, the file, saved correctly", done => {
        nconf.set('weebls', 'stuff');
        var topic = nconf.save();
        Object.keys(topic).forEach(function (key) {
          expect(topic[key]).toEqual(nconf.get(key));
        });
        fs.readFile(completeTest, 'utf8', function (err, data) {
          expect(err).toBe(null);
          data = JSON.parse(data);
          Object.keys(data).forEach(function (key) {
            expect(data[key]).toEqual(nconf.get(key));
          });
          expect(nconf.get('weebls')).toEqual('stuff');
          done();
        });
      });
      it("and saving *asynchronously* correct return value, the file, saved correctly", done => {
        nconf.set('weebls', 'crap');
        nconf.save((err, data) => {
          Object.keys(data).forEach(function (key) {
            expect(data[key]).toEqual(nconf.get(key));
          });
          fs.readFile(completeTest, 'utf8', function (err, data) {
            expect(err).toBe(null);
            data = JSON.parse(data);
            Object.keys(data).forEach(function (key) {
              expect(data[key]).toEqual(nconf.get(key));
            });
            expect(nconf.get('weebls')).toEqual('crap');
            done();
          });
        });
      });
    });
  });
  describe("When using the nconf env with custom options", () => {

    describe("When using env with lowerCase:true", () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      beforeAll(done => {
        helpers.cp(complete, completeTest, () => {
          nconf.env({ lowerCase: true });
          done();
        })
      });
      afterAll(() => nconf.remove('env'))
      it("env vars keys also available as lower case", () => {
        Object.keys(process_env).forEach(function (key) {
          expect(nconf.get(key.toLowerCase())).toEqual(process.env[key]);
        });
      });
    });


    describe("When using env with parseValues:true", () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      beforeAll(done => {
        helpers.cp(complete, completeTest, () => {
          nconf.env({ parseValues: true });
          done();
        })
      });
      afterAll(() => nconf.remove('env'))
      it("JSON keys properly parsed", () => {
        Object.keys(process_env).forEach(function (key) {
          var val = process.env[key];

          try {
            val = JSON.parse(val);
          } catch (err) {
          }

          expect(nconf.get(key)).toEqual(val);
        });
      });

    });

    describe("When using env with transform:fn", () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      beforeAll(done => {
        function testTransform(obj) {
          if (obj.key === 'FOO') {
            obj.key = 'FOOD';
            obj.value = 'BARFOO';
          }

          return obj;
        }

        helpers.cp(complete, completeTest, () => {
          nconf.env({ transform: testTransform });
          done();
        })
      });
      it("env vars port key/value properly transformed", () => {
        expect(nconf.get('FOOD')).toEqual('BARFOO');
      });

      afterAll(() => nconf.remove('env'))
    });
    describe("When using env with transform:fn that drops an entry", () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      beforeAll(done => {
        function testTransform(obj) {
          if (obj.key === 'FOO') {
            return false;
          }

          return obj;
        }

        helpers.cp(complete, completeTest, () => {
          nconf.env({ transform: testTransform });
          done();
        })
      });
      it("env vars port key/value properly transformed", () => {
        expect(nconf.get('FOO')).toBe(undefined);
      });

      afterAll(() => nconf.remove('env'))
    });
    describe("When using env with transform:fn that return an undefined value", () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      beforeAll(done => {
        function testTransform(obj) {
          if (obj.key === 'FOO') {
            return { key: 'FOO', value: undefined };
          }
          return obj;
        }

        helpers.cp(complete, completeTest, () => {
          nconf.env({ transform: testTransform });
          done();
        })
      });
      it("env vars port key/value properly transformed", () => {
        expect(nconf.get('FOO')).toBe(undefined);
      });

      afterAll(() => nconf.remove('env'))
    });
    describe("When using env with bad transform:fn", () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      it(" port key/value throws transformation error", done => {

        function testTransform(obj) {
          return { foo: 'bar' };
        }

        helpers.cp(complete, completeTest, () => {
          try {
            nconf.env({ transform: testTransform });
          } catch (err) {
            expect(err.name).toEqual('RuntimeError')
            done();
          }
        })
      });

      afterAll(() => nconf.remove('env'))
    });
    describe("When using env with a separator", () => {
      // Threw this in it's own batch to make sure it's run separately from the sync check
      beforeAll(done => {
        helpers.cp(complete, completeTest, () => {
          nconf.env({ inputSeparator: /__+/ });
          done();
        })
      });
      it("can access to nested values", () => {
        expect(nconf.get('NESTED')).toEqual({ VALUE: 'nested', VALUE_EXTRA_LODASH: '_nested_' });
      });

      afterAll(() => nconf.remove('env'))
    });

  });
});
