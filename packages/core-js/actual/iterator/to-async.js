'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
require('../../modules/es.promise.resolve');
require('../../modules/es.iterator.constructor');
// TODO: Drop from `core-js@4`
require('../../modules/esnext.iterator.constructor');
require('../../modules/esnext.iterator.to-async');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Iterator', 'toAsync');
