{module, test} = QUnit
module \ES

test 'String#endsWith' (assert)!->
  assert.isFunction String::endsWith
  assert.arity String::endsWith, 1
  assert.name String::endsWith, \endsWith
  assert.looksNative String::endsWith
  assert.nonEnumerable String::, \endsWith
  assert.ok 'undefined'endsWith!
  assert.ok not 'undefined'endsWith null
  assert.ok 'abc'endsWith ''
  assert.ok 'abc'endsWith 'c'
  assert.ok 'abc'endsWith 'bc'
  assert.ok not 'abc'endsWith 'ab'
  assert.ok 'abc'endsWith '' NaN
  assert.ok not 'abc'endsWith \c -1
  assert.ok 'abc'endsWith \a 1
  assert.ok 'abc'endsWith \c Infinity
  assert.ok 'abc'endsWith \a on
  assert.ok not 'abc'endsWith \c \x
  assert.ok not 'abc'endsWith \a \x
  if STRICT
    assert.throws (!-> String::endsWith.call null, '.'), TypeError
    assert.throws (!-> String::endsWith.call void, '.'), TypeError
  re = /./
  assert.throws (!-> '/./'endsWith re), TypeError
  re[Symbol?match] = no
  assert.ok try '/./'endsWith re
  catch e => no
  O = {}
  assert.ok try '[object Object]'endsWith O
  catch e => no
  O[Symbol?match] = on
  assert.throws (!-> '[object Object]'endsWith O), TypeError