'use strict';
require('../../modules/es.array-buffer.constructor');
require('../../modules/es.array-buffer.slice');
require('../../modules/es.typed-array.uint8-clamped-array');
require('./methods');
var globalThis = require('../../internals/global-this');

module.exports = globalThis.Uint8ClampedArray;
