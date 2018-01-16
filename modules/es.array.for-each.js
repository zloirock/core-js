'use strict';
var forEach = require('./_array-for-each');

// 22.1.3.10 Array.prototype.forEach(callbackfn [, thisArg])
require('./_export')({ target: 'Array', proto: true, forced: [].forEach != forEach }, { forEach: forEach });
