'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.promise.constructor');
require('../../modules/es.promise.catch');
require('../../modules/es.promise.finally');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Promise', 'finally');
