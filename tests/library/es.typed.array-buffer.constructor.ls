{module, test} = QUnit
module \ES
test \ArrayBuffer, (assert)!->
  {ArrayBuffer} = core
  assert.same ArrayBuffer, Object(ArrayBuffer), 'is object' # in Safari 5 typeof ArrayBuffer is 'object'
  b = new ArrayBuffer 123
  assert.same b.byteLength, 123, \length
  assert.throws (!-> new ArrayBuffer -1), RangeError, 'negative length' # fails in Safari
  assert.ok (try new ArrayBuffer 0.5), 'fractional length'
  assert.ok (try new ArrayBuffer!), 'missed length'
  DESCRIPTORS and assert.same ArrayBuffer[core.Symbol?species], ArrayBuffer, '@@species'