/*
 * formats.js: Default formats supported by nconf
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var formats = exports;

//
// ### @json
// Standard JSON format which pretty prints `.stringify()`.
//
formats.json = {
  stringify: function (value, options) {
    options = options || {};
    return JSON.stringify(value, options.replacer || null, options.spacing || 2)
  },
  parse: function (text, options) {
    options = options || {};
    return JSON.parse(text, options.reviver)
  }
};
