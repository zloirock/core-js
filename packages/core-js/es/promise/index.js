'use strict';
require('../../modules/es.aggregate-error.constructor');
require('../../modules/es.array.iterator');
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.reject');
require('../../modules/es.promise.resolve');
require('../../modules/es.promise.all');
require('../../modules/es.promise.all-settled');
require('../../modules/es.promise.any');
require('../../modules/es.promise.race');
require('../../modules/es.promise.try');
require('../../modules/es.promise.with-resolvers');
require('../../modules/es.string.iterator');
var path = require('../../internals/path');

module.exports = path.Promise;
