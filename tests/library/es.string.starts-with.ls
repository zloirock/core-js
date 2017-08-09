{module, test} = QUnit
module \ES

test 'String#startsWith' (assert)!->
  {startsWith} = core.String
  assert.isFunction startsWith
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
  if STRICT
    assert.throws (!-> startsWith null, '.'), TypeError
    assert.throws (!-> startsWith void, '.'), TypeError
  re = /./
  assert.throws (!-> startsWith '/./' re), TypeError
  re[core.Symbol?match] = no
  assert.ok try startsWith '/./' re
  catch e => no
  O = {}
  assert.ok try startsWith '[object Object]' O
  catch e => no
  O[core.Symbol?match] = on
  assert.throws (!-> startsWith '[object Object]' O), TypeError