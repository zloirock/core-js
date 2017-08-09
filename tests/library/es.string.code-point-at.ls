{module, test} = QUnit
module \ES

test 'String#codePointAt' (assert)!->
  {codePointAt} = core.String
  assert.isFunction codePointAt
  # tests from https://github.com/mathiasbynens/String.prototype.codePointAt/blob/master/tests/tests.js
  assert.strictEqual codePointAt('abc\uD834\uDF06def', ''), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def', \_), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def'), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def', -Infinity), void
  assert.strictEqual codePointAt('abc\uD834\uDF06def', -1), void
  assert.strictEqual codePointAt('abc\uD834\uDF06def', -0), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def', 0), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def', 3), 0x1D306
  assert.strictEqual codePointAt('abc\uD834\uDF06def', 4), 0xDF06
  assert.strictEqual codePointAt('abc\uD834\uDF06def', 5), 0x64
  assert.strictEqual codePointAt('abc\uD834\uDF06def', 42), void
  assert.strictEqual codePointAt('abc\uD834\uDF06def', Infinity), void
  assert.strictEqual codePointAt('abc\uD834\uDF06def', Infinity), void
  assert.strictEqual codePointAt('abc\uD834\uDF06def', NaN), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def', no), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def', null), 0x61
  assert.strictEqual codePointAt('abc\uD834\uDF06def', void), 0x61
  assert.strictEqual codePointAt('\uD834\uDF06def', ''), 0x1D306
  assert.strictEqual codePointAt('\uD834\uDF06def', \1), 0xDF06
  assert.strictEqual codePointAt('\uD834\uDF06def', \_), 0x1D306
  assert.strictEqual codePointAt('\uD834\uDF06def'), 0x1D306
  assert.strictEqual codePointAt('\uD834\uDF06def', -1), void
  assert.strictEqual codePointAt('\uD834\uDF06def', -0), 0x1D306
  assert.strictEqual codePointAt('\uD834\uDF06def', 0), 0x1D306
  assert.strictEqual codePointAt('\uD834\uDF06def', 1), 0xDF06
  assert.strictEqual codePointAt('\uD834\uDF06def', 42), void
  assert.strictEqual codePointAt('\uD834\uDF06def', no), 0x1D306
  assert.strictEqual codePointAt('\uD834\uDF06def', null), 0x1D306
  assert.strictEqual codePointAt('\uD834\uDF06def', void), 0x1D306
  assert.strictEqual codePointAt('\uD834abc', ''), 0xD834
  assert.strictEqual codePointAt('\uD834abc', \_), 0xD834
  assert.strictEqual codePointAt('\uD834abc'), 0xD834
  assert.strictEqual codePointAt('\uD834abc', -1), void
  assert.strictEqual codePointAt('\uD834abc', -0), 0xD834
  assert.strictEqual codePointAt('\uD834abc', 0), 0xD834
  assert.strictEqual codePointAt('\uD834abc', no), 0xD834
  assert.strictEqual codePointAt('\uD834abc', NaN), 0xD834
  assert.strictEqual codePointAt('\uD834abc', null), 0xD834
  assert.strictEqual codePointAt('\uD834abc', void), 0xD834
  assert.strictEqual codePointAt('\uDF06abc', ''), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc', \_), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc'), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc', -1), void
  assert.strictEqual codePointAt('\uDF06abc', -0), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc', 0), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc', no), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc', NaN), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc', null), 0xDF06
  assert.strictEqual codePointAt('\uDF06abc', void), 0xDF06
  if STRICT
    assert.throws (!-> codePointAt null, 0), TypeError
    assert.throws (!-> codePointAt void, 0), TypeError