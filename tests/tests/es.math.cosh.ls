{module, test} = QUnit
module \ES
# Returns an implementation-dependent approximation to the hyperbolic cosine of x.
test 'Math.cosh' (assert)!->
  {cosh} = Math
  assert.isFunction cosh
  assert.name cosh, \cosh
  assert.arity cosh, 1
  assert.looksNative cosh
  assert.nonEnumerable Math, \cosh
  assert.same cosh(NaN), NaN
  assert.strictEqual cosh(0), 1
  assert.strictEqual cosh(-0), 1
  assert.strictEqual cosh(Infinity), Infinity
  assert.strictEqual cosh(-Infinity), Infinity # v8 bug!
  assert.epsilon cosh(12), 81377.39571257407, 3e-11
  assert.epsilon cosh(22), 1792456423.065795780980053377, 1e-5
  assert.epsilon cosh(-10), 11013.23292010332313972137
  assert.epsilon cosh(-23), 4872401723.1244513000, 1e-5