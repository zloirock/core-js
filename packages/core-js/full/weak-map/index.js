'use strict';
var parent = require('../../actual/weak-map');
require('../../modules/es.string.iterator');
require('../../modules/esnext.weak-map.from');
require('../../modules/esnext.weak-map.of');
require('../../modules/esnext.weak-map.emplace');
require('../../modules/esnext.weak-map.get-or-insert');
require('../../modules/esnext.weak-map.get-or-insert-computed');

module.exports = parent;
