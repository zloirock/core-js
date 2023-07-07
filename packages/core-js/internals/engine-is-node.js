'use strict';
var classof = require('../internals/classof-raw');

module.exports = typeof process != 'undefined' && classof(process) == 'process';
