{module, test} = QUnit
module \ES
test 'ArrayBuffer#slice' (assert)!->
  {ArrayBuffer} = core
  {slice} = ArrayBuffer
  assert.isFunction slice
  buffer = arrayToBuffer [1 2 3 4 5]
  assert.ok buffer instanceof ArrayBuffer, 'correct buffer'
  assert.ok slice(buffer) isnt buffer, 'returns new buffer'
  assert.ok slice(buffer) instanceof ArrayBuffer, 'correct instance'
  assert.arrayEqual bufferToArray(slice buffer), [1 2 3 4 5]
  assert.arrayEqual bufferToArray(slice buffer, 1 3), [2 3]
  assert.arrayEqual bufferToArray(slice buffer, 1 void), [2 3 4 5] # FF buggy here
  assert.arrayEqual bufferToArray(slice buffer, 1 -1), [2 3 4]
  assert.arrayEqual bufferToArray(slice buffer, -2 -1), [4]
  assert.arrayEqual bufferToArray(slice buffer, -2 -3), []