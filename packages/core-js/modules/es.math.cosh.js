// 20.2.2.12 Math.cosh(x)
var exp = Math.exp;

require('./_export')({ target: 'Math', stat: true }, {
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  }
});
