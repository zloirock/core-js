'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');

var $requestIdleCallback = require('../internals/idle-callbacks').request;

var nativeRequestIdleCallback = globalThis.requestIdleCallback;
var apply = uncurryThis(Function.prototype.apply);
var NEEDED = require('../internals/idle-callbacks').forced;

var $isNaN = isNaN;

$({ global: true, forced: true }, {
  requestIdleCallback: function requestIdleCallback(callback) {
    // No support at all; use the custom polyfill
    if (NEEDED) return apply($requestIdleCallback, null, arguments);
    // We have basic support. SpiderMonkey / Firefox handles negative timeouts incorrectly.
    // Since there's no good way to detect Firefox in production, always normalize timeout.
    var options = arguments[1];
    var timeout;
    if (options && options.timeout !== undefined) timeout = +options.timeout;
    if ($isNaN(timeout) || timeout <= 0) return nativeRequestIdleCallback(callback);
    return nativeRequestIdleCallback(callback, { timeout: timeout });
  }
});
