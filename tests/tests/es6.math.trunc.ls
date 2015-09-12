{module, test} = QUnit
module \ES6
# Returns the integral part of the number x, removing any fractional digits. If x is already an integer, the result is x.
test 'Math.trunc' (assert)->
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {trunc} = Math
  assert.ok typeof! trunc is \Function, 'Is function'
  assert.ok /native code/.test(trunc), 'looks like native'
  sameValue trunc(NaN), NaN, 'NaN -> NaN'
  sameValue trunc(-0), -0, '-0 -> -0'
  sameValue trunc(0), 0, '0 -> 0'
  sameValue trunc(Infinity), Infinity, 'Infinity -> Infinity'
  sameValue trunc(-Infinity), -Infinity, '-Infinity -> -Infinity'
  sameValue trunc(null), 0, 'null -> 0'
  sameValue trunc({}), NaN, '{} -> NaN'
  assert.strictEqual trunc([]), 0, '[] -> 0'
  assert.strictEqual trunc(1.01), 1, '1.01 -> 0'
  assert.strictEqual trunc(1.99), 1, '1.99 -> 0'
  assert.strictEqual trunc(-1), -1, '-1 -> -1'
  assert.strictEqual trunc(-1.99), -1, '-1.99 -> -1'
  assert.strictEqual trunc(-555.555), -555, '-555.555 -> -555'
  assert.strictEqual trunc(0x20000000000001), 0x20000000000001, '0x20000000000001 -> 0x20000000000001'
  assert.strictEqual trunc(-0x20000000000001), -0x20000000000001, '-0x20000000000001 -> -0x20000000000001'