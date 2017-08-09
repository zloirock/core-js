{module, test} = QUnit
module \ES
test 'ArrayBuffer.isView' (assert)!->
  {isView} = ArrayBuffer
  assert.isFunction isView
  assert.arity isView, 1
  assert.name isView, \isView
  assert.looksNative isView
  for <[Float32Array Float64Array Int8Array Int16Array Int32Array Uint8Array Uint16Array Uint32Array Uint8ClampedArray]>
    if global[..] => assert.same isView(new global[..]([1])), on, "#{..} - true"
  assert.same isView(new DataView new ArrayBuffer 1), on, "DataView - true"
  assert.same isView(new ArrayBuffer 1), no, "ArrayBuffer - false"
  for [void null no on 0 1 '' 'qwe' {}, [], ->]
    assert.same isView(..), no, "#{..} - false"