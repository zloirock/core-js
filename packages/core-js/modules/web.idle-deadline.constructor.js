'use strict';
var globalThis = require('../internals/global-this');
var $ = require('../internals/export');

var $IdleDeadline = require('../internals/idle-callbacks').deadline;

var FORCED = !globalThis.requestIdleCallback || !globalThis.cancelIdleCallback || !globalThis.IdleDeadline;

$({ global: true, constructor: true, wrap: true, arity: 0, forced: FORCED }, {
  IdleDeadline: $IdleDeadline
});
