'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var uncurryThis = require('../internals/function-uncurry-this');
var anObjectOrUndefined = require('../internals/an-object-or-undefined');
const toUnsignedLong = require('../internals/to-unsigned-long');

var $requestIdleCallback = require('../internals/idle-callbacks').request;

var nativeRequestIdleCallback = globalThis.requestIdleCallback;
var apply = uncurryThis(Function.prototype.apply);
var NEEDED = require('../internals/idle-callbacks').forced;

$({ global: true, forced: true }, {
  requestIdleCallback: function requestIdleCallback(callback) {
    // No support at all; use the custom polyfill
    if (NEEDED) return apply($requestIdleCallback, null, arguments);
    // We have basic support. SpiderMonkey / Firefox handles negative/0 timeouts incorrectly.
    // Since there's no good way to detect Firefox in production, always normalize timeout.
    var options = arguments[1];
    anObjectOrUndefined(options);
    var timeout = 0;
    if (options !== undefined) timeout = toUnsignedLong(options.timeout);
    if (timeout <= 0) return nativeRequestIdleCallback(callback);
    return nativeRequestIdleCallback(callback, { timeout: timeout });
  }
});
