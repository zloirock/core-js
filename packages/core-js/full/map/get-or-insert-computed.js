'use strict';
require('../../modules/es.map.constructor');
require('../../modules/esnext.map.get-or-insert-computed');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'getOrInsertComputed');
