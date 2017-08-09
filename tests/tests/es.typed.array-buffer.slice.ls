{module, test} = QUnit
module \ES
test 'ArrayBuffer#slice' (assert)!->
  assert.isFunction ArrayBuffer::slice
  assert.arity ArrayBuffer::slice, 2
  assert.name ArrayBuffer::slice, \slice
  assert.looksNative ArrayBuffer::slice
  buffer = arrayToBuffer [1 2 3 4 5]
  assert.ok buffer instanceof ArrayBuffer, 'correct buffer'
  assert.ok buffer.slice! isnt buffer, 'returns new buffer'
  assert.ok buffer.slice! instanceof ArrayBuffer, 'correct instance'
  assert.arrayEqual bufferToArray(buffer.slice!), [1 2 3 4 5]
  assert.arrayEqual bufferToArray(buffer.slice 1 3), [2 3]
  assert.arrayEqual bufferToArray(buffer.slice 1 void), [2 3 4 5] # FF buggy here
  assert.arrayEqual bufferToArray(buffer.slice 1 -1), [2 3 4]
  assert.arrayEqual bufferToArray(buffer.slice -2 -1), [4]
  assert.arrayEqual bufferToArray(buffer.slice -2 -3), []