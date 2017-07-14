/*
 * env-test.js: Tests for the nconf env store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    helpers = require('../helpers'),
    nconf = require('../../lib/nconf');

vows.describe('nconf/stores/env').addBatch({
    "An instance of nconf.Env": {
        "-> with default options": {
            topic: new nconf.Env(),
            "should have the correct methods defined": function (store) {
                assert.isFunction(store.loadSync);
                assert.isFunction(store.loadEnv);
                assert.isArray(store.whitelist);
                assert.lengthOf(store.whitelist, 0);
                assert.equal(store.separator, '');
                assert.equal(store.arraySeparator, false);
                assert.equal(store.allowSingleValueArray, true);
            },
            "should recognise arrays": function (store) {
                process.env['arr'] = 'a,b,c';
                store.loadEnv();
                assert.deepEqual(store.get('arr'), 'a,b,c');
            }
        },
        "-> with custom options": {
            topic: new nconf.Env({
                arraySeparator: ',',
                separator: '__'
            }),
            "should have the correct methods defined": function (store) {
                assert.isFunction(store.loadSync);
                assert.isFunction(store.loadEnv);
                assert.isArray(store.whitelist);
                assert.lengthOf(store.whitelist, 0);
                assert.equal(store.separator, '__');
                assert.equal(store.arraySeparator, ',');
            },
            "should recognise arrays": function (store) {
                process.env['arr'] = 'a,b,c';
                store.loadEnv();
                assert.deepEqual(store.get('arr'), ['a', 'b', 'c']);
            },
            "should recognise arrays in nested object": function (store) {
                process.env['a__arr'] = 'a,b,c';
                store.loadEnv();
                assert.deepEqual(store.get('a').arr, ['a', 'b', 'c']);
            },
            "should recognise array as single-element array with second element empty": function (store) {
                process.env['b'] = 'a,';
                store.loadEnv();
                assert.deepEqual(store.get('b'), ['a']);
            }
        },
        "-> with allowSingleValueArray option true": {
            topic: new nconf.Env({
                arraySeparator: ',',
                allowSingleValueArray: false,
                separator: '__'
            }),
            "should have the correct methods defined": function (store) {
                assert.isFunction(store.loadSync);
                assert.isFunction(store.loadEnv);
                assert.isArray(store.whitelist);
                assert.lengthOf(store.whitelist, 0);
                assert.equal(store.separator, '__');
                assert.equal(store.arraySeparator, ',');
                assert.equal(store.allowSingleValueArray, false);
            },
            "should recognise arrays": function (store) {
                process.env['arr'] = 'a,b,c';
                store.loadEnv();
                assert.deepEqual(store.get('arr'), ['a', 'b', 'c']);
            },
            "should recognise arrays in nested object": function (store) {
                process.env['a__arr'] = 'a,b,c';
                store.loadEnv();
                assert.deepEqual(store.get('a').arr, ['a', 'b', 'c']);
            },
            "should recognise arrays with second element empty": function (store) {
                process.env['b'] = 'a,';
                store.loadEnv();
                assert.deepEqual(store.get('b'), ['a', '',]);
            },
            "should recognise array with other element empty": function (store) {
                process.env['c'] = 'a,b,';
                store.loadEnv();
                assert.deepEqual(store.get('c'), ['a', 'b', '']);
            }
        },
        "-> with allowSingleValueArray option for specific env variable": {
            topic: new nconf.Env({
                arraySeparator: ',',
                allowSingleValueArray: ['d'],
                separator: '__'
            }),
            "should have the correct methods defined": function (store) {
                assert.isFunction(store.loadSync);
                assert.isFunction(store.loadEnv);
                assert.isArray(store.whitelist);
                assert.lengthOf(store.whitelist, 0);
                assert.equal(store.separator, '__');
                assert.equal(store.arraySeparator, ',');
                assert.isArray(store.allowSingleValueArray, ['d']);
                assert.lengthOf(store.allowSingleValueArray, 1);
                assert.equal(store.allowSingleValueArray, 'd');
            },
            "should recognise arrays": function (store) {
                process.env['arr'] = 'a,b,c';
                store.loadEnv();
                assert.deepEqual(store.get('arr'), ['a', 'b', 'c']);
            },
            "should recognise arrays in nested object": function (store) {
                process.env['a__arr'] = 'a,b,c';
                store.loadEnv();
                assert.deepEqual(store.get('a').arr, ['a', 'b', 'c']);
            },
            "should recognise not specified env variable as array when second element empty": function (store) {
                process.env['b'] = 'a,';
                store.loadEnv();
                assert.deepEqual(store.get('b'), ['a','']);
            },
            "should recognise array with other element empty": function (store) {
                process.env['c'] = 'a,b,';
                store.loadEnv();
                assert.deepEqual(store.get('c'), ['a', 'b', '']);
            },
            "should recognise specified env variable as single-element array when second element empty": function (store) {
                process.env['b'] = 'a,';
                store.loadEnv();
                assert.deepEqual(store.get('b'), ['a','']);
            }
        }
    }
}).export(module);
