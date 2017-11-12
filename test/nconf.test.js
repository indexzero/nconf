/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const fs = require('fs');
const path = require('path');
const nconf = require('../lib/nconf');

describe('nconf, When using the nconf', () => {
  it("should have the correct methods set", () => {
    expect(typeof nconf.key).toBe('function');
    expect(typeof nconf.path).toBe('function');
    expect(typeof nconf.use).toBe('function');
    expect(typeof nconf.any).toBe('function');
    expect(typeof nconf.get).toBe('function');
    expect(typeof nconf.set).toBe('function');
    expect(typeof nconf.clear).toBe('function');
    expect(typeof nconf.load).toBe('function');
    expect(typeof nconf.save).toBe('function');
    expect(typeof nconf.reset).toBe('function');
    expect(typeof nconf.required).toBe('function');
  });
  it("the use() method should instaniate the correct store", () => {
    nconf.use('memory');
    nconf.load();
    expect(nconf.stores['memory'] instanceof nconf.Memory).toBe(true);
  });
  it("nconf should have the correct version set", done => {
    fs.readFile(path.join(__dirname, '..', 'package.json'), (err, data) => {
      expect(err).toBe(null);
      data = JSON.parse(data.toString());
      expect(nconf.version).toEqual(data.version);
      done();
    })
  });
  describe("the required() method", () => {
    it("should throw error with missing keys", () => {
      nconf.set('foo:bar:bazz', 'buzz');
      expect(nconf.required.bind(nconf, ['missing', 'foo:bar:bazz'])).toThrow(Error);
    });
    it("should return the provider if all required keys exist", () => {
      var Provider = nconf.Provider;
      nconf.set('foo:bar:bazz', 'buzz');
      expect(nconf.required(['foo:bar:bazz']) instanceof Provider).toBe(true);
    });
  });
  describe("with the memory store", () => {
    describe("the set() method", () => {
      it("should respond with true", () => {
        expect(nconf.set('foo:bar:bazz', 'buzz')).toBeTruthy();
      });
      it("should respond allow access to the root and complain about non-objects", () => {
        expect(nconf.set(null, null)).toBeFalsy();
        expect(nconf.set(null, undefined)).toBeFalsy();
        expect(nconf.set(null)).toBeFalsy();
        expect(nconf.set(null, '')).toBeFalsy();
        expect(nconf.set(null, 1)).toBeFalsy();
        var original = nconf.get();
        expect(nconf.set(null, nconf.get())).toBeTruthy();
        expect(nconf.get()).not.toBe(original);
        expect(nconf.get()).toEqual(original)
      })
    });
    describe("the get() method", () => {
      it("should respond with the correct value without a callback", () => {
        expect(nconf.get('foo:bar:bazz')).toEqual('buzz');
      })
      it("should not step inside strings without a callback", () => {
        expect(nconf.get('foo:bar:bazz:0')).toEqual(undefined);
      });
      it("should respond with the correct value with a callback", done => {

        nconf.get('foo:bar:bazz', (err, value) => {
          expect(value).toEqual('buzz');
          done();
        })
      })
      it("should respond allow access to the root", () => {
        expect(nconf.get(null)).toBeTruthy();
        expect(nconf.get(undefined)).toBeTruthy();
        expect(nconf.get()).toBeTruthy();
      })
    });
    describe("the clear() method", () => {
      it("should respond with the true", () => {
        expect(nconf.get('foo:bar:bazz')).toEqual('buzz');
        expect(nconf.clear('foo:bar:bazz')).toBeTruthy();
        expect(typeof nconf.get('foo:bar:bazz') === 'undefined').toBeTruthy();
      })
    })
    describe("the load() method", () => {

      it("should respond with the merged store without a callback", () => {
        expect(nconf.load()).toEqual({
          title: 'My specific title',
          color: 'green',
          movie: 'Kill Bill'
        });
      });
      it("should respond with the merged store", done => {
        nconf.load((err, store) => {
          expect(err).toBe(null);
          expect(store).toEqual({
            title: 'My specific title',
            color: 'green',
            movie: 'Kill Bill'
          });
          done();
        });
      })
    })
  })
})
