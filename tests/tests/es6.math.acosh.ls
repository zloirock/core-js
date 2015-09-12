{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
test 'Math.acosh' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {acosh} = Math
  assert.ok typeof! acosh is \Function, 'Is function'
  assert.strictEqual acosh.name, \acosh, 'name is "acosh"'
  assert.strictEqual acosh.length, 1, 'length is 1'
  assert.ok /native code/.test(acosh), 'looks like native'
  sameValue acosh(NaN), NaN
  sameValue acosh(0.5), NaN
  sameValue acosh(-1), NaN
  sameValue acosh(-1e300), NaN
  sameValue acosh(1), 0
  assert.strictEqual acosh(Infinity), Infinity
  assert.ok epsilon acosh(1234), 7.811163220849231
  assert.ok epsilon acosh(8.88), 2.8737631531629235
  assert.ok epsilon acosh(1e+160), 369.10676205960726
  assert.ok epsilon acosh(Number.MAX_VALUE), 710.475860073944 #buggy v8 implementation
  assert.ok epsilon acosh(1 + Number.EPSILON), 2.1073424255447017e-8