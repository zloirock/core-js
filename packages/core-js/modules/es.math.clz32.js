// `Math.clz32` method
// https://tc39.github.io/ecma262/#sec-math.clz32
require('../internals/export')({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});
