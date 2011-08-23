/*
 * file.js: Simple file storage engine for nconf files
 *
 * (C) 2011, Charlie Robbins
 *
 */

var fs     = require('fs'),
    path   = require('path'),
    util   = require('util'),
    Memory = require('./memory').Memory;
 
//
// ### function File (options)
// #### @options {Object} Options for this instance
// Constructor function for the File nconf store, a simple abstraction
// around the Memory store that can persist configuration to disk.
//
var File = exports.File = function (options) {
  if (!options.file) {
    throw new Error ('Missing required option `files`');
  } 

  Memory.call(this, options);

  this.type   = 'file';
  this.file   = options.file;
  this.search = options.search || false;
  this.format = options.format || {
    stringify: function (obj) {
      return JSON.stringify(obj, null, 2)
    },
    parse: JSON.parse
  };
};

// Inherit from the Memory store
util.inherits(File, Memory);

//
// ### function save (value, callback) 
// #### @value {Object} _Ignored_ Left here for consistency
// #### @callback {function} Continuation to respond to when complete.
// Saves the current configuration object to disk at `this.file` 
// using the format specified by `this.format`.
//
File.prototype.save = function (value, callback) {
  if (!callback) {
    callback = value;
    value = null;
  }
  
  fs.writeFile(this.file, this.format.stringify(this.store), function (err) {
    return err ? callback(err) : callback();
  });
};

//
// ### function saveSync (value, callback) 
// #### @value {Object} _Ignored_ Left here for consistency
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Saves the current configuration object to disk at `this.file` 
// using the format specified by `this.format` synchronously.
//
File.prototype.saveSync = function (value) {
  try {
    fs.writeFileSync(this.file, this.format.stringify(this.store));
  }
  catch (ex) {
    throw(ex);
  }
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
File.prototype.load = function (callback) {
  var self = this;

  path.exists(self.file, function (exists) {
    if (!exists) {
      //
      // If the path we are attempting to load doesn't exist, create it
      //
      self.save({}, function (err) {
        self.store = {};
        return callback(err, self.store);
      });
    }
    else {
      //
      // Else, the path exists, read it from disk
      //
      fs.readFile(self.file, function (err, data) {
        if (err) {
          return callback(err);
        }
        
        try {
          self.store = self.format.parse(data.toString());
        }
        catch (ex) {
          return callback(new Error("Error parsing your JSON configuration file."));
        }
        
        callback(null, self.store);
      });
    }
  });
};

//
// ### function load (callback)
// #### @callback {function} **Optional** Continuation to respond to when complete.
// Attempts to load the data stored in `this.file` synchronously and responds appropriately.
//
File.prototype.loadSync = function () {
  var data, self = this;

  if (!path.existsSync(self.file)) {
    //
    // If the path we are attempting to load doesn't exist, create it
    //
    self.saveSync({});
    self.store = {};
    data = {};
  }
  else {
    //
    // Else, the path exists, read it from disk
    //
    try {
      data = fs.readFileSync(this.file, 'utf8');
      this.store = this.format.parse(data);
    }
    catch (ex) {
      throw new Error("Error parsing your JSON configuration file.")
    }
  }

  return data;
};

//
// ### function resolve (base)
// #### @base {string} Base directory (or file) to begin searching for the target file.
//
File.prototype.resolve = function (base) {
  var looking = this.search,
      fullpath,
      stats;

  if (this.file[0] === '/') {
    //
    // If filename for this instance is a fully qualified path
    // (i.e. it starts with a `'/'`) then check if it exists
    //
    try {
      stats = fs.statSync(fs.realpathSync(fullpath));
      if (stats.isFile()) {
        fullpath = this.file;
        looking = false;
      }
    }
    catch (ex) {
      //
      // Ignore errors
      //
    }
  }

  if (looking && base) {
    //
    // Attempt to stat the realpath located at `base`
    // if the directory does not exist then return false.
    //
    try {
      var stat = fs.statSync(fs.realpathSync(base));
      looking = stat.isDirectory();
    }
    catch (ex) {
      return false;
    }
  }
  
  while (looking) {
    try {
      stats = fs.statSync(fs.realpathSync(fullpath = path.join(base, this.file)));
      looking = stats.isDirectory();
    }
    catch (ex) {
      var olddir = dir;
      dir = path.dirname(dir);

      if (olddir === dir) {
        try {
          var stat = fs.statSync(fs.realpathSync(configPath = path.join(process.env.HOME, filename)));
          if(stat.isDirectory()) {
            configPath = undefined;
          }
        }
        catch (ex) {
          //
          // Ignore errors
          //
          configPath = undefined;
        }
        
        looking = false;
      }
    }
  }

  return fullpath;
};