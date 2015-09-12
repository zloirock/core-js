'use strict'
{module, test} = QUnit
module \ES6

test 'String#startsWith' (assert)->
  {startsWith} = core.String
  assert.ok typeof! startsWith is \Function, 'Is function'
  assert.ok startsWith 'undefined'
  assert.ok not startsWith 'undefined' null
  assert.ok startsWith 'abc' ''
  assert.ok startsWith 'abc' 'a'
  assert.ok startsWith 'abc' 'ab'
  assert.ok not startsWith 'abc' 'bc'
  assert.ok startsWith 'abc' '' NaN
  assert.ok startsWith 'abc' \a -1
  assert.ok not startsWith 'abc' \a 1
  assert.ok not startsWith 'abc' \a Infinity
  assert.ok startsWith 'abc' \b on
  assert.ok startsWith 'abc' \a \x
  if !(-> @)!
    assert.throws (-> startsWith null, '.'), TypeError
    assert.throws (-> startsWith void, '.'), TypeError
  assert.throws (-> startsWith 'qwe' /./), TypeError