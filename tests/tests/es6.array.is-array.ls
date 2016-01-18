{module, test} = QUnit
module \ES6

test 'Array.isArray' (assert)!->
  {isArray} = Array
  assert.isFunction isArray
  assert.ok not isArray {}
  assert.ok not isArray do -> &
  assert.ok isArray []