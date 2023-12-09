'use strict';
require('../../modules/es.array-buffer.constructor');
require('../../modules/es.array-buffer.slice');
require('../../modules/es.typed-array.float64-array');
require('./methods');
var globalThis = require('../../internals/global-this');

module.exports = globalThis.Float64Array;
