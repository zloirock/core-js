{module, test} = QUnit
module \ES
test \ArrayBuffer (assert)!->
  assert.same ArrayBuffer, Object(ArrayBuffer), 'is object' # in Safari 5 typeof ArrayBuffer is 'object'
  assert.arity ArrayBuffer, 1 # 0 in V8 ~ Chromium 27-
  assert.name ArrayBuffer, \ArrayBuffer # Safari 5 bug
  NATIVE and assert.looksNative ArrayBuffer # Safari 5 bug
  b = new ArrayBuffer 123
  assert.same b.byteLength, 123, \length
  assert.throws (!~> new ArrayBuffer -1), RangeError, 'negative length' # fails in Safari
  assert.ok (try new ArrayBuffer 0.5), 'fractional length'
  assert.ok (try new ArrayBuffer!), 'missed length'
  DESCRIPTORS and assert.same ArrayBuffer[Symbol?species], ArrayBuffer, '@@species'