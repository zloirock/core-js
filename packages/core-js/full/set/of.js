'use strict';
require('../../modules/es.object.to-string');
require('../../modules/es.array.iterator');
require('../../modules/es.set.constructor');
require('../../modules/es.set.difference');
require('../../modules/es.set.intersection');
require('../../modules/es.set.is-disjoint-from');
require('../../modules/es.set.is-subset-of');
require('../../modules/es.set.is-superset-of');
require('../../modules/es.set.symmetric-difference');
require('../../modules/es.set.union');
require('../../modules/esnext.set.of');
var path = require('../../internals/path');

module.exports = path.Set.of;
