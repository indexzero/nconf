var fs    = require('fs'),
    path  = require('path'),
    nconf = require('./lib/nconf');

//
// Configure the provider with a single store and
// support for command-line arguments and environment
// variables.
//
var single = new nconf.Provider({
  env: true,
  argv: true,
  store: {
    type: 'file',
    file: path.join(__dirname, 'config.json')
  }
});

/*
var easy = new nconf.Provider()
  .argv()
  .env('NCONF_') // use all envs starting with "NCONF_"
  .file({file: path.join(__dirname, 'user-config.json')})
  .literal({
    defaults: 'can be hard coded'
  })
//*/

var easy = new nconf.Provider()
  .add('argv')
  .add('env','NCONF_') // use all envs starting with "NCONF_"
  .add('file',{file: path.join(__dirname, 'user-config.json')})
  .add('literal',{
    defaults: 'can be hard coded'
  })
//*/
console.dir(easy.sources)
console.dir(easy.get('defaults'))

//
// Configure the provider with multiple hierarchical stores
// representing `user` and `global` configuration values. 
//
var multiple = new nconf.Provider({
  stores: [
    { type: 'argv' },
    { name: 'user', type: 'file', file: path.join(__dirname, 'user-config.json') },
    { name: 'user2', type: 'file', file: path.join(__dirname, 'user-config2.json') },
  ]
});

multiple.add('literal', {hello: 'that was easy'})
multiple.add('env', 'NCONF_')

//
// Setup nconf to use the 'file' store and set a couple of values;
//
nconf.use('file', { file: path.join(__dirname, 'config.json') });
nconf.set('database:host', '127.0.0.1');
nconf.set('database:port', 5984);

//
// Get the entire database object from nconf
//
var database = nconf.get('database');
console.dir(database);

//
// Save the configuration object to disk
//
nconf.save(function (err) {
  fs.readFile(path.join(__dirname, 'config.json'), function (err, data) {
    console.dir(JSON.parse(data.toString()))
  });
});

