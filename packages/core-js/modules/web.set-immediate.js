// @types: web/set-immediate
'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var apply = require('../internals/function-apply');
var isCallable = require('../internals/is-callable');
var ENVIRONMENT = require('../internals/environment');
var arraySlice = require('../internals/array-slice');
var validateArgumentsLength = require('../internals/validate-arguments-length');
var task = require('../internals/task');

var $Function = Function;
var $setImmediate = globalThis.setImmediate;
var setTask = task.set;
var clearTask = task.clear;

// Bun 0.3.0- checks
// https://github.com/oven-sh/bun/issues/1633
var WRAP = $setImmediate && ENVIRONMENT === 'BUN' && (function () {
  var version = globalThis.Bun.version.split('.');
  return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
})();

// `setImmediate` and `clearImmediate` methods
// http://w3c.github.io/setImmediate/#si-setImmediate
// http://w3c.github.io/setImmediate/#si-clearImmediate
$({ global: true, bind: true, enumerable: true, forced: $setImmediate !== setTask || globalThis.clearImmediate !== clearTask }, {
  setImmediate: WRAP ? function setImmediate(handler /* , ...arguments */) {
    var boundArgs = validateArgumentsLength(arguments.length, 1) > 1;
    var fn = isCallable(handler) ? handler : $Function(handler);
    var params = boundArgs ? arraySlice(arguments, 1) : [];
    var callback = boundArgs ? function () {
      apply(fn, this, params);
    } : fn;
    return setTask(callback);
  } : setTask,
  clearImmediate: clearTask,
});
