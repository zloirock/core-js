'use strict'
{module, test} = QUnit
module \ES6

test 'Array#findIndex' (assert)->
  assert.isFunction Array::findIndex
  assert.arity Array::findIndex, 1
  assert.name Array::findIndex, \findIndex
  assert.looksNative Array::findIndex
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