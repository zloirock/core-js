'use strict'
strict = (-> @).call(void) is void

QUnit.module 'ES6 String'

eq = strictEqual
isFunction = -> typeof! it is \Function

test 'String.fromCodePoint' !->
  {fromCodePoint} = String
  ok isFunction(fromCodePoint), 'Is function'
  # tests from https://github.com/mathiasbynens/String.fromCodePoint/blob/master/tests/tests.js
  eq fromCodePoint(''), '\0'
  eq fromCodePoint!, ''
  eq fromCodePoint(-0), '\0'
  eq fromCodePoint(0), '\0'
  eq fromCodePoint(0x1D306), '\uD834\uDF06'
  eq fromCodePoint(0x1D306, 0x61, 0x1D307), '\uD834\uDF06a\uD834\uDF07'
  eq fromCodePoint(0x61, 0x62, 0x1D307), 'ab\uD834\uDF07'
  eq fromCodePoint(false), '\0'
  eq fromCodePoint(null), '\0'
  throws (-> fromCodePoint \_), RangeError
  throws (-> fromCodePoint '+Infinity'), RangeError
  throws (-> fromCodePoint '-Infinity'), RangeError
  throws (-> fromCodePoint -1), RangeError
  throws (-> fromCodePoint 0x10FFFF + 1), RangeError
  throws (-> fromCodePoint 3.14), RangeError
  throws (-> fromCodePoint 3e-2), RangeError
  throws (-> fromCodePoint -Infinity), RangeError
  throws (-> fromCodePoint Infinity), RangeError
  throws (-> fromCodePoint NaN), RangeError
  throws (-> fromCodePoint void), RangeError
  throws (-> fromCodePoint {}), RangeError
  throws (-> fromCodePoint /./), RangeError
  
  tmp = 0x60;
  eq fromCodePoint({valueOf: -> ++tmp}), \a
  eq tmp, 0x61
  
  counter = (2 ** 15) * 3 / 2
  result = []
  while --counter >= 0 => result.push 0 # one code unit per symbol
  fromCodePoint.apply null result # must not throw

  counter = (2 ** 15) * 3 / 2
  result = []
  while --counter >= 0 => result.push 0xFFFF + 1 # two code units per symbol
  fromCodePoint.apply null result # must not throw

test 'String.raw' !->
  {raw} = String
  ok isFunction(raw), 'Is function'
  eq raw({raw: ['Hi\\n', '!']} , \Bob), 'Hi\\nBob!', 'raw is array'
  eq raw({raw: \test}, 0, 1, 2), 't0e1s2t', 'raw is string'
  eq raw({raw: \test}, 0), 't0est', 'lacks substituting'
  throws (-> raw {}), TypeError
  throws (-> raw {raw: null}), TypeError

test 'String#codePointAt' !->
  ok isFunction(String::codePointAt), 'Is function'
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
  if strict
    throws (-> String::codePointAt.call null, 0), TypeError
    throws (-> String::codePointAt.call void, 0), TypeError
test 'String#includes' !->
  ok isFunction(String::includes), 'Is function'
  ok not 'abc'includes!
  ok 'aundefinedb'includes!
  ok 'abcd'includes \b 1
  ok not 'abcd'includes \b 2
  if strict
    throws (-> String::includes.call null, '.'), TypeError
    throws (-> String::includes.call void, '.'), TypeError
  throws (-> 'foo[a-z]+(bar)?'includes /[a-z]+/), TypeError
test 'String#endsWith' !->
  ok isFunction(String::endsWith), 'Is function'
  ok 'undefined'endsWith!
  ok not 'undefined'endsWith null
  ok 'abc'endsWith ''
  ok 'abc'endsWith 'c'
  ok 'abc'endsWith 'bc'
  ok not 'abc'endsWith 'ab'
  ok 'abc'endsWith '' NaN
  ok not 'abc'endsWith \c -1
  ok 'abc'endsWith \a 1
  ok 'abc'endsWith \c Infinity
  ok 'abc'endsWith \a on
  ok not 'abc'endsWith \c \x
  ok not 'abc'endsWith \a \x
  if strict
    throws (-> String::endsWith.call null, '.'), TypeError
    throws (-> String::endsWith.call void, '.'), TypeError
  throws (-> 'qwe'endsWith /./), TypeError
test 'String#startsWith' !->
  ok isFunction(String::startsWith), 'Is function'
  ok 'undefined'startsWith!
  ok not 'undefined'startsWith null
  ok 'abc'startsWith ''
  ok 'abc'startsWith 'a'
  ok 'abc'startsWith 'ab'
  ok not 'abc'startsWith 'bc'
  ok 'abc'startsWith '' NaN
  ok 'abc'startsWith \a -1
  ok not 'abc'startsWith \a 1
  ok not 'abc'startsWith \a Infinity
  ok 'abc'startsWith \b on
  ok 'abc'startsWith \a \x
  if strict
    throws (-> String::startsWith.call null, '.'), TypeError
    throws (-> String::startsWith.call void, '.'), TypeError
  throws (-> 'qwe'startsWith /./), TypeError
test 'String#repeat' !->
  ok isFunction(String::repeat), 'Is function'
  eq 'qwe'repeat(3), \qweqweqwe
  eq 'qwe'repeat(2.5), \qweqwe
  throws (-> 'qwe'repeat -1), RangeError
  throws (-> 'qwe'repeat Infinity), RangeError
  if strict
    throws (-> String::repeat.call null, 1), TypeError
    throws (-> String::repeat.call void, 1), TypeError