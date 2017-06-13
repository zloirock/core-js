{module, test} = QUnit
module \ES6
test \ArrayBuffer, (assert)!->
  {ArrayBuffer} = core
  assert.same ArrayBuffer, Object(ArrayBuffer), 'is object' # in Safari 5 typeof ArrayBuffer is 'object'
  b = new ArrayBuffer 123
  assert.same b.byteLength, 123, \length
  assert.same (new ArrayBuffer!).byteLength, 0, 'length defaults to 0'
  assert.same (new ArrayBuffer 2.7).byteLength, 2, 'fractional length is rounded'
  assert.throws (!-> new ArrayBuffer -1), RangeError, 'negative length'
  assert.throws (!-> new ArrayBuffer(core.Number.MAX_SAFE_INTEGER + 1)), RangeError, 'absurd length'
  DESCRIPTORS and assert.same ArrayBuffer[core.Symbol?species], ArrayBuffer, '@@species'