# nconf

A hybrid local / remote configuration storage library for node.js.

## Installation

### Installing npm (node package manager)
```
  curl http://npmjs.org/install.sh | sh
```

### Installing nconf
```
  [sudo] npm install nconf
```

## Usage 
Using nconf is easy; it is designed to be a simple key-value store with support for both local and remote storage. Keys are namespaced and delimited by `:`. Lets dive right into sample usage:

``` js
  var fs    = require('fs'),
      nconf = require('nconf');
  
  //
  // Setup nconf to use the 'file' store and set a couple of values;
  //
  nconf.use('file', { file: 'path/to/your/config.json' });
  nconf.set('database:host', '127.0.0.1');
  nconf.set('database:port', 5984);
  
  //
  // Get the entire database object from nconf
  //
  var database = nconf.get('database');
  
  //
  // Save the configuration object to disk
  //
  nconf.save(function (err) {
    fs.readFile('path/to/your/config.json', function (err, data) {
      console.dir(JSON.parse(data.toString()))
    });
  });
```

## Storage Engines

### Memory
A simple in-memory storage engine that stores a nested JSON representation of the configuration. To use this engine, just call `.use()` with the appropriate arguments. All calls to `.get()`, `.set()`, `.clear()`, `.reset()` methods are synchronous since we are only dealing with an in-memory object.

``` js 
  nconf.use('memory');
```

### File
Based on the Memory store, but provides additional methods `.save()` and `.load()` which allow you to read your configuration to and from file. As with the Memory store, all method calls are synchronous with the exception of `.save()` and `.load()` which take callback functions. It is important to note that setting keys in the File engine will not be persisted to disk until a call to `.save()` is made.

``` js
  nconf.use('file', { file: 'path/to/your/config.json' });
```

The file store is also extensible for multiple file formats, defaulting to `JSON`. To use a custom format, simply pass a format object to the `.use()` method. This object must have `.parse()` and `.stringify()` methods just like the native `JSON` object.

### Redis
There is a separate Redis-based store available through [nconf-redis][0]. To install and use this store simply:

``` bash
  $ npm install nconf
  $ npm install nconf-redis
```

Once installing both `nconf` and `nconf-redis`, you must require both modules to use the Redis store:

``` js
  var nconf = require('nconf');
  
  //
  // Requiring `nconf-redis` will extend the `nconf`
  // module.
  //
  require('nconf-redis');
  
  nconf.use('redis', { host: 'localhost', port: 6379, ttl: 60 * 60 * 1000 });
```

## More Documentation
There is more documentation available through docco. I haven't gotten around to making a gh-pages branch so in the meantime if you clone the repository you can view the docs:

```
  open docs/nconf.html
```

## Run Tests
Tests are written in vows and give complete coverage of all APIs and storage engines.

```
  vows test/*-test.js --spec
```

#### Author: [Charlie Robbins](http://nodejitsu.com)

[0]: http://github.com/indexzero/nconf