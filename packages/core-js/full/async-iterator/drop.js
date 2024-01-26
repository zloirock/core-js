'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.reject');
require('../../modules/es.promise.resolve');
require('../../modules/esnext.async-iterator.drop');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('AsyncIterator', 'drop');
