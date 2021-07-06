/*
 * file.js: Simple file storage engine for nconf files
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var os = require('os'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    crypto = require('crypto'),
    formats = require('../formats'),
    Memory = require('./memory').Memory;

var exists = fs.exists || path.exists,
    existsSync = fs.existsSync || path.existsSync;

//
// ### function File (options)
// #### @options {Object} Options for this instance
// Constructor function for the File nconf store, a simple abstraction
// around the Memory store that can persist configuration to disk.
//
var File = exports.File = function (options) {
  if (!options || !options.file) {
    throw new Error('Missing required option `file`');
  }

  Memory.call(this, options);

  this.type    = 'file';
  this.file    = options.file;
  this.dir     = options.dir    || process.cwd();
  this.format  = options.format || formats.json;
  this.secure  = options.secure;
  this.spacing = options.json_spacing
    || options.spacing
    || 2;
  this.eol     = !(options.eol === false);

  if (this.secure) {
    this.secure = Buffer.isBuffer(this.secure) || typeof this.secure === 'string'
      ? { secret: this.secure.toString() }
      : this.secure;

    this.secure.alg = this.secure.alg || 'aes-256-ctr';
    if (this.secure.secretPath) {
      this.secure.secret = fs.readFileSync(this.secure.secretPath, 'utf8');
    }

    if (!this.secure.secret) {
      throw new Error('secure.secret option is required');
    }
  }

  if (options.search) {
    this.search(this.dir);
  }
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
  this.saveToFile(this.file, value, callback);
};

//
// ### function saveToFile (path, value, callback)
// #### @path {string} The path to the file where we save the configuration to
// #### @format {Object} Optional formatter, default behing the one of the store
// #### @callback {function} Continuation to respond to when complete.
// Saves the current configuration object to disk at `this.file`
// using the format specified by `this.format`.
//
File.prototype.saveToFile = function (path, format, callback) {
  if (!callback) {
    callback = format;
    format = this.format;
  }

  fs.writeFile(path, this.stringify(format), callback);
};

//
// ### function saveSync (value, callback)
// Saves the current configuration object to disk at `this.file`
// using the format specified by `this.format` synchronously.
//
File.prototype.saveSync = function () {
  fs.writeFileSync(this.file, this.stringify());
  return this.store;
};

//
// ### function load (callback)
// #### @callback {function} Continuation to respond to when complete.
// Responds with an Object representing all keys associated in this instance.
//
File.prototype.load = function (callback) {
  var self = this;

  exists(self.file, function (exists) {
    if (!exists) {
      return callback(null, {});
    }

    //
    // Else, the path exists, read it from disk
    //
    fs.readFile(self.file, function (err, data) {
      if (err) {
        return callback(err);
      }

      try {
        // Deals with string that include BOM
        var stringData = data.toString();
        if (stringData.charAt(0) === '\uFEFF') {
          stringData = stringData.substr(1);
        }

        self.store = self.parse(stringData);
      }
      catch (ex) {
        return callback(new Error("Error parsing your configuration file: [" + self.file + ']: ' + ex.message));
      }

      callback(null, self.store);
    });
  });
};

//
// ### function loadSync (callback)
// Attempts to load the data stored in `this.file` synchronously
// and responds appropriately.
//
File.prototype.loadSync = function () {
  if (!existsSync(this.file)) {
    this.store = {};
    return this.store;
  }

  //
  // Else, the path exists, read it from disk
  //
  try {
    // Deals with file that include BOM
    var fileData = fs.readFileSync(this.file, 'utf8');
    if (fileData.charAt(0) === '\uFEFF') {
      fileData = fileData.substr(1);
    }

    this.store = this.parse(fileData);
  }
  catch (ex) {
    throw new Error("Error parsing your configuration file: [" + this.file + ']: ' + ex.message);
  }

  return this.store;
};

//
// ### function stringify ()
// Returns an encrypted version of the contents IIF
// `this.secure` is enabled
//
File.prototype.stringify = function (format) {
  var data = this.store;
  if (!format) {
      format = this.format
  }

  if (this.secure) {
    var self = this;
    data = Object.keys(data).reduce(function (acc, key) {
      var value = format.stringify(data[key]);
      var iv = crypto.randomBytes(16);
      var cipher = crypto.createCipheriv(self.secure.alg, self.secure.secret, iv);
      var ciphertext = cipher.update(value, 'utf8', 'hex');
      ciphertext += cipher.final('hex');
      acc[key] = { alg: self.secure.alg, value: ciphertext, iv: iv.toString('hex') };
      return acc;
    }, {});
  }

  var stringified = format.stringify(data, null, this.spacing);
  var needsEOL = this.eol && stringified.slice(-1) !== os.EOL;

  return stringified + (needsEOL ? os.EOL : '');
};

//
// ### function parse (contents)
// Returns a decrypted version of the contents IFF
// `this.secure` is enabled.
//
File.prototype.parse = function (contents) {
  var parsed = this.format.parse(contents);

  if (this.secure) {
    var self = this;
    parsed = Object.keys(parsed).reduce(function (acc, key) {
      var value = parsed[key];

      if (!value.iv) {
        throw new Error('Your encrypted file is outdated (encrypted without iv). Please re-encrypt your file using a pre-v1 release of nconf, v0.10 or above.');
      }
      let decipher = crypto.createDecipheriv(value.alg, self.secure.secret, Buffer.from(value.iv, 'hex'));

      var plaintext = decipher.update(value.value, 'hex', 'utf8');
      plaintext += decipher.final('utf8');
      acc[key] = self.format.parse(plaintext);
      return acc;
    }, {});
  }

  return parsed;

};


//
// ### function search (base)
// #### @base {string} Base directory (or file) to begin searching for the target file.
// Attempts to find `this.file` by iteratively searching up the
// directory structure
//
File.prototype.search = function (base) {
  var looking = true,
      fullpath,
      previous,
      stats;

  base = base || process.cwd();

  if (this.file[0] === '/') {
    //
    // If filename for this instance is a fully qualified path
    // (i.e. it starts with a `'/'`) then check if it exists
    //
    try {
      stats = fs.statSync(fs.realpathSync(this.file));
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
    //
    // Iteratively look up the directory structure from `base`
    //
    try {
      stats = fs.statSync(fs.realpathSync(fullpath = path.join(base, this.file)));
      looking = stats.isDirectory();
    }
    catch (ex) {
      previous = base;
      base = path.dirname(base);

      if (previous === base) {
        //
        // If we've reached the top of the directory structure then simply use
        // the default file path.
        //
        try {
          stats = fs.statSync(fs.realpathSync(fullpath = path.join(this.dir, this.file)));
          if (stats.isDirectory()) {
            fullpath = undefined;
          }
        }
        catch (ex) {
          //
          // Ignore errors
          //
        }

        looking = false;
      }
    }
  }

  //
  // Set the file for this instance to the fullpath
  // that we have found during the search. In the event that
  // the search was unsuccessful use the original value for `this.file`.
  //
  this.file = fullpath || this.file;

  return fullpath;
};
