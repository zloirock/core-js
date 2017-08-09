{module, test} = QUnit
module \ES

test 'String.fromCodePoint' (assert)!->
  {fromCodePoint} = String
  assert.isFunction fromCodePoint
  assert.arity fromCodePoint, 1
  assert.name fromCodePoint, \fromCodePoint
  assert.looksNative fromCodePoint
  assert.nonEnumerable String, \fromCodePoint
  # tests from https://github.com/mathiasbynens/String.fromCodePoint/blob/master/tests/tests.js
  assert.strictEqual fromCodePoint(''), '\0'
  assert.strictEqual fromCodePoint!, ''
  assert.strictEqual fromCodePoint(-0), '\0'
  assert.strictEqual fromCodePoint(0), '\0'
  assert.strictEqual fromCodePoint(0x1D306), '\uD834\uDF06'
  assert.strictEqual fromCodePoint(0x1D306, 0x61, 0x1D307), '\uD834\uDF06a\uD834\uDF07'
  assert.strictEqual fromCodePoint(0x61, 0x62, 0x1D307), 'ab\uD834\uDF07'
  assert.strictEqual fromCodePoint(false), '\0'
  assert.strictEqual fromCodePoint(null), '\0'
  assert.throws (!-> fromCodePoint \_), RangeError
  assert.throws (!-> fromCodePoint '+Infinity'), RangeError
  assert.throws (!-> fromCodePoint '-Infinity'), RangeError
  assert.throws (!-> fromCodePoint -1), RangeError
  assert.throws (!-> fromCodePoint 0x10FFFF + 1), RangeError
  assert.throws (!-> fromCodePoint 3.14), RangeError
  assert.throws (!-> fromCodePoint 3e-2), RangeError
  assert.throws (!-> fromCodePoint -Infinity), RangeError
  assert.throws (!-> fromCodePoint Infinity), RangeError
  assert.throws (!-> fromCodePoint NaN), RangeError
  assert.throws (!-> fromCodePoint void), RangeError
  assert.throws (!-> fromCodePoint {}), RangeError
  assert.throws (!-> fromCodePoint /./), RangeError
  tmp = 0x60;
  assert.strictEqual fromCodePoint({valueOf: -> ++tmp}), \a
  assert.strictEqual tmp, 0x61
  counter = (2 ** 15) * 3 / 2
  result = []
  while --counter >= 0 => result.push 0 # one code unit per symbol
  fromCodePoint.apply null result # must not throw
  counter = (2 ** 15) * 3 / 2
  result = []
  while --counter >= 0 => result.push 0xFFFF + 1 # two code units per symbol
  fromCodePoint.apply null result # must not throw