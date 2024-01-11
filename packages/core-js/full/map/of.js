'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.map.constructor');
require('../../modules/esnext.map.of');
require('../../modules/esnext.map.emplace');
require('../../modules/esnext.map.get-or-insert');
require('../../modules/esnext.map.get-or-insert-computed');
var path = require('../../internals/path');

module.exports = path.Map.of;
