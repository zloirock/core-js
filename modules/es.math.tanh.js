// 20.2.2.33 Math.tanh(x)
var expm1 = require('./_math-expm1');
var exp = Math.exp;

require('./_export')({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var a = expm1(x = +x);
    var b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});
