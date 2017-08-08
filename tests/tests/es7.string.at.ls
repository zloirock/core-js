{module, test} = QUnit
module 'ESNext'

test 'String#at' (assert)!->
  assert.isFunction String::at
  assert.arity String::at, 1
  assert.name String::at, \at
  assert.looksNative String::at
  assert.nonEnumerable String::, \at
  # Tests from https://github.com/mathiasbynens/String.prototype.at/blob/master/tests/tests.js
  # String that starts with a BMP symbol
  assert.strictEqual 'abc\uD834\uDF06def'at(-Infinity), ''
  assert.strictEqual 'abc\uD834\uDF06def'at(-1), ''
  assert.strictEqual 'abc\uD834\uDF06def'at(-0), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(+0), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(1), \b
  assert.strictEqual 'abc\uD834\uDF06def'at(3), '\uD834\uDF06'
  assert.strictEqual 'abc\uD834\uDF06def'at(4), '\uDF06'
  assert.strictEqual 'abc\uD834\uDF06def'at(5), \d
  assert.strictEqual 'abc\uD834\uDF06def'at(42), ''
  assert.strictEqual 'abc\uD834\uDF06def'at(Infinity), ''
  assert.strictEqual 'abc\uD834\uDF06def'at(null), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(void), \a
  assert.strictEqual 'abc\uD834\uDF06def'at!, \a
  assert.strictEqual 'abc\uD834\uDF06def'at(no), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(NaN), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(''), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(\_), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(\1), \b
  assert.strictEqual 'abc\uD834\uDF06def'at([]), \a
  assert.strictEqual 'abc\uD834\uDF06def'at({}), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(-0.9), \a
  assert.strictEqual 'abc\uD834\uDF06def'at(1.9), \b
  assert.strictEqual 'abc\uD834\uDF06def'at(7.9), \f
  assert.strictEqual 'abc\uD834\uDF06def'at(2 ** 32), ''
  # String that starts with an astral symbol
  assert.strictEqual '\uD834\uDF06def'at(-Infinity), ''
  assert.strictEqual '\uD834\uDF06def'at(-1), ''
  assert.strictEqual '\uD834\uDF06def'at(-0), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(0), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(1), '\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(2), 'd'
  assert.strictEqual '\uD834\uDF06def'at(3), 'e'
  assert.strictEqual '\uD834\uDF06def'at(4), 'f'
  assert.strictEqual '\uD834\uDF06def'at(42), ''
  assert.strictEqual '\uD834\uDF06def'at(Infinity), ''
  assert.strictEqual '\uD834\uDF06def'at(null), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(void), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(no), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(NaN), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(''), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(\_), '\uD834\uDF06'
  assert.strictEqual '\uD834\uDF06def'at(\1), '\uDF06'
  # Lone high surrogates
  assert.strictEqual '\uD834abc'at(-Infinity), ''
  assert.strictEqual '\uD834abc'at(-1), ''
  assert.strictEqual '\uD834abc'at(-0), '\uD834'
  assert.strictEqual '\uD834abc'at(0), '\uD834'
  assert.strictEqual '\uD834abc'at(1), \a
  assert.strictEqual '\uD834abc'at(42), ''
  assert.strictEqual '\uD834abc'at(Infinity), ''
  assert.strictEqual '\uD834abc'at(null), '\uD834'
  assert.strictEqual '\uD834abc'at(void), '\uD834'
  assert.strictEqual '\uD834abc'at!, '\uD834'
  assert.strictEqual '\uD834abc'at(no), '\uD834'
  assert.strictEqual '\uD834abc'at(NaN), '\uD834'
  assert.strictEqual '\uD834abc'at(''), '\uD834'
  assert.strictEqual '\uD834abc'at(\_), '\uD834'
  assert.strictEqual '\uD834abc'at(\1), \a
  # Lone low surrogates
  assert.strictEqual '\uDF06abc'at(-Infinity), ''
  assert.strictEqual '\uDF06abc'at(-1), ''
  assert.strictEqual '\uDF06abc'at(-0), '\uDF06'
  assert.strictEqual '\uDF06abc'at(0), '\uDF06'
  assert.strictEqual '\uDF06abc'at(1), \a
  assert.strictEqual '\uDF06abc'at(42), ''
  assert.strictEqual '\uDF06abc'at(Infinity), ''
  assert.strictEqual '\uDF06abc'at(null), '\uDF06'
  assert.strictEqual '\uDF06abc'at(void), '\uDF06'
  assert.strictEqual '\uDF06abc'at!, '\uDF06'
  assert.strictEqual '\uDF06abc'at(no), '\uDF06'
  assert.strictEqual '\uDF06abc'at(NaN), '\uDF06'
  assert.strictEqual '\uDF06abc'at(''), '\uDF06'
  assert.strictEqual '\uDF06abc'at(\_), '\uDF06'
  assert.strictEqual '\uDF06abc'at(\1), \a
  {at} = String::
  assert.strictEqual at.call(42 0), \4
  assert.strictEqual at.call(42 1), \2
  assert.strictEqual at.call({toString: -> \abc}, 2), \c
  if STRICT
    assert.throws (!-> String::at.call null, 0), TypeError
    assert.throws (!-> String::at.call void, 0), TypeError