'use strict';
var $ = require('../internals/export');
var requestIdleCallback = require('../internals/idle-callbacks').request;

$({ global: true }, {
  requestIdleCallback: requestIdleCallback
});
