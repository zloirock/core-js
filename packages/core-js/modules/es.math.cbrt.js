var sign = require('../internals/math-sign');

// `Math.cbrt` method
// https://tc39.github.io/ecma262/#sec-math.cbrt
require('../internals/export')({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});
