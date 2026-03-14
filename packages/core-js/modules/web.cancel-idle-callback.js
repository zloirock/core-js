'use strict';
var $ = require('../internals/export');

var cancelIdleCallback = require('../internals/idle-callbacks').cancel;
var FORCED = require('../internals/idle-callbacks').forced;

$({ global: true, forced: FORCED }, {
  cancelIdleCallback: cancelIdleCallback
});
