// `Math.log2` method
// https://tc39.github.io/ecma262/#sec-math.log2
require('./_export')({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});
