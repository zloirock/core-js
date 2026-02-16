'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var IS_PURE = require('../internals/is-pure');

var BASIC = !!globalThis.requestIdleCallback && !!globalThis.cancelIdleCallback;
var cancelIdleCallback = require('../internals/idle-callbacks').cancel;

$({ global: true, forced: IS_PURE || !BASIC }, {
  cancelIdleCallback: cancelIdleCallback
});
