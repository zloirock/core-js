// 20.2.2.22 Math.log2(x)
require('./_export')({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});
