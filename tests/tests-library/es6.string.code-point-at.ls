'use strict'

QUnit.module 'ES6 String#codePointAt'

eq = strictEqual

test '*' !->
  {codePointAt} = core.String
  ok typeof! codePointAt is \Function, 'Is function'
  # tests from https://github.com/mathiasbynens/String.prototype.codePointAt/blob/master/tests/tests.js
  eq codePointAt('abc\uD834\uDF06def', ''), 0x61
  eq codePointAt('abc\uD834\uDF06def', \_), 0x61
  eq codePointAt('abc\uD834\uDF06def'), 0x61
  eq codePointAt('abc\uD834\uDF06def', -Infinity), void
  eq codePointAt('abc\uD834\uDF06def', -1), void
  eq codePointAt('abc\uD834\uDF06def', -0), 0x61
  eq codePointAt('abc\uD834\uDF06def', 0), 0x61
  eq codePointAt('abc\uD834\uDF06def', 3), 0x1D306
  eq codePointAt('abc\uD834\uDF06def', 4), 0xDF06
  eq codePointAt('abc\uD834\uDF06def', 5), 0x64
  eq codePointAt('abc\uD834\uDF06def', 42), void
  eq codePointAt('abc\uD834\uDF06def', Infinity), void
  eq codePointAt('abc\uD834\uDF06def', Infinity), void
  eq codePointAt('abc\uD834\uDF06def', NaN), 0x61
  eq codePointAt('abc\uD834\uDF06def', no), 0x61
  eq codePointAt('abc\uD834\uDF06def', null), 0x61
  eq codePointAt('abc\uD834\uDF06def', void), 0x61
  eq codePointAt('\uD834\uDF06def', ''), 0x1D306
  eq codePointAt('\uD834\uDF06def', \1), 0xDF06
  eq codePointAt('\uD834\uDF06def', \_), 0x1D306
  eq codePointAt('\uD834\uDF06def'), 0x1D306
  eq codePointAt('\uD834\uDF06def', -1), void
  eq codePointAt('\uD834\uDF06def', -0), 0x1D306
  eq codePointAt('\uD834\uDF06def', 0), 0x1D306
  eq codePointAt('\uD834\uDF06def', 1), 0xDF06
  eq codePointAt('\uD834\uDF06def', 42), void
  eq codePointAt('\uD834\uDF06def', no), 0x1D306
  eq codePointAt('\uD834\uDF06def', null), 0x1D306
  eq codePointAt('\uD834\uDF06def', void), 0x1D306
  eq codePointAt('\uD834abc', ''), 0xD834
  eq codePointAt('\uD834abc', \_), 0xD834
  eq codePointAt('\uD834abc'), 0xD834
  eq codePointAt('\uD834abc', -1), void
  eq codePointAt('\uD834abc', -0), 0xD834
  eq codePointAt('\uD834abc', 0), 0xD834
  eq codePointAt('\uD834abc', no), 0xD834
  eq codePointAt('\uD834abc', NaN), 0xD834
  eq codePointAt('\uD834abc', null), 0xD834
  eq codePointAt('\uD834abc', void), 0xD834
  eq codePointAt('\uDF06abc', ''), 0xDF06
  eq codePointAt('\uDF06abc', \_), 0xDF06
  eq codePointAt('\uDF06abc'), 0xDF06
  eq codePointAt('\uDF06abc', -1), void
  eq codePointAt('\uDF06abc', -0), 0xDF06
  eq codePointAt('\uDF06abc', 0), 0xDF06
  eq codePointAt('\uDF06abc', no), 0xDF06
  eq codePointAt('\uDF06abc', NaN), 0xDF06
  eq codePointAt('\uDF06abc', null), 0xDF06
  eq codePointAt('\uDF06abc', void), 0xDF06
  if (-> @).call(void) is void
    throws (-> codePointAt null, 0), TypeError
    throws (-> codePointAt void, 0), TypeError