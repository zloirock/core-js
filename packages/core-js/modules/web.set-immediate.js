// types: common/efficient-script-yielding
'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var apply = require('../internals/function-apply');
var isCallable = require('../internals/is-callable');
var ENVIRONMENT = require('../internals/environment');
var arraySlice = require('../internals/array-slice');
var validateArgumentsLength = require('../internals/validate-arguments-length');
var setTask = require('../internals/task').set;

var $Function = Function;
var $setImmediate = globalThis.setImmediate;

// Bun 0.3.0- checks
// https://github.com/oven-sh/bun/issues/1633
var WRAP = $setImmediate && ENVIRONMENT === 'BUN' && (function () {
  var version = globalThis.Bun.version.split('.');
  return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
})();

// `setImmediate` method
// http://w3c.github.io/setImmediate/#si-setImmediate
$({ global: true, bind: true, enumerable: true, forced: $setImmediate !== setTask }, {
  setImmediate: WRAP ? function setImmediate(handler /* , ...arguments */) {
    var boundArgs = validateArgumentsLength(arguments.length, 1) > 1;
    var fn = isCallable(handler) ? handler : $Function(handler);
    var params = boundArgs ? arraySlice(arguments, 1) : [];
    var callback = boundArgs ? function () {
      apply(fn, this, params);
    } : fn;
    return setTask(callback);
  } : setTask,
});
