'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.map.constructor');
require('../../modules/es.string.iterator');
require('../../modules/esnext.map.from');
require('../../modules/esnext.map.emplace');
require('../../modules/esnext.map.get-or-insert');
require('../../modules/esnext.map.get-or-insert-computed');
require('../../modules/web.dom-collections.iterator');
var path = require('../../internals/path');

module.exports = path.Map.from;
