{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the hyperbolic cosine of x.
test 'Math.cosh' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {cosh} = Math
  assert.ok typeof! cosh is \Function, 'Is function'
  assert.ok /native code/.test(cosh), 'looks like native'
  sameValue cosh(NaN), NaN
  assert.strictEqual cosh(0), 1
  assert.strictEqual cosh(-0), 1
  assert.strictEqual cosh(Infinity), Infinity
  assert.strictEqual cosh(-Infinity), Infinity # v8 bug!
  assert.ok epsilon cosh(12), 81377.39571257407, 3e-11
  assert.ok epsilon cosh(22), 1792456423.065795780980053377, 1e-5
  assert.ok epsilon cosh(-10), 11013.23292010332313972137
  assert.ok epsilon cosh(-23), 4872401723.1244513000, 1e-5