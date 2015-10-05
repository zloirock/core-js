'use strict'
{module, test} = QUnit
module \ES6

test 'Array#fill' (assert)->
  assert.isFunction Array::fill
  assert.arity Array::fill, 1
  assert.name Array::fill, \fill
  assert.looksNative Array::fill
  assert.strictEqual (a = Array(5)fill(5)), a
  assert.deepEqual Array(5)fill(5), [5 5 5 5 5]
  assert.deepEqual Array(5)fill(5 1), [void 5 5 5 5]
  assert.deepEqual Array(5)fill(5 1 4), [void 5 5 5 void]
  assert.deepEqual Array(5)fill(5 6 1), [void void void void void]
  assert.deepEqual Array(5)fill(5 -3 4), [void void 5 5 void]
  if !(-> @)!
    assert.throws (-> Array::fill.call null, 0), TypeError
    assert.throws (-> Array::fill.call void, 0), TypeError
  assert.ok \fill of Array::[Symbol.unscopables], 'In Array#@@unscopables'