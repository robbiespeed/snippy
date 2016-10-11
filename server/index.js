const fortune = require('fortune');
const jsonApiSerializer = require('fortune-json-api');
const nedbAdapter = require('fortune-nedb');
const fse = require('fs-extra');
const express = require('express');
const cors = require('cors');

const thisDir = __dirname;

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

const server = express();

// TODO: restrict to only allowed domains (localhost for now)
server.use(cors());
server.use(listener);

store.connect().then(() => {
  server.listen(1337);
  console.log(`serving snippy-api on 'localhost:${port}'`);
});
