{module, test} = QUnit
module \ES

test 'Array#slice' (assert)!->
  {slice} = core.Array
  assert.isFunction slice
  arr = <[1 2 3 4 5]>
  assert.deepEqual slice(arr), arr
  assert.deepEqual slice(arr, 1 3), <[2 3]>
  assert.deepEqual slice(arr, 1 void), <[2 3 4 5]>
  assert.deepEqual slice(arr, 1 -1), <[2 3 4]>
  assert.deepEqual slice(arr, -2 -1), <[4]>
  assert.deepEqual slice(arr, -2 -3), []
  str = \12345
  assert.deepEqual slice(str), arr
  assert.deepEqual slice(str, 1 3), <[2 3]>
  assert.deepEqual slice(str, 1 void), <[2 3 4 5]>
  assert.deepEqual slice(str, 1 -1), <[2 3 4]>
  assert.deepEqual slice(str, -2 -1), <[4]>
  assert.deepEqual slice(str, -2 -3), []
  if list = document?body?childNodes
    try assert.strictEqual typeof! slice(list), \Array
    catch => assert.ok no
  if NATIVE and STRICT
    assert.throws (!-> slice null), TypeError
    assert.throws (!-> slice void), TypeError