// `Array.isArray` method
// https://tc39.github.io/ecma262/#sec-array.isarray
require('../internals/export')({ target: 'Array', stat: true }, { isArray: require('../internals/is-array') });
