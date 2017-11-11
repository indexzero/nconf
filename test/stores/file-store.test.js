/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

const fs = require('fs');
const path = require('path');
const nconf = require('../../lib/nconf');
const yamlFormat = require('nconf-yaml');
const data = require('../fixtures/data').data;

// FIXME TO RENAME
describe('nconf/stores/file', () => {
  describe("When using the nconf file store", () => {
    describe("with a valid JSON file", () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'store.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      it("the load() method should load the data correctly", done => {
        const store = new nconf.File({file: filePath});
        store.load((err, data) => {
          expect(err).toBe(null);
          expect(data).toEqual(store.store);
          done();
        })
      });
    });
    describe("with a malformed JSON file", () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'malformed.json');

      it("the load() method with a malformed JSON config file, should respond with an error and indicate file name",
        done => {
          const store = new nconf.File({file: filePath});
          //FIXME this.store.load(this.callback.bind(null, null));
          store.load((err) => {
            expect(err).toBeTruthy();
            expect(err.message).toMatch(/malformed\.json/);
            done();
          })
        });
    });
    describe("with a valid UTF8 JSON file that contains a BOM", () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'bom.json');
      const store = new nconf.File({file: filePath});

      it("the load() method should load the data correctly", done => {
        store.load((err, data) => {
          expect(err).toBe(null);
          expect(data).toEqual(store.store);
          done();
        });
      });
      it("the loadSync() method should load the data correctly", () => {
        const data = store.loadSync();
        expect(data).toEqual(store.store);
      });
    });
    describe("with a valid UTF8 JSON file that contains no BOM", () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'no-bom.json');
      const store = new nconf.File({file: filePath});

      it("the load() method should load the data correctly", done => {
        store.load((err, data) => {
          expect(err).toBe(null);
          expect(data).toEqual(store.store);
          done();
        });
      });
      it("the loadSync() method should load the data correctly", () => {
        const data = store.loadSync();
        expect(data).toEqual(store.store);
      });
    })
  });

  describe("When using the nconf file store", () => {
    const tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json');

    it("the save() method should save the data correctly", done => {
      const tmpStore = new nconf.File({file: tmpPath});

      Object.keys(data).forEach(function (key) {
        tmpStore.set(key, data[key]);
      });

      tmpStore.save(function () {
        fs.readFile(tmpStore.file, function (err, d) {
          fs.unlinkSync(tmpStore.file);

          expect(err).toBe(null);
          expect(JSON.parse(d.toString())).toEqual(data);
          done();
        });
      });
    });
    it("the saveToFile() method should save the data correctly", done => {
      const tmpStore = new nconf.File({file: tmpPath});
      const pathFile = '/tmp/nconf-save-toFile.json';

      Object.keys(data).forEach(function (key) {
        tmpStore.set(key, data[key]);
      });

      tmpStore.saveToFile(pathFile, function () {
        fs.readFile(pathFile, function (err, d) {
          fs.unlinkSync(pathFile);

          expect(err).toBe(null);
          expect(JSON.parse(d.toString())).toEqual(data);
          done();
        });
      });

    });
    it("the saveToFile() method with custom format should save the data correctly", done => {
      const tmpStore = new nconf.File({file: tmpPath});
      const pathFile = '/tmp/nconf-save-toFile.yaml';

      Object.keys(data).forEach(function (key) {
        tmpStore.set(key, data[key]);
      });

      tmpStore.saveToFile(pathFile, yamlFormat, function () {
        fs.readFile(pathFile, function (err, d) {
          fs.unlinkSync(pathFile);

          expect(err).toBe(null);
          expect(yamlFormat.parse(d.toString())).toEqual(data);
          done();
        });
      });
    });
  });

  describe("When using the nconf file store", () => {
    const tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json');
    it("the saveSync() method should save the data correctly", done => {
      const tmpStore = new nconf.File({file: tmpPath});
      Object.keys(data).forEach(function (key) {
        tmpStore.set(key, data[key]);
      });

      const saved = tmpStore.saveSync();

      fs.readFile(tmpStore.file, function (err, d) {
        fs.unlinkSync(tmpStore.file);

        expect(err).toBe(null);
        const read = JSON.parse(d.toString());
        expect(read).toEqual(data);
        expect(read).toEqual(saved);
        done();
      });

    });
  });
  describe("When using the nconf file store", () => {
    const tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json');
    const store = new nconf.File({file: tmpPath});

    it("the set() method should respond with true", () => {
      expect(store.set('foo:bar:bazz', 'buzz')).toBeTruthy();
      expect(store.set('falsy:number', 0)).toBeTruthy();
      expect(store.set('falsy:string', '')).toBeTruthy();
      expect(store.set('falsy:boolean', false)).toBeTruthy();
      expect(store.set('falsy:object', null)).toBeTruthy();
    });
    it("the get() method should respond with the correct value", () => {
      expect(store.get('foo:bar:bazz')).toEqual('buzz');
      expect(store.get('falsy:number')).toEqual(0);
      expect(store.get('falsy:string')).toEqual('');
      expect(store.get('falsy:boolean')).toEqual(false);
      expect(store.get('falsy:object')).toEqual(null);
    });
    it("the clear() method should respond with the true", () => {
      expect(store.get('foo:bar:bazz')).toEqual('buzz');
      expect(store.clear('foo:bar:bazz')).toBeTruthy();
      expect(typeof store.get('foo:bar:bazz') === 'undefined').toBeTruthy();
    });
  });
  describe("When using the nconf file store", () => {

    it("the search() method when the target file exists higher in the directory tree should update the file appropriately", () => {
      const searchBase = process.env.HOME;
      const filePath = path.join(searchBase, '.nconf');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      const store = new nconf.File({
        file: '.nconf'
      });
      store.search(store.searchBase);
      expect(store.file).toEqual(filePath);
      fs.unlinkSync(filePath);
    });
    it("the search() method when the target file doesn't exist higher in the directory tree should update the file appropriately", () => {
      const filePath = path.join(__dirname, '..', 'fixtures', 'search-store.json');
      const store = new nconf.File({
        dir: path.dirname(filePath),
        file: 'search-store.json'
      });
      store.search();
      expect(store.file).toEqual(filePath);
    });

  })
  describe("When using the nconf file store", () => {
    const secureStore = new nconf.File({
      file: path.join(__dirname, '..', 'fixtures', 'secure.json'),
      secure: 'super-secretzzz'
    });

    secureStore.store = data;

    it("the stringify() method should encrypt properly", () => {
      const contents = JSON.parse(secureStore.stringify());
      Object.keys(data).forEach(key => {
        expect(typeof contents[key]).toBe('object');
        expect(typeof contents[key].value).toBe('string');
        expect(contents[key].alg).toEqual('aes-256-ctr');
      });
    });
    it("the parse() method should decrypt properly", () => {
      const contents = secureStore.stringify();
      const parsed = secureStore.parse(contents);
      expect(parsed).toEqual(data);
    });
    it("the load() method should decrypt properly", () => {
      secureStore.load(function (err, loaded) {
        expect(err).toBe(null);
        expect(loaded).toEqual(data);
      });
    });
    it("the loadSync() method should decrypt properly", () => {
      const loaded = secureStore.loadSync()
      expect(loaded).toEqual(data);
    });
  })
});
