// `Number.isInteger` method
// https://tc39.github.io/ecma262/#sec-number.isinteger
require('../internals/export')({ target: 'Number', stat: true }, {
  isInteger: require('../internals/is-integer')
});
