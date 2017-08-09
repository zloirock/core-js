{module, test} = QUnit
module \ES

test 'Array#slice' (assert)!->
  assert.isFunction Array::slice
  assert.arity Array::slice, 2
  assert.name Array::slice, \slice
  assert.looksNative Array::slice
  assert.nonEnumerable Array::, \slice
  arr = <[1 2 3 4 5]>
  assert.deepEqual arr.slice!, arr
  assert.deepEqual arr.slice(1 3), <[2 3]>
  assert.deepEqual arr.slice(1 void), <[2 3 4 5]>
  assert.deepEqual arr.slice(1 -1), <[2 3 4]>
  assert.deepEqual arr.slice(-2 -1), <[4]>
  assert.deepEqual arr.slice(-2 -3), []
  str = \12345
  assert.deepEqual Array::slice.call(str), arr
  assert.deepEqual Array::slice.call(str, 1 3), <[2 3]>
  assert.deepEqual Array::slice.call(str, 1 void), <[2 3 4 5]>
  assert.deepEqual Array::slice.call(str, 1 -1), <[2 3 4]>
  assert.deepEqual Array::slice.call(str, -2 -1), <[4]>
  assert.deepEqual Array::slice.call(str, -2 -3), []
  if list = document?body?childNodes
    try assert.strictEqual typeof! Array::slice.call(list), \Array
    catch => assert.ok no
  if NATIVE
    if STRICT
      assert.throws (!-> Array::slice.call null), TypeError
      assert.throws (!-> Array::slice.call void), TypeError
    assert.deepEqual Array::slice.call({length: -1, 0: 1}, 0, 1), [], 'uses ToLength'