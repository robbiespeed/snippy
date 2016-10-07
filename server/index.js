const fortune = require('fortune');
const jsonApiSerializer = require('fortune-json-api');
const nedbAdapter = require('fortune-nedb');
const http = require('http');
const path = require('path');
const fse = require('fs-extra');

const thisDir = path.basename(__dirname);

// clear temp folder, and copy default data into temp folder
try {
  fse.removeSync(`${thisDir}/tmp`);
  fse.copySync(`${thisDir}/data`, `${thisDir}/tmp/data`);
}
catch (err) {
  console.log('something went wrong');
  console.error(err);
}

const models = require('./models');
// const transforms = require('./transforms');

const port = 1337;

const store = fortune(models, {
  adapter: [ nedbAdapter, { dbPath: `${thisDir}/tmp/data` } ],
  // transforms
});

const listener = fortune.net.http(store, {
  serializers: [
    [ jsonApiSerializer ]
  ]
});

const server = http.createServer(listener);

store.connect().then(() => server.listen(port));
console.log(`serving snippy-api on 'localhost:${port}'`);
