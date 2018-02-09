// `Number.EPSILON` constant
// https://tc39.github.io/ecma262/#sec-number.epsilon
require('./_export')({ target: 'Number', stat: true }, { EPSILON: Math.pow(2, -52) });
