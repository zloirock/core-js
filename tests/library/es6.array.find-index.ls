'use strict'
{module, test} = QUnit
module \ES6

test 'Array#findIndex' (assert)->
  {findIndex} = core.Array
  assert.ok typeof! findIndex is \Function, 'Is function'
  findIndex arr = [1], (val, key, that)->
    assert.strictEqual @, ctx
    assert.strictEqual val, 1
    assert.strictEqual key, 0
    assert.strictEqual that, arr
  , ctx = {}
  assert.strictEqual findIndex([1 3 NaN, 42 {}], (is 42)), 3
  if !(-> @)!
    assert.throws (-> findIndex null, 0), TypeError
    assert.throws (-> findIndex void, 0), TypeError