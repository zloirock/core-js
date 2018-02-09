// `Array.prototype.copyWithin` method
// https://tc39.github.io/ecma262/#sec-array.prototype.copywithin
require('./_export')({ target: 'Array', proto: true }, { copyWithin: require('core-js-internals/array-copy-within') });

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
require('./_add-to-unscopables')('copyWithin');
