'use strict'
{module, test} = QUnit
module \ES6

test 'String#codePointAt' (assert)->
  assert.ok typeof! String::codePointAt is \Function, 'Is function'
  assert.strictEqual String::codePointAt.length, 1, 'arity is 1'
  assert.ok /native code/.test(String::codePointAt), 'looks like native'
  assert.strictEqual String::codePointAt.name, \codePointAt, 'name is "codePointAt"'
  # tests from https://github.com/mathiasbynens/String.prototype.codePointAt/blob/master/tests/tests.js
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(''), 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(\_), 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt!, 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(-Infinity), void
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(-1), void
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(-0), 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(0), 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(3), 0x1D306
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(4), 0xDF06
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(5), 0x64
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(42), void
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(Infinity), void
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(Infinity), void
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(NaN), 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(no), 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(null), 0x61
  assert.strictEqual 'abc\uD834\uDF06def'codePointAt(void), 0x61
  assert.strictEqual '\uD834\uDF06def'codePointAt(''), 0x1D306
  assert.strictEqual '\uD834\uDF06def'codePointAt(\1), 0xDF06
  assert.strictEqual '\uD834\uDF06def'codePointAt(\_), 0x1D306
  assert.strictEqual '\uD834\uDF06def'codePointAt!, 0x1D306
  assert.strictEqual '\uD834\uDF06def'codePointAt(-1), void
  assert.strictEqual '\uD834\uDF06def'codePointAt(-0), 0x1D306
  assert.strictEqual '\uD834\uDF06def'codePointAt(0), 0x1D306
  assert.strictEqual '\uD834\uDF06def'codePointAt(1), 0xDF06
  assert.strictEqual '\uD834\uDF06def'codePointAt(42), void
  assert.strictEqual '\uD834\uDF06def'codePointAt(no), 0x1D306
  assert.strictEqual '\uD834\uDF06def'codePointAt(null), 0x1D306
  assert.strictEqual '\uD834\uDF06def'codePointAt(void), 0x1D306
  assert.strictEqual '\uD834abc'codePointAt(''), 0xD834
  assert.strictEqual '\uD834abc'codePointAt(\_), 0xD834
  assert.strictEqual '\uD834abc'codePointAt!, 0xD834
  assert.strictEqual '\uD834abc'codePointAt(-1), void
  assert.strictEqual '\uD834abc'codePointAt(-0), 0xD834
  assert.strictEqual '\uD834abc'codePointAt(0), 0xD834
  assert.strictEqual '\uD834abc'codePointAt(no), 0xD834
  assert.strictEqual '\uD834abc'codePointAt(NaN), 0xD834
  assert.strictEqual '\uD834abc'codePointAt(null), 0xD834
  assert.strictEqual '\uD834abc'codePointAt(void), 0xD834
  assert.strictEqual '\uDF06abc'codePointAt(''), 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt(\_), 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt!, 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt(-1), void
  assert.strictEqual '\uDF06abc'codePointAt(-0), 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt(0), 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt(no), 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt(NaN), 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt(null), 0xDF06
  assert.strictEqual '\uDF06abc'codePointAt(void), 0xDF06
  if !(-> @)!
    assert.throws (-> String::codePointAt.call null, 0), TypeError
    assert.throws (-> String::codePointAt.call void, 0), TypeError