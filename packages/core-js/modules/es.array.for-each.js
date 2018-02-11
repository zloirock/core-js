'use strict';
var forEach = require('../internals/array-for-each');

// `Array.prototype.forEach` method
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
require('../internals/export')({ target: 'Array', proto: true, forced: [].forEach != forEach }, { forEach: forEach });
