{module, test} = QUnit
module \ES

test 'String#includes' (assert)!->
  {includes} = core.String
  assert.isFunction includes
  assert.ok not includes 'abc'
  assert.ok includes 'aundefinedb'
  assert.ok includes 'abcd' \b 1
  assert.ok not includes 'abcd' \b 2
  if STRICT
    assert.throws (!-> includes null, '.'), TypeError
    assert.throws (!-> includes void, '.'), TypeError
  re = /./
  assert.throws (!-> includes '/./' re), TypeError
  re[core.Symbol?match] = no
  assert.ok try includes '/./' re
  catch e => no
  O = {}
  assert.ok try includes '[object Object]' O
  catch e => no
  O[core.Symbol?match] = on
  assert.throws (!-> includes '[object Object]' O), TypeError