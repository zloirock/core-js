'use strict'
{module, test} = QUnit
module \ES6

test 'String#endsWith' (assert)->
  {endsWith} = core.String
  assert.ok typeof! endsWith is \Function, 'Is function'
  assert.ok endsWith 'undefined'
  assert.ok not endsWith 'undefined' null
  assert.ok endsWith 'abc' ''
  assert.ok endsWith 'abc' 'c'
  assert.ok endsWith 'abc' 'bc'
  assert.ok not endsWith 'abc' 'ab'
  assert.ok endsWith 'abc' '' NaN
  assert.ok not endsWith 'abc' \c -1
  assert.ok endsWith 'abc' \a 1
  assert.ok endsWith 'abc' \c Infinity
  assert.ok endsWith 'abc' \a on
  assert.ok not endsWith 'abc' \c \x
  assert.ok not endsWith 'abc' \a \x
  if !(-> @)!
    assert.throws (-> endsWith null, '.'), TypeError
    assert.throws (-> endsWith void, '.'), TypeError
  assert.throws (-> endsWith 'qwe' /./), TypeError