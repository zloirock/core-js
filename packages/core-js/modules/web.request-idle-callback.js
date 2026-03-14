'use strict';
var $ = require('../internals/export');

var requestIdleCallback = require('../internals/idle-callbacks').request;
var FORCED = require('../internals/idle-callbacks').forced;

$({ global: true, forced: FORCED }, {
  requestIdleCallback: requestIdleCallback
});
