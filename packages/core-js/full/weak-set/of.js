'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.weak-set.constructor');
require('../../modules/esnext.weak-set.of');
require('../../modules/esnext.weak-set.add-all');
require('../../modules/esnext.weak-set.delete-all');
var path = require('../../internals/path');

module.exports = path.WeakSet.of;
