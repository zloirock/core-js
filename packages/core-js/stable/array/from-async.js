'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.resolve');
require('../../modules/es.array.from-async');
require('../../modules/es.array.iterator');
require('../../modules/es.string.iterator');
require('../../modules/web.dom-collections.iterator');

var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = getBuiltInStaticMethod('Array', 'fromAsync');
