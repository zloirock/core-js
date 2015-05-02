'use strict'

QUnit.module 'ES6 String#startsWith'

eq = strictEqual

test '*' !->
  ok typeof! String::startsWith is \Function, 'Is function'
  eq String::startsWith.length, 1, 'arity is 1'
  if \name of String::startsWith => eq String::startsWith.name, \startsWith, 'name is "startsWith"'
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
  if (-> @).call(void) is void
    throws (-> String::startsWith.call null, '.'), TypeError
    throws (-> String::startsWith.call void, '.'), TypeError
  throws (-> 'qwe'startsWith /./), TypeError