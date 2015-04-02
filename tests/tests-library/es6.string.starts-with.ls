'use strict'

QUnit.module 'ES6 String#startsWith'

test '*' !->
  {startsWith} = core.String
  ok typeof! startsWith is \Function, 'Is function'
  ok startsWith 'undefined'
  ok not startsWith 'undefined' null
  ok startsWith 'abc' ''
  ok startsWith 'abc' 'a'
  ok startsWith 'abc' 'ab'
  ok not startsWith 'abc' 'bc'
  ok startsWith 'abc' '' NaN
  ok startsWith 'abc' \a -1
  ok not startsWith 'abc' \a 1
  ok not startsWith 'abc' \a Infinity
  ok startsWith 'abc' \b on
  ok startsWith 'abc' \a \x
  if (-> @).call(void) is void
    throws (-> startsWith null, '.'), TypeError
    throws (-> startsWith void, '.'), TypeError
  throws (-> startsWith 'qwe' /./), TypeError