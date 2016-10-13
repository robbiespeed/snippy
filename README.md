# snippy

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)
* [GitHub OAuth Application](https://github.com/settings/applications/new)

## Installation

* `git clone git@github.com:robbiespeed/snippy.git`
* `cd snippy/client`
* `npm install`
* `cd ../server`
* `npm install`
* Set callback url of your OAuth Application to `http://localhost:1337/authorize`

## Running Client
* `cd snippy/client`
* `ember s`

Client can be accessed from `localhost:4200`

## Running Server

You will need the following environment variables set

* `export SNIPPY_GH_ID=YourOAuthAppID`
* `export SNIPPY_GH_SCRT=YourOAuthAppSecret`
* `export SNIPPY_SES_SCRT=CustomSecret`
* `export SNIPPY_JWT_SCRT=CustomSecret`

* `cd snippy/server`
* `node index`

Server can be accessed from `localhost:1337` with `Content-Type:application/vnd.api+json`

Ex:
* curl -H "Content-Type:application/vnd.api+json" localhost:1337
* curl -H "Content-Type:application/vnd.api+json" localhost:1337/snippets
