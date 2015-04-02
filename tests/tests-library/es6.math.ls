QUnit.module 'ES6 Math'

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.acosh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
  {acosh} = core.Math
  ok isFunction(acosh), 'Is function'
  sameEq acosh(NaN), NaN
  sameEq acosh(0.5), NaN
  sameEq acosh(-1), NaN
  sameEq acosh(-1e300), NaN
  sameEq acosh(1), 0
  eq acosh(Infinity), Infinity
  ok epsilon acosh(1234), 7.811163220849231
  ok epsilon acosh(8.88), 2.8737631531629235
  ok acosh(1e+160), 369.10676205960726
  #ok epsilon acosh(Number.MAX_VALUE), 710.475860073944 #buggy v8 implementation
test 'Math.asinh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
  {asinh} = core.Math
  ok isFunction(asinh), 'Is function'
  sameEq asinh(NaN), NaN
  sameEq asinh(0), 0
  sameEq asinh(-0), -0
  eq asinh(Infinity), Infinity
  eq asinh(-Infinity), -Infinity
  ok epsilon asinh(1234), 7.811163549201245
  ok epsilon asinh(9.99), 2.997227420191335
  ok epsilon asinh(1e150), 346.0809111296668
  ok epsilon asinh(1e7), 16.811242831518268
  ok epsilon asinh(-1e7), -16.811242831518268
test 'Math.atanh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
  {atanh} = core.Math
  ok isFunction(atanh), 'Is function'
  sameEq atanh(NaN), NaN
  sameEq atanh(-2), NaN
  sameEq atanh(-1.5), NaN
  sameEq atanh(2), NaN
  sameEq atanh(1.5), NaN
  eq atanh(-1), -Infinity
  eq atanh(1), Infinity
  sameEq atanh(0), 0
  sameEq atanh(-0), -0
  sameEq atanh(-1e300), NaN
  sameEq atanh(1e300), NaN
  ok epsilon atanh(0.5), 0.5493061443340549
  ok epsilon atanh(-0.5), -0.5493061443340549
  ok epsilon atanh(0.444), 0.47720201260109457
test 'Math.cbrt' !->
  # Returns an implementation-dependent approximation to the cube root of x.
  {cbrt} = core.Math
  ok isFunction(cbrt), 'Is function'
  sameEq cbrt(NaN), NaN
  sameEq cbrt(0), 0
  sameEq cbrt(-0), -0
  eq cbrt(Infinity), Infinity
  eq cbrt(-Infinity), -Infinity
  eq cbrt(-8), -2
  eq cbrt(8), 2
  ok epsilon cbrt(-1000), -10 # O_o
  ok epsilon cbrt(1000), 10   # O_o
test 'Math.clz32' !->
  {clz32} = core.Math
  ok isFunction(clz32), 'Is function'
  eq clz32(0), 32
  eq clz32(1), 31
  sameEq clz32(-1), 0
  eq clz32(0.6), 32
  sameEq clz32(2^32 - 1), 0
  eq clz32(2^32), 32
test 'Math.cosh' !->
  # Returns an implementation-dependent approximation to the hyperbolic cosine of x.
  {cosh} = core.Math
  ok isFunction(cosh), 'Is function'
  sameEq cosh(NaN), NaN
  eq cosh(0), 1
  eq cosh(-0), 1
  eq cosh(Infinity), Infinity
  eq cosh(-Infinity), Infinity # v8 bug!
  ok epsilon cosh(12), 81377.39571257407, 3e-11
  ok epsilon cosh(22), 1792456423.065795780980053377, 1e-5
  ok epsilon cosh(-10), 11013.23292010332313972137
  ok epsilon cosh(-23), 4872401723.1244513000, 1e-5
test 'Math.expm1' !->
  # Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
  {expm1} = core.Math
  ok isFunction(expm1), 'Is function'
  sameEq expm1(NaN), NaN
  sameEq expm1(0), 0
  sameEq expm1(-0), -0
  eq expm1(Infinity), Infinity
  eq expm1(-Infinity), -1
  ok epsilon expm1(10), 22025.465794806718,
  ok epsilon expm1(-10), -0.9999546000702375
if Float32Array? => test 'Math.fround' !->
  # https://github.com/paulmillr/es6-shim/blob/master/test/math.js
  {fround} = core.Math
  ok isFunction(fround), 'Is function'
  sameEq fround(void), NaN
  sameEq fround(NaN), NaN
  sameEq fround(0), 0
  sameEq fround(-0), -0
  sameEq fround(Number.MIN_VALUE), 0
  sameEq fround(-Number.MIN_VALUE), -0
  eq fround(Infinity), Infinity
  eq fround(-Infinity), -Infinity
  eq fround(1.7976931348623157e+308), Infinity
  eq fround(-1.7976931348623157e+308), -Infinity
  eq fround(3.4028235677973366e+38), Infinity
  eq fround(3), 3
  eq fround(-3), -3
  maxFloat32 = 3.4028234663852886e+38
  minFloat32 = 1.401298464324817e-45
  eq fround(maxFloat32), maxFloat32
  eq fround(-maxFloat32), -maxFloat32
  eq fround(maxFloat32 + 2 ** (2 ** (8 - 1) - 1 - 23 - 2)), maxFloat32
  eq fround(minFloat32), minFloat32
  eq fround(-minFloat32), -minFloat32
  sameEq fround(minFloat32 / 2), 0
  sameEq fround(-minFloat32 / 2), -0
  eq fround(minFloat32 / 2 + 2 ** -202), minFloat32
  eq fround(-minFloat32 / 2 - 2 ** -202), -minFloat32
test 'Math.hypot' !->
  # Math.hypot returns an implementation-dependent approximation of the square root of the sum of squares of its arguments.
  {hypot} = core.Math
  {sqrt} = Math
  ok isFunction(hypot), 'Is function'
  sameEq hypot('', 0), 0
  sameEq hypot(0, ''), 0
  eq hypot(Infinity, 0), Infinity
  eq hypot(-Infinity, 0), Infinity
  eq hypot(0, Infinity), Infinity
  eq hypot(0, -Infinity), Infinity
  eq hypot(Infinity, NaN), Infinity
  eq hypot(NaN, -Infinity), Infinity
  sameEq hypot(NaN, 0), NaN
  sameEq hypot(0, NaN), NaN
  sameEq hypot(0, -0), 0
  sameEq hypot(0, 0), 0
  sameEq hypot(-0, -0), 0
  sameEq hypot(-0, 0), 0
  eq hypot(0, 1), 1
  eq hypot(0, -1), 1
  eq hypot(-0, 1), 1
  eq hypot(-0, -1), 1
  sameEq hypot(0), 0
  eq hypot(1), 1
  eq hypot(2), 2
  eq hypot(0 0 1), 1
  eq hypot(0 1 0), 1
  eq hypot(1 0 0), 1
  eq hypot(2 3 4), sqrt(2 * 2 + 3 * 3 + 4 * 4)
  eq hypot(2 3 4 5), sqrt(2 * 2 + 3 * 3 + 4 * 4 + 5 * 5)
  ok epsilon hypot(66 66), 93.33809511662427
  ok epsilon hypot(0.1 100), 100.0000499999875
  eq hypot(1e+300, 1e+300), 1.4142135623730952e+300
  eq hypot(1e-300, 1e-300), 1.4142135623730952e-300
  eq hypot(1e+300, 1e+300, 2, 3), 1.4142135623730952e+300
test 'Math.imul' !->
  {imul} = core.Math
  ok isFunction(imul), 'Is function'
  sameEq imul(0, 0), 0
  eq imul(123, 456), 56088
  eq imul(-123, 456), -56088
  eq imul(123, -456), -56088
  eq imul(16~01234567, 16~fedcba98), 602016552
  sameEq imul(no 7), 0
  sameEq imul(7 no), 0
  sameEq imul(no no), 0
  eq imul(on 7), 7
  eq imul(7 on), 7
  eq imul(on on), 1
  sameEq imul(void 7), 0
  sameEq imul(7 void), 0
  sameEq imul(void void), 0
  sameEq imul(\str 7), 0
  sameEq imul(7 \str), 0
  sameEq imul({} 7), 0
  sameEq imul(7 {}), 0
  sameEq imul([] 7), 0
  sameEq imul(7 []), 0
  eq imul(0xffffffff, 5), -5
  eq imul(0xfffffffe, 5), -10
  eq imul(2 4), 8
  eq imul(-1 8), -8
  eq imul(-2 -2), 4
  sameEq imul(-0 7), 0
  sameEq imul(7 -0), 0
  sameEq imul(0.1 7), 0
  sameEq imul(7 0.1), 0
  sameEq imul(0.9 7), 0
  sameEq imul(7 0.9), 0
  eq imul(1.1 7), 7
  eq imul(7 1.1), 7
  eq imul(1.9 7), 7
  eq imul(7 1.9), 7
test 'Math.log1p' !->
  # Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
  # The result is computed in a way that is accurate even when the value of x is close to zero.
  {log1p} = core.Math
  ok isFunction(log1p), 'Is function'
  sameEq log1p(''), log1p 0
  sameEq log1p(NaN), NaN
  sameEq log1p(-2), NaN
  sameEq log1p(-1), -Infinity
  sameEq log1p(0), 0
  sameEq log1p(-0), -0
  sameEq log1p(Infinity), Infinity
  ok epsilon log1p(5), 1.791759469228055
  ok epsilon log1p(50), 3.9318256327243257
test 'Math.log10' !->
  # Returns an implementation-dependent approximation to the base 10 logarithm of x.
  {log10} = core.Math
  ok isFunction(log10), 'Is function'
  sameEq log10(''), log10 0
  sameEq log10(NaN), NaN
  sameEq log10(-1), NaN
  sameEq log10(0), -Infinity
  sameEq log10(-0), -Infinity
  sameEq log10(1), 0
  sameEq log10(Infinity), Infinity
  ok epsilon log10(0.1), -1 # O_o
  ok epsilon log10(0.5), -0.3010299956639812
  ok epsilon log10(1.5), 0.17609125905568124
  ok epsilon log10(5), 0.6989700043360189
  ok epsilon log10(50), 1.6989700043360187
test 'Math.log2' !->
  # Returns an implementation-dependent approximation to the base 2 logarithm of x.
  {log2} = core.Math
  ok isFunction(log2), 'Is function'
  sameEq log2(''), log2 0
  sameEq log2(NaN), NaN
  sameEq log2(-1), NaN
  sameEq log2(0), -Infinity
  sameEq log2(-0), -Infinity
  sameEq log2(1), 0
  sameEq log2(Infinity), Infinity
  sameEq log2(0.5), -1
  sameEq log2(32), 5
  ok epsilon log2(5), 2.321928094887362
test 'Math.sign' !->
  # Returns the sign of the x, indicating whether x is positive, negative or zero.
  {sign} = core.Math
  ok isFunction(sign), 'Is function'
  sameEq sign(NaN), NaN
  sameEq sign!, NaN
  sameEq sign(-0), -0
  sameEq sign(0), 0
  eq sign(Infinity), 1
  eq sign(-Infinity), -1
  eq sign(16~2fffffffffffff), 1
  eq sign(-16~2fffffffffffff), -1
  eq sign(42.5), 1
  eq sign(-42.5), -1
test 'Math.sinh' !->
  # Returns an implementation-dependent approximation to the hyperbolic sine of x.
  {sinh} = core.Math
  ok isFunction(sinh), 'Is function'
  sameEq sinh(NaN), NaN
  sameEq sinh(0), 0
  sameEq sinh(-0), -0 
  eq sinh(Infinity), Infinity
  eq sinh(-Infinity), -Infinity
  ok epsilon sinh(-5), -74.20321057778875
  ok epsilon sinh(2), 3.6268604078470186
  eq sinh(-2e-17), -2e-17
test 'Math.tanh' !->
  # Returns an implementation-dependent approximation to the hyperbolic tangent of x.
  {tanh} = core.Math
  ok isFunction(tanh), 'Is function'
  sameEq tanh(NaN), NaN
  sameEq tanh(0), 0
  sameEq tanh(-0), -0
  eq tanh(Infinity), 1
  eq tanh(90), 1
  ok epsilon tanh(10), 0.9999999958776927
  #eq tanh(710), 1 #buggy v8 implementation
test 'Math.trunc' !->
  # Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
  {trunc} = core.Math
  ok isFunction(trunc), 'Is function'
  sameEq trunc(NaN), NaN, 'NaN -> NaN'
  sameEq trunc(-0), -0, '-0 -> -0'
  sameEq trunc(0), 0, '0 -> 0'
  sameEq trunc(Infinity), Infinity, 'Infinity -> Infinity'
  sameEq trunc(-Infinity), -Infinity, '-Infinity -> -Infinity'
  sameEq trunc(null), 0, 'null -> 0'
  sameEq trunc({}), NaN, '{} -> NaN'
  eq trunc([]), 0, '[] -> 0'
  eq trunc(1.01), 1, '1.01 -> 0'
  eq trunc(1.99), 1, '1.99 -> 0'
  eq trunc(-1), -1, '-1 -> -1'
  eq trunc(-1.99), -1, '-1.99 -> -1'
  eq trunc(-555.555), -555, '-555.555 -> -555'
  eq trunc(0x20000000000001), 0x20000000000001, '0x20000000000001 -> 0x20000000000001'
  eq trunc(-0x20000000000001), -0x20000000000001, '-0x20000000000001 -> -0x20000000000001'