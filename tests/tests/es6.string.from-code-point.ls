QUnit.module 'ES6 String.fromCodePoint'

eq = strictEqual

test '*' !->
  {fromCodePoint} = String
  ok typeof! fromCodePoint is \Function, 'Is function'
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