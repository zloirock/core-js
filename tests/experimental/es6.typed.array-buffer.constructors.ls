{module, test} = QUnit
module \ES6
DESCRIPTORS and test \ArrayBuffer, !(assert)~>
  assert.isFunction ArrayBuffer
  assert.arity ArrayBuffer, 1
  assert.name ArrayBuffer, \ArrayBuffer
  assert.looksNative ArrayBuffer
  b = new ArrayBuffer 123
  assert.same b.byteLength, 123, \length
  if NATIVE
    assert.throws (!~> new ArrayBuffer -1), RangeError, 'negative length' # fails in Safari
    assert.throws (!~> new ArrayBuffer!), RangeError, 'missed length' # fails in all engines, maybe bug in the spec related https://bugs.ecmascript.org/show_bug.cgi?id=4516
    assert.throws (!~> new ArrayBuffer(Number.MAX_SAFE_INTEGER + 1)), RangeError, 'absurd length'