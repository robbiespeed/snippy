const fortune = require('fortune');
const jsonApiSerializer = require('fortune-json-api');
const nedbAdapter = require('fortune-nedb');
const fse = require('fs-extra');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fetch = require('node-fetch');
const session = require('express-session');

const thisDir = __dirname;
const GH_CLIENT_ID = process.env.SNIPPY_GH_ID;
const GH_CLIENT_SECRET = process.env.SNIPPY_GH_SCRT;

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
  serializers: [ [ jsonApiSerializer ] ]
});

// const internalSerializer = fortune.net.http.instantiateSerializer(
//   store, jsonApiSerializer
// );

const server = express();

// TODO: make session more secure by providing strict domain
// TODO: look at perf concerns of express-session
server.use(session({
  secret: process.env.SNIPPY_SES_SCRT,
  resave: false,
  saveUninitialized: false,
}));

// TODO: move auth stuff into a utils middleware
server.get('/login', (request, response) => {
  // TODO: pull redirect_uri in from env
  const redirect_uri = 'http://localhost:1337/authorize';
  const state = crypto.randomBytes(32).toString('hex');
  request.session.state = state;

  response.redirect(
    'https://github.com/login/oauth/authorize' +
      '?client_id=' + encodeURIComponent(GH_CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(redirect_uri) +
      '&state=' + encodeURIComponent(state)
  );
});

function fetchRequest (url = '/', options = {}) {
  return fetch(url,  options)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        console.log('request went fine');
        return response.json();
      }
      else {
        console.log('there was an error', response);
        return response.json().then((error) => Promise.reject(error));
      }
    });
}

function githubApiRequest (authToken = null, path = '', options = {}) {
  if (!authToken) { return Promise.reject('authToken needed'); }

  if (!options.headers) { options.headers = {}; }
  options.headers['Accept'] = 'application/vnd.github.v3+json';
  options.headers['Authorization'] = 'token ' + authToken;

  return fetchRequest('https://api.github.com/' + path,  options);
}

server.get('/authorize', (request, response) => {
  console.log('authorize hit');
  const state = request.query.state;

  if (state && state === request.session.state) {
    console.log('state match');

    const code = request.query.code;
    let token =
    fetchRequest(
      'https://github.com/login/oauth/access_token' +
        '?client_id=' + encodeURIComponent(GH_CLIENT_ID) +
        '&client_secret=' + encodeURIComponent(GH_CLIENT_SECRET) +
        '&code=' + encodeURIComponent(code) +
        '&state=' + encodeURIComponent(state),
      { method: 'POST', headers: { Accept: 'application/json' } }
    )
      .then((tokenData) => {
        token = tokenData.access_token;
        return githubApiRequest(token, 'user');
      })
      .then((user) => {
        return store.find('user', null, { filter: { nid: user.login } })
          .then((findResponse) => {
            // TODO: add JWT auth
            if (findResponse.payload.count) {
              // return internalSerializer.processResponse(findResponse, {}, {});
              return findResponse.payload.records[0].id;
            }
            else {
              // TODO: protect from overlap even though github won't have any
              return store.create('user', { nid: user.login, name: user.name })
                .then((createResponse) => {
                  return createResponse.payload.records[0].id;
                });
            }
          });
      })
      .then((userId) => {
        response.redirect(
          'http://localhost:4200?user_id=' + encodeURIComponent(userId)
        );
      })
      .catch((error) => {
        console.log('error:', error);
        response.redirect(
          'http://localhost:4200?error=' + encodeURIComponent('internal login error')
        );
      });
  }
  else {
    response.status(401).send(JSON.stringify({
      errors: [{
        title: 'Authorization state invalid'
      }]
    }));
  }
});

// TODO: restrict to only allowed domains (localhost for now)
server.use(cors());
server.use(listener);

store.connect().then(() => {
  server.listen(1337);
  console.log(`serving snippy-api on 'localhost:${port}'`);
});
