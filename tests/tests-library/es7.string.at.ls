'use strict'

QUnit.module 'ES7 String#at'

eq = strictEqual

test '*' !->
  {at} = core.String
  ok typeof! at is \Function, 'Is function'
  # Tests from https://github.com/mathiasbynens/String.prototype.at/blob/master/tests/tests.js
  # String that starts with a BMP symbol
  eq at('abc\uD834\uDF06def', -Infinity), ''
  eq at('abc\uD834\uDF06def' -1), ''
  eq at('abc\uD834\uDF06def' -0), \a
  eq at('abc\uD834\uDF06def' +0), \a
  eq at('abc\uD834\uDF06def' 1), \b
  eq at('abc\uD834\uDF06def' 3), '\uD834\uDF06'
  eq at('abc\uD834\uDF06def' 4), '\uDF06'
  eq at('abc\uD834\uDF06def' 5), \d
  eq at('abc\uD834\uDF06def' 42), ''
  eq at('abc\uD834\uDF06def' Infinity), ''
  eq at('abc\uD834\uDF06def' null), \a
  eq at('abc\uD834\uDF06def' void), \a
  eq at('abc\uD834\uDF06def'), \a
  eq at('abc\uD834\uDF06def' no), \a
  eq at('abc\uD834\uDF06def' NaN), \a
  eq at('abc\uD834\uDF06def' ''), \a
  eq at('abc\uD834\uDF06def' \_), \a
  eq at('abc\uD834\uDF06def' \1), \b
  eq at('abc\uD834\uDF06def', []), \a
  eq at('abc\uD834\uDF06def', {}), \a
  eq at('abc\uD834\uDF06def' -0.9), \a
  eq at('abc\uD834\uDF06def' 1.9), \b
  eq at('abc\uD834\uDF06def' 7.9), \f
  eq at('abc\uD834\uDF06def' 2 ** 32), ''
  # String that starts with an astral symbol
  eq at('\uD834\uDF06def', -Infinity), ''
  eq at('\uD834\uDF06def' -1), ''
  eq at('\uD834\uDF06def' -0), '\uD834\uDF06'
  eq at('\uD834\uDF06def' 0), '\uD834\uDF06'
  eq at('\uD834\uDF06def' 1), '\uDF06'
  eq at('\uD834\uDF06def' 2), 'd'
  eq at('\uD834\uDF06def' 3), 'e'
  eq at('\uD834\uDF06def' 4), 'f'
  eq at('\uD834\uDF06def' 42), ''
  eq at('\uD834\uDF06def' Infinity), ''
  eq at('\uD834\uDF06def' null), '\uD834\uDF06'
  eq at('\uD834\uDF06def' void), '\uD834\uDF06'
  eq at('\uD834\uDF06def' ), '\uD834\uDF06'
  eq at('\uD834\uDF06def' no), '\uD834\uDF06'
  eq at('\uD834\uDF06def' NaN), '\uD834\uDF06'
  eq at('\uD834\uDF06def' ''), '\uD834\uDF06'
  eq at('\uD834\uDF06def' \_), '\uD834\uDF06'
  eq at('\uD834\uDF06def' \1), '\uDF06'
  # Lone high surrogates
  eq at('\uD834abc', -Infinity), ''
  eq at('\uD834abc' -1), ''
  eq at('\uD834abc' -0), '\uD834'
  eq at('\uD834abc' 0), '\uD834'
  eq at('\uD834abc' 1), \a
  eq at('\uD834abc' 42), ''
  eq at('\uD834abc' Infinity), ''
  eq at('\uD834abc' null), '\uD834'
  eq at('\uD834abc' void), '\uD834'
  eq at('\uD834abc'), '\uD834'
  eq at('\uD834abc' no), '\uD834'
  eq at('\uD834abc' NaN), '\uD834'
  eq at('\uD834abc' ''), '\uD834'
  eq at('\uD834abc' \_), '\uD834'
  eq at('\uD834abc' \1), \a
  # Lone low surrogates
  eq at('\uDF06abc', -Infinity), ''
  eq at('\uDF06abc' -1), ''
  eq at('\uDF06abc' -0), '\uDF06'
  eq at('\uDF06abc' 0), '\uDF06'
  eq at('\uDF06abc' 1), \a
  eq at('\uDF06abc' 42), ''
  eq at('\uDF06abc' Infinity), ''
  eq at('\uDF06abc' null), '\uDF06'
  eq at('\uDF06abc' void), '\uDF06'
  eq at('\uDF06abc'), '\uDF06'
  eq at('\uDF06abc' no), '\uDF06'
  eq at('\uDF06abc' NaN), '\uDF06'
  eq at('\uDF06abc' ''), '\uDF06'
  eq at('\uDF06abc' \_), '\uDF06'
  eq at('\uDF06abc' \1), \a
  
  eq at(42 0), \4
  eq at(42 1), \2
  eq at({toString: -> \abc}, 2), \c
  
  if typeof (-> @).call(void) is \undefined
    throws (-> at null, 0), TypeError
    throws (-> at void, 0), TypeError