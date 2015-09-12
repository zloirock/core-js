'use strict'
{module, test} = QUnit
module \ES6

test 'String#includes' (assert)->
  {includes} = core.String
  assert.ok typeof! includes is \Function, 'is function'
  assert.ok not includes 'abc'
  assert.ok includes 'aundefinedb'
  assert.ok includes 'abcd' \b 1
  assert.ok not includes 'abcd' \b 2
  if !(-> @)!
    assert.throws (-> includes null, '.'), TypeError
    assert.throws (-> includes void, '.'), TypeError
  assert.throws (-> includes 'foo[a-z]+(bar)?' /[a-z]+/), TypeError