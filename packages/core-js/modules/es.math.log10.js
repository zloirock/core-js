// `Math.log10` method
// https://tc39.github.io/ecma262/#sec-math.log10
require('./_export')({ target: 'Math', stat: true }, {
  log10: function log10(x) {
    return Math.log(x) * Math.LOG10E;
  }
});
