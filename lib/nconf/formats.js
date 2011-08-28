/*
 * formats.js: Default formats supported by nconf
 *
 * (C) 2011, Charlie Robbins
 *
 */

var ini = require('ini');

var formats = exports;

//
// ### @json
// Standard JSON format which pretty prints `.stringify()`.
//
formats.json = {
  stringify: function (obj) {
    return JSON.stringify(obj, null, 2)
  },
  parse: JSON.parse
};

//
// ### @ini
// Standard INI format supplied from the `ini` module
// http://en.wikipedia.org/wiki/INI_file
//
formats.ini = ini;