'use strict';
var globalThis = require('../internals/global-this');
var classof = require('../internals/classof-raw');

module.exports = classof(globalThis.process) === 'process';
