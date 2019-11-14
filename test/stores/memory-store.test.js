/*
 * memory-store-test.js: Tests for the nconf Memory store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var nconf = require('../../lib/nconf');
var merge = require('../fixtures/data').merge;

describe('nconf/stores/memory', () => {
  describe("When using the nconf memory store", () => {
    var store = new nconf.Memory();
    it("the set() method should respond with true", () => {
      expect(store.set('foo:bar:bazz', 'buzz')).toBeTruthy();
      expect(store.set('falsy:number', 0)).toBeTruthy();
      expect(store.set('falsy:string:empty', '')).toBeTruthy();
      expect(store.set('falsy:string:value', 'value')).toBeTruthy();
      expect(store.set('falsy:boolean', false)).toBeTruthy();
      expect(store.set('falsy:object', null)).toBeTruthy();
    });

    it("the get() method should respond with the correct value", () => {
      expect(store.get('foo:bar:bazz')).toEqual('buzz');
      expect(store.get('falsy:number')).toEqual(0);
      expect(store.get('falsy:string:empty')).toEqual('');
      expect(store.get('falsy:string:value')).toEqual('value');
      expect(store.get('falsy:boolean')).toEqual(false);
      expect(store.get('falsy:object')).toEqual(null);
    });

    describe("the get() method should not fail when retrieving non-existent keys", () => {
      it("at the root level", () => {
        expect(store.get('this:key:does:not:exist')).toEqual(undefined);
      });

      it("within numbers", () => {
        expect(store.get('falsy:number:not:exist')).toEqual(undefined);
      });

      it("within booleans", () => {
        expect(store.get('falsy:boolean:not:exist')).toEqual(undefined);
      });

      it("within objects", () => {
        expect(store.get('falsy:object:not:exist')).toEqual(undefined);
      });

      it("within empty strings", () => {
        expect(store.get('falsy:string:empty:not:exist')).toEqual(undefined);
      });

      it("within non-empty strings", () => {
        expect(store.get('falsy:string:value:not:exist')).toEqual(undefined);
      });
    });

    it("the clear() method, should respond with the true", () => {
      expect(store.get('foo:bar:bazz')).toEqual('buzz');
      expect(store.clear('foo:bar:bazz')).toBeTruthy();
      expect(typeof store.get('foo:bar:bazz') === 'undefined').toBeTruthy();
    });

    describe("the merge() method", () => {
      it("when overriding an existing literal value", () => {
        store.set('merge:literal', 'string-value');
        store.merge('merge:literal', merge);
        expect(store.get('merge:literal')).toEqual(merge);
      });

      it("when overriding an existing Array value", () => {
        store.set('merge:array', [1, 2, 3, 4]);
        store.merge('merge:array', merge);
        expect(store.get('merge:literal')).toEqual(merge);
      });

      it("when merging into an existing Object value", () => {
        store.set('merge:object', {
          prop1: 2,
          prop2: 'prop2',
          prop3: {
            bazz: 'bazz'
          },
          prop4: ['foo', 'bar']
        });
        store.merge('merge:object', merge);

        expect(store.get('merge:object:prop1')).toEqual(1);
        expect(store.get('merge:object:prop2').length).toEqual(3);
        expect(store.get('merge:object:prop3')).toEqual({
          foo: 'bar',
          bar: 'foo',
          bazz: 'bazz'
        });
        expect(store.get('merge:object:prop4').length).toEqual(2);
      });
    });
  });
  describe("When using the nconf memory store with different logical separator", () => {
    var store = new nconf.Memory({ accessSeparator: '||', disableDefaultSeparator: true });

    it("when storing with : (colon), should store the config atomicly (leave key as-is)", () => {
      store.set('foo:bar:bazz', 'buzz');
      expect(typeof store.get('foo:bar') === 'undefined').toBeTruthy();
      expect(store.get('foo:bar:bazz')).toEqual('buzz');
    });

    it("when storing with separator, should be able to read the object", () => {
      store.set('foo||bar||bazz', 'buzz');
      expect(store.get('foo||bar').bazz).toEqual('buzz');
      expect(store.get('foo').bar.bazz).toEqual('buzz');
    })
  });
});
