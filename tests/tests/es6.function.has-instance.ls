{module, test} = QUnit
module \ES6

test 'Function#@@hasInstance' (assert)!->
  assert.ok Symbol.hasInstance of Function::
  assert.nonEnumerable Function::, Symbol.hasInstance
  assert.ok Function[Symbol.hasInstance] ->
  assert.ok !Function[Symbol.hasInstance] {}