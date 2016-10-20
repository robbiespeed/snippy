const fortune = require('fortune');
const jsonApiSerializer = require('fortune-json-api');
const nedbAdapter = require('fortune-nedb');
const fse = require('fs-extra');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fetch = require('node-fetch');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const thisDir = __dirname;
const GH_CLIENT_ID = process.env.SNIPPY_GH_ID;
const GH_CLIENT_SECRET = process.env.SNIPPY_GH_SCRT;
const JWT_SECRET = process.env.SNIPPY_JWT_SCRT;

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

// NOTE: here for when I need to serialize and find outside of regular JSONAPI
const internalSerializer = fortune.net.http.instantiateSerializer(
  store, jsonApiSerializer
);

const server = express();

// TODO: restrict to only allowed domains (localhost for now)
server.use(cors());

// TODO: make session more secure by providing strict domain
// TODO: look at perf concerns of express-session
server.use(session({
  secret: process.env.SNIPPY_SES_SCRT,
  resave: false,
  saveUninitialized: false,
}));

function respondWithError (
  response, code = 500, title = 'Internal server error', details
) {
  const error = { title };
  if (details) { error.details = details; }
  response.status(code).send(JSON.stringify({
    errors: [error]
  }));
}

// TODO: move auth stuff into a utils middleware
server.get('/authed-user', (request, response) => {
  console.log('Authorization:', request.get('Authorization'));
  const jwtPayload = jwt.verify(request.get('Authorization'), JWT_SECRET);
  if (jwtPayload.userId) {
    console.log('jwt userId:', jwtPayload.userId);
    store.find('user', jwtPayload.userId)
      .then((findResponse) => {
        if (findResponse.payload.count) {
          console.log('found user:', findResponse.payload.records[0].id);
          return internalSerializer.processResponse(
            findResponse,
            {
              meta: {
                method: 'find',
                type: 'user',
                ids: [ jwtPayload.userId ],
                uriObject: { },
                options: { },
              }
            },
            {}
          );
          // return findResponse.payload.records[0].id;
        }
        else {
          throw new Error(`user [${jwtPayload.userId}] not found`);
        }
      })
      .then((processed) => {
        response.send(processed.payload);
      })
      .catch((reason) => {
        console.log('Error:', reason);
        respondWithError(response, 401, 'Unauthorized');
      });
  }
  else {
    respondWithError(response, 401, 'Unauthorized');
  }
});

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
        return response.json();
      }
      else {
        console.log('Error on internal fetch:', response);
        return response.json().then((error) => Promise.reject(error));
      }
    });
}

function githubApiRequest (authToken, path = '', options = {}) {
  if (!authToken) { return Promise.reject('authToken needed'); }

  if (!options.headers) { options.headers = {}; }
  options.headers['Accept'] = 'application/vnd.github.v3+json';
  options.headers['Authorization'] = 'token ' + authToken;

  return fetchRequest('https://api.github.com/' + path,  options);
}

server.get('/authorize', (request, response) => {
  const state = request.query.state;

  if (state && state === request.session.state) {
    const code = request.query.code;
    // let ghToken;

    fetchRequest(
      'https://github.com/login/oauth/access_token' +
        '?client_id=' + encodeURIComponent(GH_CLIENT_ID) +
        '&client_secret=' + encodeURIComponent(GH_CLIENT_SECRET) +
        '&code=' + encodeURIComponent(code) +
        '&state=' + encodeURIComponent(state),
      { method: 'POST', headers: { Accept: 'application/json' } }
    )
      .then((tokenData) => {
        // ghToken = tokenData.access_token;
        console.log('GH OAuth:', tokenData.access_token);
        return githubApiRequest(tokenData.access_token, 'user');
      })
      .then((user) => {
        console.log('GH user.id:', user.id);
        return store.find('user', null, { match: { ghid: user.id } })
          .then((findResponse) => {
            if (findResponse.payload.count) {
              console.log('matching user found:', findResponse.payload.records[0].id);
              return findResponse.payload.records[0].id;
            }
            else {
              console.log('no matching user found, will create one');
              // TODO: protect from overlap even though github won't have any
              return store.create('user', {
                ghid: user.id,
                uid: user.login,
                name: user.name,
              })
                .then((createResponse) => createResponse.payload.records[0].id);
            }
          });
      })
      .then((userId) => jwt.sign({ userId }, JWT_SECRET))
      .then((token) => {
        response.redirect(
          'http://localhost:4200?token=' + encodeURIComponent(token)
        );
      })
      .catch((error) => {
        console.log('Error:', error);
        response.redirect(
          'http://localhost:4200?error=' + encodeURIComponent('internal login error')
        );
      });
  }
  else {
    console.log('Error: state not valid');
    response.redirect(
      'http://localhost:4200?error=' + encodeURIComponent('internal login error')
    );
  }
});

server.use(listener);

store.connect().then(() => {
  server.listen(1337);
  console.log(`serving snippy-api on 'localhost:${port}'`);
});
