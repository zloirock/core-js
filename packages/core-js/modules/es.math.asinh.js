var nativeAsinh = Math.asinh;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// `Math.asinh` method
// https://tc39.github.io/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
require('./_export')({ target: 'Math', stat: true, forced: !(
  nativeAsinh && 1 / nativeAsinh(0) > 0
) }, { asinh: asinh });
