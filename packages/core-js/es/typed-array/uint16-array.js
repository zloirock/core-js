'use strict';
require('../../modules/es.array-buffer.constructor');
require('../../modules/es.array-buffer.slice');
require('../../modules/es.typed-array.uint16-array');
require('./methods');
var globalThis = require('../../internals/global-this');

module.exports = globalThis.Uint16Array;
