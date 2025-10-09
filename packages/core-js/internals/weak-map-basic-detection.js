'use strict';
var globalThis = require('../internals/global-this');
var isCallable = require('../internals/is-callable');
var getFunctionProvenance = require('./function-provenance').getFunctionProvenance;

var WeakMap = globalThis.WeakMap;

module.exports = isCallable(WeakMap) && getFunctionProvenance(WeakMap) !== 'external';
