'use strict';
var parent = require('../../actual/iterator');
require('../../modules/esnext.iterator.range');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.iterator.sliding');

module.exports = parent;
