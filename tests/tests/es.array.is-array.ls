{module, test} = QUnit
module \ES

test 'Array.isArray' (assert)!->
  {isArray} = Array
  assert.isFunction isArray
  assert.arity isArray, 1
  assert.name isArray, \isArray
  assert.looksNative isArray
  assert.nonEnumerable Array, \isArray
  assert.ok not isArray {}
  assert.ok not isArray do -> &
  assert.ok isArray []