{module, test} = QUnit
module \ES5

test 'Array.isArray' (assert)->
  {isArray} = core.Array
  assert.isFunction isArray
  assert.ok not isArray {}
  assert.ok not isArray do -> &
  assert.ok isArray []