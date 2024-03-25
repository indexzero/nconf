/*
 * formats.js: Default formats supported by nconf
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var ini = require('ini');
var vm = require('vm');
var util = require('util');

var formats = exports;

//
// ### @json
// Standard JSON format which pretty prints `.stringify()`.
//
formats.json = {
  stringify: function (obj, replacer, spacing) {
    return JSON.stringify(obj, replacer || null, spacing || 2)
  },
  parse: JSON.parse
};

//
// ### @ini
// Standard INI format supplied from the `ini` module
// http://en.wikipedia.org/wiki/INI_file
//
formats.ini = ini;

//
// ### @js
// Javascript file in CommonJS module format
//
formats.js = {
  stringify: function (obj, replacer, spacing) {
    var space = '',
      numSpace = (spacing || 2);
    for (var i=0; i < numSpace; i++) {
        space = space + ' ';
    }
    var prefix = 'module.exports' + space + '=' + space;
    var jsonStr = JSON.stringify(obj, replacer || null , numSpace);
    return prefix + jsonStr + ';';
  },
  parse: function (text) {
    var context = {module: {exports: {}}};
    vm.runInNewContext(text, context, {
      lineOffset: 0,
      displayErrors: true
    });
    console.log(util.inspect(context));
    return context.module.exports;
  }
};
