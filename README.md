# nconf [![Build Status](https://secure.travis-ci.org/flatiron/nconf.png)](http://travis-ci.org/flatiron/nconf)

Hierarchical node.js configuration with files, environment variables, command-line arguments, and atomic object merging.

## Installation

### Installing npm (node package manager)
```
  curl http://npmjs.org/install.sh | sh
```

### Installing nconf
```
  [sudo] npm install nconf
```

## Getting started 
Using nconf is easy; it is designed to be a simple key-value store with support for both local and remote storage. Keys are namespaced and delimited by `:`. Lets dive right into sample usage:

``` js
  var fs    = require('fs'),
      nconf = require('nconf');
  
  //
  // Setup nconf to use the 'file' store and set a couple of values;
  //
  nconf.add('file', { file: 'path/to/your/config.json' });
  nconf.set('database:host', '127.0.0.1');
  nconf.set('database:port', 5984);
  
  //
  // Get the entire database object from nconf. This will output
  // { host: '127.0.0.1', port: 5984 }
  //
  console.dir(nconf.get('database')); 
  
  //
  // Save the configuration object to disk
  //
  nconf.save(function (err) {
    fs.readFile('path/to/your/config.json', function (err, data) {
      console.dir(JSON.parse(data.toString()))
    });
  });
```

## Hierarchical configuration

Configuration management can get complicated very quickly for even trivial applications running in production. `nconf` addresses this problem by enabling you to setup a hierarchy for different sources of configuration with some sane defaults (in-order):

  1. Manually set overrides
  2. Command-line arguments
  3. Environment variables
  4. Any additional user stores (in the order they were added) 

The top-level of `nconf` is an instance of the `nconf.Provider` abstracts this all for you into a simple API.

### nconf.add(name, options)
Adds a new store with the specified `name` and `options`. If `options.type` is not set, then `name` will be used instead:

``` js
  nconf.add('global', { type: 'file', file: '/path/to/globalconf.json' });
  nconf.add('userconf', { type: 'file', file: '/path/to/userconf.json' });
```

### nconf.use(name, options) 
Similar to `nconf.add`, except that it can replace an existing store if new options are provided

``` js
  //
  // Load a file store onto nconf with the specified settings
  //
  nconf.use('file', { file: '/path/to/some/config-file.json' });
  
  //
  // Replace the file store with new settings
  //
  nconf.use('file', { file: 'path/to/a-new/config-file.json' });
```

### nconf.remove(name)
Removes the store with the specified `name.` The configuration stored at that level will no longer be used for lookup(s).

``` js
  nconf.remove('file');
```

## Working with Configuration
`nconf` will traverse the set of stores that you have setup in-order to ensure that the value in the store of the highest priority is used. For example to setup following sample configuration:

1. Command-line arguments
2. Environment variables
3. User configuration
3. Global configuration

``` js
  var nconf = require('nconf');
  
  //
  // Read in command-line arugments and environment variables
  //
  nconf.argv = nconf.env = true;
  
  //
  // Setup the `user` store followed by the `global` store. Note that
  // order is significant in these operations.
  //
  nconf.add('user', { file: 'path/to/user-config.json' });
  nconf.add('global', { file: 'path/to/global-config.json' })
```

## Storage Engines

### Memory
A simple in-memory storage engine that stores a nested JSON representation of the configuration. To use this engine, just call `.use()` with the appropriate arguments. All calls to `.get()`, `.set()`, `.clear()`, `.reset()` methods are synchronous since we are only dealing with an in-memory object.

``` js 
  nconf.use('memory');
```

### System
Based on the Memory store, but exposes hooks into manual overrides, command-line arguments, and environment variables (in that order of priority). Every instance of `nconf.Provider`, including the top-level `nconf` object itself already has a `System` store at the top-level, so configuring it only requires setting properties

``` js
  //
  // `nconf.get(awesome)` will always return true regardless of 
  // command-line arguments or environment variables.
  //
  nconf.overrides = { awesome: true };
  
  //
  // Can also be an object literal to pass to `optimist`.
  //
  nconf.argv = true;
  
  //
  // Can also be an array of variable names to restrict loading to.
  //
  nconf.env = true;
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

``` bash
  $ npm test
```

#### Author: [Charlie Robbins](http://nodejitsu.com)

[0]: http://github.com/indexzero/nconf
