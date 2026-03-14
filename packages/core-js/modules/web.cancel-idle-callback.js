'use strict';
var $ = require('../internals/export');
var globalThis = require('../internals/global-this');

var cancelIdleCallback = require('../internals/idle-callbacks').cancel;
var FORCED = require('../internals/idle-callbacks').forced;

$({ global: true, forced: FORCED }, {
  cancelIdleCallback: cancelIdleCallback
});
