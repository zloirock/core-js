'use strict'
{module, test} = QUnit
module \ES7

test 'Array#includes' (assert)->
  assert.ok typeof! Array::includes is \Function, 'is function'
  assert.strictEqual Array::includes.name, \includes, 'name is "includes"'
  assert.strictEqual Array::includes.length, 1, 'arity is 1'
  assert.ok /native code/.test(Array::includes), 'looks like native'
  arr = [1 2 3 -0 o = {}]
  assert.ok arr.includes 1
  assert.ok arr.includes -0
  assert.ok arr.includes 0
  assert.ok arr.includes o
  assert.ok !arr.includes 4
  assert.ok !arr.includes -0.5
  assert.ok !arr.includes {}
  assert.ok Array(1)includes void
  assert.ok [NaN].includes(NaN)
  if !(-> @)!
    assert.throws (-> Array::includes.call null, 0), TypeError
    assert.throws (-> Array::includes.call void, 0), TypeError
  assert.ok \includes of Array::[Symbol.unscopables], 'In Array#@@unscopables'