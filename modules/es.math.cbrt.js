// 20.2.2.9 Math.cbrt(x)
var sign = require('./_math-sign');

require('./_export')({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});
