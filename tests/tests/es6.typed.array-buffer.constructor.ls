{module, test} = QUnit
module \ES6
test \ArrayBuffer, !(assert)~>
  assert.same ArrayBuffer, Object(ArrayBuffer), 'is object' # in Safari 5 typeof ArrayBuffer is 'object'
  assert.arity ArrayBuffer, 1 # 0 in V8 ~ Chromium 27-
  assert.name ArrayBuffer, \ArrayBuffer # Safari 5 bug
  NATIVE and assert.looksNative ArrayBuffer # Safari 5 bug
  b = new ArrayBuffer 123
  assert.same b.byteLength, 123, \length
  assert.throws (!~> new ArrayBuffer -1), RangeError, 'negative length' # fails in Safari
  assert.throws (!~> new ArrayBuffer 0.5), RangeError, 'fractional length' # fails in most engines
  assert.throws (!~> new ArrayBuffer!), RangeError, 'missed length' # fails in all engines, maybe bug in the spec related https://bugs.ecmascript.org/show_bug.cgi?id=4516
  assert.throws (!~> new ArrayBuffer(Number.MAX_SAFE_INTEGER + 1)), RangeError, 'absurd length'
  DESCRIPTORS and assert.same ArrayBuffer[Symbol?species], ArrayBuffer, '@@species'