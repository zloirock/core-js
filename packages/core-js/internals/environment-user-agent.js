'use strict';
var globalThis = require('../internals/global');

var navigator = globalThis.navigator;
var userAgent = navigator && navigator.userAgent;

module.exports = userAgent ? String(userAgent) : '';
