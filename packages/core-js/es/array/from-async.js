'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.array.from-async');
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.string.iterator');
var path = require('../../internals/path');

module.exports = path.Array.fromAsync;
