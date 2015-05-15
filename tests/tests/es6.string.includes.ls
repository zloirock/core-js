'use strict'

QUnit.module 'ES6 String#includes'

eq = strictEqual

test '*' !->
  ok typeof! String::includes is \Function, 'Is function'
  eq String::includes.length, 1, 'arity is 1'
  ok /native code/.test(String::includes), 'looks like native'
  if \name of String::includes => eq String::includes.name, \includes, 'name is "includes"'
  ok not 'abc'includes!
  ok 'aundefinedb'includes!
  ok 'abcd'includes \b 1
  ok not 'abcd'includes \b 2
  if !(-> @)!
    throws (-> String::includes.call null, '.'), TypeError
    throws (-> String::includes.call void, '.'), TypeError
  throws (-> 'foo[a-z]+(bar)?'includes /[a-z]+/), TypeError