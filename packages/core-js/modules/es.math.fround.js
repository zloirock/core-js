// `Math.fround` method
// https://tc39.github.io/ecma262/#sec-math.fround
require('../internals/export')({ target: 'Math', stat: true }, { fround: require('../internals/math-fround') });
