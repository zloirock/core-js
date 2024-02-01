'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.string.iterator');
require('../../modules/es.weak-map.constructor');
require('../../modules/es.weak-map.get-or-insert-computed');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('WeakMap', 'getOrInsertComputed');
