'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var IS_PURE = require('../internals/is-pure');

var BASIC = !!globalThis.requestIdleCallback && !!globalThis.cancelIdleCallback;
var requestIdleCallback = require('../internals/idle-callbacks').request;

$({ global: true, arity: 1, forced: IS_PURE || !BASIC }, {
  requestIdleCallback: requestIdleCallback
});
