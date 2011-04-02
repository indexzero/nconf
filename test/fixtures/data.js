/*
 * data.js: Simple data fixture for configuration test.
 *
 * (C) 2011, Charlie Robbins
 *
 */
 
exports.data = {
  literal: 'bazz', 
  arr: ['one', 2, true, { value: 'foo' }],
  obj: {
    host: 'localhost',
    port: 5984,
    array: ['one', 2, true, { foo: 'bar' }],
    auth: {
      username: 'admin',
      password: 'password'
    }
  }
}