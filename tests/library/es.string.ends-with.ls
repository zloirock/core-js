{module, test} = QUnit
module \ES

test 'String#endsWith' (assert)!->
  {endsWith} = core.String
  assert.isFunction endsWith
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
  if STRICT
    assert.throws (!-> endsWith null, '.'), TypeError
    assert.throws (!-> endsWith void, '.'), TypeError
  re = /./
  assert.throws (!-> endsWith '/./' re), TypeError
  re[core.Symbol?match] = no
  assert.ok try endsWith '/./' re
  catch e => no
  O = {}
  assert.ok try endsWith '[object Object]' O
  catch e => no
  O[core.Symbol?match] = on
  assert.throws (!-> endsWith '[object Object]' O), TypeError