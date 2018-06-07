// `Math.sign` method
// https://tc39.github.io/ecma262/#sec-math.sign
require('../internals/export')({ target: 'Math', stat: true }, { sign: require('../internals/math-sign') });
