'use strict';
require('../../modules/es.map.constructor');
require('../../modules/esnext.map.get-or-insert');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'getOrInsert');
