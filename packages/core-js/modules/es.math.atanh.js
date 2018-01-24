// 20.2.2.7 Math.atanh(x)
var $atanh = Math.atanh;

// Tor Browser bug: Math.atanh(-0) -> 0
require('./_export')({ target: 'Math', stat: true, forced: !($atanh && 1 / $atanh(-0) < 0) }, {
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});
