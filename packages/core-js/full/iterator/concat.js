'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.reject');
require('../../modules/es.promise.resolve');
require('../../modules/es.array.iterator');
require('../../modules/es.iterator.constructor');
require('../../modules/es.iterator.dispose');
require('../../modules/es.iterator.drop');
require('../../modules/es.iterator.every');
require('../../modules/es.iterator.filter');
require('../../modules/es.iterator.find');
require('../../modules/es.iterator.flat-map');
require('../../modules/es.iterator.for-each');
require('../../modules/es.iterator.map');
require('../../modules/es.iterator.reduce');
require('../../modules/es.iterator.some');
require('../../modules/es.iterator.take');
require('../../modules/es.iterator.to-array');
require('../../modules/es.string.iterator');
require('../../modules/esnext.iterator.concat');
require('../../modules/esnext.iterator.to-async');
require('../../modules/web.dom-collections.iterator');

var getBuiltInStaticMethod = require('../../internals/get-built-in-static-method');

module.exports = getBuiltInStaticMethod('Iterator', 'concat');
