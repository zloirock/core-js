'use strict'

QUnit.module \ES6

test 'String#includes' !->
  {includes} = core.String
  ok typeof! includes is \Function, 'Is function'
  ok not includes 'abc'
  ok includes 'aundefinedb'
  ok includes 'abcd' \b 1
  ok not includes 'abcd' \b 2
  if !(-> @)!
    throws (-> includes null, '.'), TypeError
    throws (-> includes void, '.'), TypeError
  throws (-> includes 'foo[a-z]+(bar)?' /[a-z]+/), TypeError