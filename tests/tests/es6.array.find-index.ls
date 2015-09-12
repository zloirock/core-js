'use strict'
{module, test} = QUnit
module \ES6

test 'Array#findIndex' (assert)->
  assert.ok typeof! Array::findIndex is \Function, 'Is function'
  assert.strictEqual Array::findIndex.length, 1, 'length is 1'
  assert.ok /native code/.test(Array::findIndex), 'looks like native'
  assert.strictEqual Array::findIndex.name, \findIndex, 'name is "findIndex"'
  (arr = [1])findIndex (val, key, that)->
    assert.strictEqual @, ctx
    assert.strictEqual val, 1
    assert.strictEqual key, 0
    assert.strictEqual that, arr
  , ctx = {}
  assert.strictEqual [1 3 NaN, 42 {}]findIndex((is 42)), 3
  if !(-> @)!
    assert.throws (-> Array::findIndex.call null, 0), TypeError
    assert.throws (-> Array::findIndex.call void, 0), TypeError
  assert.ok \findIndex of Array::[Symbol.unscopables], 'In Array#@@unscopables'