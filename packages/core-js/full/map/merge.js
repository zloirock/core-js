'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.map');
require('../../modules/es.string.iterator');
require('../../modules/esnext.map.merge');
require('../../modules/web.dom-collections.iterator');
var entryUnbind = require('../../internals/entry-unbind');

module.exports = entryUnbind('Map', 'merge');
