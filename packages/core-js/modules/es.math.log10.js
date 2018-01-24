// 20.2.2.21 Math.log10(x)
require('./_export')({ target: 'Math', stat: true }, {
  log10: function log10(x) {
    return Math.log(x) * Math.LOG10E;
  }
});
