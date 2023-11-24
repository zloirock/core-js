'use strict';
var parent = require('../../actual/typed-array/methods');
require('../../modules/es.map');
require('../../modules/es.promise');
require('../../modules/esnext.typed-array.from-async');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.typed-array.at');
// TODO: Remove from `core-js@4`
require('../../modules/esnext.typed-array.filter-out');
require('../../modules/esnext.typed-array.filter-reject');
require('../../modules/esnext.typed-array.group-by');
require('../../modules/esnext.typed-array.unique-by');
require('../../modules/esnext.uint8-array.from-base64');
require('../../modules/esnext.uint8-array.from-hex');
require('../../modules/esnext.uint8-array.to-base64');
require('../../modules/esnext.uint8-array.to-hex');

module.exports = parent;
