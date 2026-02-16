'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');

var BASIC = !!globalThis.requestIdleCallback && !!globalThis.cancelIdleCallback;
var requestIdleCallback = require('../internals/idle-callbacks').request;

$({ global: true, arity: 2, forced: !BASIC }, {
  requestIdleCallback: requestIdleCallback
});
