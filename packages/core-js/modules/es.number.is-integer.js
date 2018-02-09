// `Number.isInteger` method
// https://tc39.github.io/ecma262/#sec-number.isinteger
require('./_export')({ target: 'Number', stat: true }, { isInteger: require('core-js-internals/is-integer') });
