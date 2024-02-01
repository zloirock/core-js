'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.map.constructor');
require('../../modules/es.map.get-or-insert-computed');
require('../../modules/es.string.iterator');

var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'getOrInsertComputed');
