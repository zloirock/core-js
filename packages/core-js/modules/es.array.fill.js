// `Array.prototype.fill` method
// https://tc39.github.io/ecma262/#sec-array.prototype.fill
require('./_export')({ target: 'Array', proto: true }, { fill: require('core-js-internals/array-fill') });

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
require('./_add-to-unscopables')('fill');
