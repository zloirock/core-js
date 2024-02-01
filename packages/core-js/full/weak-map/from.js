'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.string.iterator');
require('../../modules/es.weak-map');
require('../../modules/esnext.weak-map.from');
require('../../modules/web.dom-collections.iterator');
var path = require('../../internals/path');

module.exports = path.WeakMap.from;
