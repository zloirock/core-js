'use strict'
{module, test} = QUnit
module \ES6

test 'Array#fill' (assert)->
  {fill} = core.Array
  assert.ok typeof! fill is \Function, 'Is function'
  assert.strictEqual (a = fill Array(5), 5), a
  assert.deepEqual fill(Array(5), 5), [5 5 5 5 5]
  assert.deepEqual fill(Array(5), 5 1), [void 5 5 5 5]
  assert.deepEqual fill(Array(5), 5 1 4), [void 5 5 5 void]
  assert.deepEqual fill(Array(5), 5 6 1), [void void void void void]
  assert.deepEqual fill(Array(5), 5 -3 4), [void void 5 5 void]
  if !(-> @)!
    assert.throws (-> fill null, 0), TypeError
    assert.throws (-> fill void, 0), TypeError