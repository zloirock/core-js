{module, test} = QUnit
module \ES6
DESCRIPTORS and test \ArrayBuffer, !(assert)~>
  {ArrayBuffer} = core
  assert.same ArrayBuffer, Object(ArrayBuffer), 'is object' # in Safari 5 typeof ArrayBuffer is 'object'
  b = new ArrayBuffer 123
  assert.same b.byteLength, 123, \length
  assert.throws (!~> new ArrayBuffer -1), RangeError, 'negative length' # fails in Safari
  assert.throws (!~> new ArrayBuffer 0.5), RangeError, 'fractional length' # fails in most engines
  assert.throws (!~> new ArrayBuffer!), RangeError, 'missed length' # fails in all engines, maybe bug in the spec related https://bugs.ecmascript.org/show_bug.cgi?id=4516
  assert.throws (!~> new ArrayBuffer(core.Number.MAX_SAFE_INTEGER + 1)), RangeError, 'absurd length'
  assert.same ArrayBuffer[core.Symbol?species], ArrayBuffer, '@@species'