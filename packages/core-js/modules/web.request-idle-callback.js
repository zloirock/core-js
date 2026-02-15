'use strict';
var $ = require('../internals/export');
var requestIdleCallback = require('../internals/idle-callbacks').request;
var globalThis = require('../internals/global-this');

$({ global: true }, { requestIdleCallback });
