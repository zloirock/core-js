'use strict'

QUnit.module 'ES6 String#codePointAt'

eq = strictEqual

test '*' !->
  ok typeof! String::codePointAt is \Function, 'Is function'
  # tests from https://github.com/mathiasbynens/String.prototype.codePointAt/blob/master/tests/tests.js
  eq 'abc\uD834\uDF06def'codePointAt(''), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(\_), 0x61
  eq 'abc\uD834\uDF06def'codePointAt!, 0x61
  eq 'abc\uD834\uDF06def'codePointAt(-Infinity), void
  eq 'abc\uD834\uDF06def'codePointAt(-1), void
  eq 'abc\uD834\uDF06def'codePointAt(-0), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(0), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(3), 0x1D306
  eq 'abc\uD834\uDF06def'codePointAt(4), 0xDF06
  eq 'abc\uD834\uDF06def'codePointAt(5), 0x64
  eq 'abc\uD834\uDF06def'codePointAt(42), void
  eq 'abc\uD834\uDF06def'codePointAt(Infinity), void
  eq 'abc\uD834\uDF06def'codePointAt(Infinity), void
  eq 'abc\uD834\uDF06def'codePointAt(NaN), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(no), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(null), 0x61
  eq 'abc\uD834\uDF06def'codePointAt(void), 0x61
  eq '\uD834\uDF06def'codePointAt(''), 0x1D306
  eq '\uD834\uDF06def'codePointAt(\1), 0xDF06
  eq '\uD834\uDF06def'codePointAt(\_), 0x1D306
  eq '\uD834\uDF06def'codePointAt!, 0x1D306
  eq '\uD834\uDF06def'codePointAt(-1), void
  eq '\uD834\uDF06def'codePointAt(-0), 0x1D306
  eq '\uD834\uDF06def'codePointAt(0), 0x1D306
  eq '\uD834\uDF06def'codePointAt(1), 0xDF06
  eq '\uD834\uDF06def'codePointAt(42), void
  eq '\uD834\uDF06def'codePointAt(no), 0x1D306
  eq '\uD834\uDF06def'codePointAt(null), 0x1D306
  eq '\uD834\uDF06def'codePointAt(void), 0x1D306
  eq '\uD834abc'codePointAt(''), 0xD834
  eq '\uD834abc'codePointAt(\_), 0xD834
  eq '\uD834abc'codePointAt!, 0xD834
  eq '\uD834abc'codePointAt(-1), void
  eq '\uD834abc'codePointAt(-0), 0xD834
  eq '\uD834abc'codePointAt(0), 0xD834
  eq '\uD834abc'codePointAt(no), 0xD834
  eq '\uD834abc'codePointAt(NaN), 0xD834
  eq '\uD834abc'codePointAt(null), 0xD834
  eq '\uD834abc'codePointAt(void), 0xD834
  eq '\uDF06abc'codePointAt(''), 0xDF06
  eq '\uDF06abc'codePointAt(\_), 0xDF06
  eq '\uDF06abc'codePointAt!, 0xDF06
  eq '\uDF06abc'codePointAt(-1), void
  eq '\uDF06abc'codePointAt(-0), 0xDF06
  eq '\uDF06abc'codePointAt(0), 0xDF06
  eq '\uDF06abc'codePointAt(no), 0xDF06
  eq '\uDF06abc'codePointAt(NaN), 0xDF06
  eq '\uDF06abc'codePointAt(null), 0xDF06
  eq '\uDF06abc'codePointAt(void), 0xDF06
  if (-> @).call(void) is void
    throws (-> String::codePointAt.call null, 0), TypeError
    throws (-> String::codePointAt.call void, 0), TypeError