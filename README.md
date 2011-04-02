# nconf

A hybrid local / remote configuration storage library for node.js.

## Installation

### Installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### Installing nconf
<pre>
  [sudo] npm install nconf
</pre>

## Usage 
Using nconf is easy; it is designed to be a simple key-value store with support for both local and remote storage. Keys are namespaced and delimited by `:`. Lets dive right into sample usage:

<pre>
  var fs    = require('fs'),
      nconf = require('nconf');
  
  //
  // Setup nconf to user the 'file' store and set a couple of values;
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
</pre>

## Storage Engines

### Memory

### File

### Redis

## More Documentation

## Run Tests
Tests are written in vows and give complete coverage of all APIs and storage engines.
<pre>
  vows test/*-test.js --spec
</pre>

#### Author: [Charlie Robbins](http://www.charlierobbins.com)