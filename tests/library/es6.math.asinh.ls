{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
test 'Math.asinh' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {asinh} = core.Math
  assert.ok typeof! asinh is \Function, 'Is function'
  sameValue asinh(NaN), NaN
  sameValue asinh(0), 0
  sameValue asinh(-0), -0
  assert.strictEqual asinh(Infinity), Infinity
  assert.strictEqual asinh(-Infinity), -Infinity
  assert.ok epsilon asinh(1234), 7.811163549201245
  assert.ok epsilon asinh(9.99), 2.997227420191335
  assert.ok epsilon asinh(1e150), 346.0809111296668
  assert.ok epsilon asinh(1e7), 16.811242831518268
  assert.ok epsilon asinh(-1e7), -16.811242831518268