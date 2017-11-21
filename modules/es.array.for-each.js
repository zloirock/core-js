'use strict';
var $export = require('./_export');
var forEach = require('./_array-for-each');

// 22.1.3.10 Array.prototype.forEach(callbackfn [, thisArg])
$export($export.P + $export.F * ([].forEach != forEach), 'Array', { forEach: forEach });
