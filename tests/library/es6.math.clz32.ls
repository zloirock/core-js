{module, test} = QUnit
module \ES6

test 'Math.clz32' (assert)->
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {clz32} = core.Math
  assert.ok typeof! clz32 is \Function, 'Is function'
  assert.strictEqual clz32(0), 32
  assert.strictEqual clz32(1), 31
  sameValue clz32(-1), 0
  assert.strictEqual clz32(0.6), 32
  sameValue clz32(2^32 - 1), 0
  assert.strictEqual clz32(2^32), 32