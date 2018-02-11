// `Array.prototype.copyWithin` method
// https://tc39.github.io/ecma262/#sec-array.prototype.copywithin
require('../internals/export')({ target: 'Array', proto: true }, {
  copyWithin: require('../internals/array-copy-within')
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
require('../internals/add-to-unscopables')('copyWithin');
