# snippy

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://ember-cli.com/)

## Installation

* `git clone <repository-url>` this repository
* `cd snippy/client`
* `npm install`
* `cd ../server`
* `npm install`

## Running Client
* `cd snippy/client`
* `ember s`

Client can be accessed from `localhost:4200`

## Running Server
* `cd snippy/server`
* `node index`

Server can be accessed from `localhost:1337` with `Content-Type:application/vnd.api+json`

Ex:
* curl -H "Content-Type:application/vnd.api+json" localhost:1337
* curl -H "Content-Type:application/vnd.api+json" localhost:1337/snippets
