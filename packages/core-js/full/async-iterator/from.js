'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.reject');
require('../../modules/es.promise.resolve');
require('../../modules/es.array.iterator');
require('../../modules/es.string.iterator');
require('../../modules/esnext.async-iterator.from');
require('../../modules/web.dom-collections.iterator');

var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = getBuiltInStaticMethod('AsyncIterator', 'from');
