{module, test} = QUnit
module \ES

test 'Number#toPrecision' (assert)!->
  {toPrecision} = Number::
  assert.isFunction toPrecision
  assert.name toPrecision, \toPrecision
  assert.arity toPrecision, 1
  assert.looksNative toPrecision
  assert.nonEnumerable Number::, \toPrecision
  assert.same 0.00008.toPrecision(3), '0.0000800', '0.00008.toPrecision(3)'
  assert.same 1.255.toPrecision(2), '1.3', '1.255.toPrecision(2)'
  assert.same 1843654265.0774949.toPrecision(13), '1843654265.077', '1843654265.0774949.toPrecision(13)'
  assert.same NaN.toPrecision(1), 'NaN', 'If x is NaN, return the String "NaN".'
  assert.same 123.456.toPrecision!, '123.456', 'If precision is undefined, return ! ToString(x).'
  assert.same 123.456.toPrecision(void), '123.456', 'If precision is undefined, return ! ToString(x).'
  assert.throws (!-> 0.9.toPrecision 0), RangeError, 'If p < 1 or p > 21, throw a RangeError exception.'
  assert.throws (!-> 0.9.toPrecision 101), RangeError, 'If p < 1 or p > 21, throw a RangeError exception.'
  assert.throws (!-> toPrecision.call {}, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toPrecision.call \123, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toPrecision.call no, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toPrecision.call null, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toPrecision.call void, 1), TypeError, '? thisNumberValue(this value)'