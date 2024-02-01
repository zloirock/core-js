'use strict';
require('../../modules/es.array.iterator');
require('../../modules/es.string.iterator');
require('../../modules/es.weak-set');
require('../../modules/esnext.weak-set.from');
require('../../modules/web.dom-collections.iterator');
var path = require('../../internals/path');

module.exports = path.WeakSet.from;
