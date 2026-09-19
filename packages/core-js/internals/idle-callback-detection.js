'use strict';
var globalThis = require('../internals/global-this');
var Firefox = require('../internals/environment-ff-version');

exports.BASIC = globalThis.requestIdleCallback && globalThis.cancelIdleCallback && globalThis.IdleDeadline;
exports.BOUNDS = !Firefox;
