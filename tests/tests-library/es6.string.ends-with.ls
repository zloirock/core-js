'use strict'

QUnit.module 'ES6 String#endsWith'

test '*' !->
  {endsWith} = core.String
  ok typeof! endsWith is \Function, 'Is function'
  ok endsWith 'undefined'
  ok not endsWith 'undefined' null
  ok endsWith 'abc' ''
  ok endsWith 'abc' 'c'
  ok endsWith 'abc' 'bc'
  ok not endsWith 'abc' 'ab'
  ok endsWith 'abc' '' NaN
  ok not endsWith 'abc' \c -1
  ok endsWith 'abc' \a 1
  ok endsWith 'abc' \c Infinity
  ok endsWith 'abc' \a on
  ok not endsWith 'abc' \c \x
  ok not endsWith 'abc' \a \x
  if (-> @).call(void) is void
    throws (-> endsWith null, '.'), TypeError
    throws (-> endsWith void, '.'), TypeError
  throws (-> endsWith 'qwe' /./), TypeError