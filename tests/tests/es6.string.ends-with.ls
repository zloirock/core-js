'use strict'

QUnit.module 'ES6 String#endsWith'

test '*' !->
  ok typeof! String::endsWith is \Function, 'Is function'
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
  if (-> @).call(void) is void
    throws (-> String::endsWith.call null, '.'), TypeError
    throws (-> String::endsWith.call void, '.'), TypeError
  throws (-> 'qwe'endsWith /./), TypeError