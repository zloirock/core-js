// 20.2.2.5 Math.asinh(x)
var $asinh = Math.asinh;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// Tor Browser bug: Math.asinh(0) -> -0
require('./_export')({ target: 'Math', stat: true, forced: !($asinh && 1 / $asinh(0) > 0) }, { asinh: asinh });
