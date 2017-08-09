{module, test} = QUnit
module \ES

test 'String#includes' (assert)!->
  assert.isFunction String::includes
  assert.arity String::includes, 1
  assert.name String::includes, \includes
  assert.looksNative String::includes
  assert.nonEnumerable String::, \includes
  assert.ok not 'abc'includes!
  assert.ok 'aundefinedb'includes!
  assert.ok 'abcd'includes \b 1
  assert.ok not 'abcd'includes \b 2
  if STRICT
    assert.throws (!-> String::includes.call null, '.'), TypeError
    assert.throws (!-> String::includes.call void, '.'), TypeError
  re = /./
  assert.throws (!-> '/./'includes re), TypeError
  re[Symbol?match] = no
  assert.ok try '/./'includes re
  catch e => no
  O = {}
  assert.ok try '[object Object]'includes O
  catch e => no
  O[Symbol?match] = on
  assert.throws (!-> '[object Object]'includes O), TypeError