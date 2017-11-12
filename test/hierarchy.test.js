/*
 * hierarchy-test.js: Basic tests for hierarchical file stores.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const nconf = require('../lib/nconf');

const configDir = path.join(__dirname, 'fixtures', 'hierarchy');
const globalConfig = path.join(configDir, 'global.json');
const userConfig = path.join(configDir, 'user.json');

describe('nconf/hierarchy, When using nconf', () => {
  it("configured with two file stores, should have the appropriate keys present", () => {
    nconf.add('user', {type: 'file', file: userConfig});
    nconf.add('global', {type: 'file', file: globalConfig});
    nconf.load();

    expect(nconf.get('title')).toEqual('My specific title');
    expect(nconf.get('color')).toEqual('green');
    expect(nconf.get('movie')).toEqual('Kill Bill');

  });
  it("configured with two file stores using `file` should have the appropriate keys present", () => {
    nconf.file('user', userConfig);
    nconf.file('global', globalConfig);
    nconf.load();

    expect(nconf.get('title')).toEqual('My specific title');
    expect(nconf.get('color')).toEqual('green');
    expect(nconf.get('movie')).toEqual('Kill Bill');

  });

  it("configured with .argv(), .env() and .file() should not persist information passed in to process.env and process.argv to disk",
    done => {
      const configFile = path.join(__dirname, 'fixtures', 'load-save.json');
      const script = path.join(__dirname, 'fixtures', 'scripts', 'nconf-hierarchical-load-save.js');
      const argv = ['--foo', 'foo', '--bar', 'bar'];
      let data = '';

      try {
        fs.unlinkSync(configFile)
      }
      catch (ex) {
        // No-op
      }

      const child = spawn('node', [script].concat(argv));

      child.stdout.on('data', function (d) {
        data += d;
      });

      child.on('close', function () {
        fs.readFile(configFile, 'utf8', (err, ondisk) => {
          expect(data).toEqual('foo');
          expect(JSON.parse(ondisk)).toEqual({
            database: {
              host: '127.0.0.1',
              port: 5984
            }
          });
        });
        done();
      });

    });

  it("configured with .argv(), .file() and invoked with nested command line options, should merge nested objects",
    done => {
      const script = path.join(__dirname, 'fixtures', 'scripts', 'nconf-hierarchical-load-merge.js');
      const argv = ['--candy:something', 'foo', '--candy:something5:second', 'bar'];
      let data = '';

      const child = spawn('node', [script].concat(argv));

      child.stdout.on('data', function (d) {
        data += d;
      });

      child.on('close', function () {
        expect(JSON.parse(data)).toEqual({
          apples: true,
          candy: {
            something: 'foo',
            something1: true,
            something2: true,
            something5: {
              first: 1,
              second: 'bar'
            }
          }
        });
        done();
      });
    });
  it("configured with .argv() and separator, .file() and invoked with nested command line options should merge nested objects", done => {

    const script = path.join(__dirname, 'fixtures',
      'scripts', 'nconf-hierarchical-load-merge-with-separator.js');
    const argv = ['--candy--something', 'foo', '--candy--something5--second', 'bar'];
    let data = '';
    process.env.candy__bonbon = 'sweet';
    const child = spawn('node', [script].concat(argv));
    delete process.env.candy__bonbon;
    child.stdout.on('data', function (d) {
      data += d;
    });

    child.on('close', function () {
      console.log(data)
      expect(JSON.parse(data)).toEqual({
        apples: true,
        candy: {
          bonbon: 'sweet',
          something: 'foo',
          something1: true,
          something2: true,
          something5: {
            first: 1,
            second: 'bar'
          }
        }
      });
      done();
    });
  });

  it("configured with .file(), .defaults() should deep merge objects should merge nested objects ", done => {
    const script = path.join(__dirname, 'fixtures', 'scripts', 'nconf-hierarchical-defaults-merge.js');
    let data = '';
    const child = spawn('node', [script]);

    child.stdout.on('data', function (d) {
      data += d;
    });

    child.on('close', function () {
      expect(JSON.parse(data)).toEqual({
        candy: {
          something: 'much better something for you',
          something1: true,
          something2: true,
          something18: 'completely unique',
          something5: {
            first: 1,
            second: 99
          }
        }
      });
      done();
    });
  })
})
