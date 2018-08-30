// `Number.isFinite` method
// https://tc39.github.io/ecma262/#sec-number.isfinite
require('../internals/export')({ target: 'Number', stat: true }, {
  isFinite: require('../internals/number-is-finite')
});
