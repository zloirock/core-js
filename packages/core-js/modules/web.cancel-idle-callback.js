'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');

var BASIC = !!globalThis.requestIdleCallback && !!globalThis.cancelIdleCallback;
var cancelIdleCallback = require('../internals/idle-callbacks').cancel;

$({ global: true, forced: !BASIC }, {
  cancelIdleCallback: cancelIdleCallback
});
