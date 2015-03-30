'use strict'

QUnit.module 'ES6 String#includes'

test '*' !->
  ok typeof! String::includes is \Function, 'Is function'
  ok not 'abc'includes!
  ok 'aundefinedb'includes!
  ok 'abcd'includes \b 1
  ok not 'abcd'includes \b 2
  if (-> @).call(void) is void
    throws (-> String::includes.call null, '.'), TypeError
    throws (-> String::includes.call void, '.'), TypeError
  throws (-> 'foo[a-z]+(bar)?'includes /[a-z]+/), TypeError