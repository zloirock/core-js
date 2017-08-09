{module, test} = QUnit
module \ES

test 'String#startsWith' (assert)!->
  assert.isFunction String::startsWith
  assert.arity String::startsWith, 1
  assert.name String::startsWith, \startsWith
  assert.looksNative String::startsWith
  assert.nonEnumerable String::, \startsWith
  assert.ok 'undefined'startsWith!
  assert.ok not 'undefined'startsWith null
  assert.ok 'abc'startsWith ''
  assert.ok 'abc'startsWith 'a'
  assert.ok 'abc'startsWith 'ab'
  assert.ok not 'abc'startsWith 'bc'
  assert.ok 'abc'startsWith '' NaN
  assert.ok 'abc'startsWith \a -1
  assert.ok not 'abc'startsWith \a 1
  assert.ok not 'abc'startsWith \a Infinity
  assert.ok 'abc'startsWith \b on
  assert.ok 'abc'startsWith \a \x
  if STRICT
    assert.throws (!-> String::startsWith.call null, '.'), TypeError
    assert.throws (!-> String::startsWith.call void, '.'), TypeError
  re = /./
  assert.throws (!-> '/./'startsWith re), TypeError
  re[Symbol?match] = no
  assert.ok try '/./'startsWith re
  catch e => no
  O = {}
  assert.ok try '[object Object]'startsWith O
  catch e => no
  O[Symbol?match] = on
  assert.throws (!-> '[object Object]'startsWith O), TypeError