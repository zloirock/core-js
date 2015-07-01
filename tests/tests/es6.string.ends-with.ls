'use strict'

QUnit.module \ES6

eq = strictEqual

test 'String#endsWith' !->
  ok typeof! String::endsWith is \Function, 'Is function'
  eq String::endsWith.length, 1, 'arity is 1'
  ok /native code/.test(String::endsWith), 'looks like native'
  if \name of String::endsWith => eq String::endsWith.name, \endsWith, 'name is "endsWith"'
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
  if !(-> @)!
    throws (-> String::endsWith.call null, '.'), TypeError
    throws (-> String::endsWith.call void, '.'), TypeError
  throws (-> 'qwe'endsWith /./), TypeError