'use strict';
require('../../modules/es.weak-map.constructor');
require('../../modules/esnext.weak-map.get-or-insert-computed');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('WeakMap', 'getOrInsertComputed');
