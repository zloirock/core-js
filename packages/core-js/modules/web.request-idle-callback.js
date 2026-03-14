'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');

var requestIdleCallback = require('../internals/idle-callbacks').request;
var FORCED = require('../internals/idle-callbacks').forced;

$({ global: true, forced: FORCED }, {
  requestIdleCallback: requestIdleCallback
});
