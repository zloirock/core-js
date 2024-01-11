'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.map.constructor');
require('../../modules/esnext.map.of');
require('../../modules/esnext.map.emplace');
var path = require('../../internals/path');

module.exports = path.Map.of;
