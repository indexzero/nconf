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
  stringify: function (obj, replacer, spacing) {
    return JSON.stringify(obj, replacer || null, spacing || 2)
  },
  parse: JSON.parse
};
