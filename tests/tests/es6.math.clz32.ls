{module, test} = QUnit
module \ES6

test 'Math.clz32' (assert)->
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {clz32} = Math
  assert.ok typeof! clz32 is \Function, 'is function'
  assert.strictEqual clz32.name, \clz32, 'name is "clz32"'
  assert.strictEqual clz32.length, 1, 'arity is 1'
  assert.ok /native code/.test(clz32), 'looks like native'
  assert.strictEqual clz32(0), 32
  assert.strictEqual clz32(1), 31
  sameValue clz32(-1), 0
  assert.strictEqual clz32(0.6), 32
  sameValue clz32(2^32 - 1), 0
  assert.strictEqual clz32(2^32), 32