'use strict';
var $ = require('../internals/export');

var $IdleDeadline = require('../internals/idle-callbacks').deadline;
var FORCED = require('../internals/idle-callbacks').forced;

$({ global: true, constructor: true, forced: FORCED }, {
  IdleDeadline: $IdleDeadline
});
