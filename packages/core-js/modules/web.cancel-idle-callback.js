'use strict';
var $ = require('../internals/export');
var cancelIdleCallback = require('../internals/idle-callbacks').cancel;

$({ global: true }, { cancelIdleCallback });
