'use strict';
require('../../modules/es.map.constructor');
require('../../modules/esnext.map.update');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'update');
