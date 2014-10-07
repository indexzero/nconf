/*
 * formats.js: Default formats supported by nconf
 *
 * (C) 2011, Nodejitsu Inc.
 *
 */

var ini = require('ini');
var yaml = require('js-yaml')

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
// ### @yaml
// yaml format.
//
formats.yaml = {
    stringify: function (obj, options) {
        return yaml.safeDump(obj, options)
    },
    parse: function (obj, options) {
        return yaml.safeLoad(obj, options)
    }
};

//
// ### @ini
// Standard INI format supplied from the `ini` module
// http://en.wikipedia.org/wiki/INI_file
//
formats.ini = ini;
