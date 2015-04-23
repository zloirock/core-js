'use strict'

QUnit.module 'ES7 String#at'

eq = strictEqual

test '*' !->
  ok typeof! String::at is \Function, 'Is function'
  # Tests from https://github.com/mathiasbynens/String.prototype.at/blob/master/tests/tests.js
  # String that starts with a BMP symbol
  eq 'abc\uD834\uDF06def'at(-Infinity), ''
  eq 'abc\uD834\uDF06def'at(-1), ''
  eq 'abc\uD834\uDF06def'at(-0), \a
  eq 'abc\uD834\uDF06def'at(+0), \a
  eq 'abc\uD834\uDF06def'at(1), \b
  eq 'abc\uD834\uDF06def'at(3), '\uD834\uDF06'
  eq 'abc\uD834\uDF06def'at(4), '\uDF06'
  eq 'abc\uD834\uDF06def'at(5), \d
  eq 'abc\uD834\uDF06def'at(42), ''
  eq 'abc\uD834\uDF06def'at(Infinity), ''
  eq 'abc\uD834\uDF06def'at(null), \a
  eq 'abc\uD834\uDF06def'at(void), \a
  eq 'abc\uD834\uDF06def'at!, \a
  eq 'abc\uD834\uDF06def'at(no), \a
  eq 'abc\uD834\uDF06def'at(NaN), \a
  eq 'abc\uD834\uDF06def'at(''), \a
  eq 'abc\uD834\uDF06def'at(\_), \a
  eq 'abc\uD834\uDF06def'at(\1), \b
  eq 'abc\uD834\uDF06def'at([]), \a
  eq 'abc\uD834\uDF06def'at({}), \a
  eq 'abc\uD834\uDF06def'at(-0.9), \a
  eq 'abc\uD834\uDF06def'at(1.9), \b
  eq 'abc\uD834\uDF06def'at(7.9), \f
  eq 'abc\uD834\uDF06def'at(2 ** 32), ''
  # String that starts with an astral symbol
  eq '\uD834\uDF06def'at(-Infinity), ''
  eq '\uD834\uDF06def'at(-1), ''
  eq '\uD834\uDF06def'at(-0), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(0), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(1), '\uDF06'
  eq '\uD834\uDF06def'at(2), 'd'
  eq '\uD834\uDF06def'at(3), 'e'
  eq '\uD834\uDF06def'at(4), 'f'
  eq '\uD834\uDF06def'at(42), ''
  eq '\uD834\uDF06def'at(Infinity), ''
  eq '\uD834\uDF06def'at(null), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(void), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(no), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(NaN), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(''), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(\_), '\uD834\uDF06'
  eq '\uD834\uDF06def'at(\1), '\uDF06'
  # Lone high surrogates
  eq '\uD834abc'at(-Infinity), ''
  eq '\uD834abc'at(-1), ''
  eq '\uD834abc'at(-0), '\uD834'
  eq '\uD834abc'at(0), '\uD834'
  eq '\uD834abc'at(1), \a
  eq '\uD834abc'at(42), ''
  eq '\uD834abc'at(Infinity), ''
  eq '\uD834abc'at(null), '\uD834'
  eq '\uD834abc'at(void), '\uD834'
  eq '\uD834abc'at!, '\uD834'
  eq '\uD834abc'at(no), '\uD834'
  eq '\uD834abc'at(NaN), '\uD834'
  eq '\uD834abc'at(''), '\uD834'
  eq '\uD834abc'at(\_), '\uD834'
  eq '\uD834abc'at(\1), \a
  # Lone low surrogates
  eq '\uDF06abc'at(-Infinity), ''
  eq '\uDF06abc'at(-1), ''
  eq '\uDF06abc'at(-0), '\uDF06'
  eq '\uDF06abc'at(0), '\uDF06'
  eq '\uDF06abc'at(1), \a
  eq '\uDF06abc'at(42), ''
  eq '\uDF06abc'at(Infinity), ''
  eq '\uDF06abc'at(null), '\uDF06'
  eq '\uDF06abc'at(void), '\uDF06'
  eq '\uDF06abc'at!, '\uDF06'
  eq '\uDF06abc'at(no), '\uDF06'
  eq '\uDF06abc'at(NaN), '\uDF06'
  eq '\uDF06abc'at(''), '\uDF06'
  eq '\uDF06abc'at(\_), '\uDF06'
  eq '\uDF06abc'at(\1), \a
  
  {at} = String::
  
  eq at.call(42 0), \4
  eq at.call(42 1), \2
  eq at.call({toString: -> \abc}, 2), \c
  
  if typeof (-> @).call(void) is \undefined
    throws (-> String::at.call null, 0), TypeError
    throws (-> String::at.call void, 0), TypeError