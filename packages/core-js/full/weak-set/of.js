'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.weak-set.constructor');
require('../../modules/esnext.weak-set.of');
var path = require('../../internals/path');

module.exports = path.WeakSet.of;
