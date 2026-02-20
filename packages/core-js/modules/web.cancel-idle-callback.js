'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');
var IS_PURE = require('../internals/is-pure');

var BASIC = !!globalThis.requestIdleCallback && !!globalThis.cancelIdleCallback;
var requestIdleCallback = require('../internals/idle-callbacks').request;
var cancelIdleCallback = require('../internals/idle-callbacks').cancel;

$({ global: true, forced: !BASIC }, {
  cancelIdleCallback: cancelIdleCallback
});

if (!IS_PURE) {
  $({ global: true, arity: 1, forced: !BASIC }, {
    requestIdleCallback: requestIdleCallback
  });
}
