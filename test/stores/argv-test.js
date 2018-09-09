/*
 * argv-test.js: Tests for the nconf argv store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var vows = require('vows'),
    assert = require('assert'),
    yargs = require('yargs')
    nconf = require('../../lib/nconf');

vows.describe('nconf/stores/argv').addBatch({
  "An instance of nconf.Argv": {
    topic: new nconf.Argv(),
    "should have the correct methods defined": function (argv) {
      assert.isFunction(argv.loadSync);
      assert.isFunction(argv.loadArgv);
      assert.deepEqual(argv.options, {});
    },
    "can be created with a custom yargs":{
      topic: function(){
        var yargsInstance = yargs.alias('v', 'verbose').default('v', 'false');
        return [yargsInstance, new nconf.Argv(yargsInstance)];
      },
      "and can give access to them": function (argv) {
        var yargsInstance = argv[0];
        argv = argv[1]
        assert.equal(argv.options, yargsInstance)
      },
      "values are the one from the custom yargv": function (argv) {
        argv = argv[1]
        argv.loadSync()
        assert.equal(argv.get('verbose'), 'false');
        assert.equal(argv.get('v'), 'false');
      }
    },
    "can be created with a nconf yargs":{
      topic: function(){
        var options = {verbose: {alias: 'v', default: 'false'}};
        return  new nconf.Argv(options);
      },
      "and can give access to them": function (argv) {
        assert.deepEqual(argv.options, {verbose: {alias: 'v', default: 'false'}})
      },
      "values are the one from the custom yargv": function (argv) {
        argv.loadSync()
        assert.equal(argv.get('verbose'), 'false');
        assert.equal(argv.get('v'), 'false');
      },
      "values cannot be altered with set when readOnly:true": function (argv) {
        argv.set('verbose', 'true');
        assert.equal(argv.get('verbose'), 'false');
      }
    },
    "can be created with readOnly set to be false":{
      topic: function(){
        var options = {verbose: {alias: 'v', default: 'false'}, readOnly: false};
        return new nconf.Argv(options);
      },
      "readOnly is actually false": function (argv) {
        assert.equal(argv.readOnly, false);
      },
      "values can be changed by calling .set": function (argv) {
        argv.loadSync()
        assert.equal(argv.get('verbose'), 'false');
        argv.set('verbose', 'true');
        assert.equal(argv.get('verbose'), 'true');
      }
    }
  }
}).export(module);
