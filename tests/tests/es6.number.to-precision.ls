{module, test} = QUnit
module \ES6

test 'Number#toPrecision' (assert)!->
  {toPrecision} = Number::
  assert.isFunction toPrecision
  assert.name toPrecision, \toPrecision
  assert.arity toPrecision, 1
  assert.looksNative toPrecision
  assert.same 0.00008.toPrecision(3), '0.0000800'
  assert.same 1.255.toPrecision(2), '1.3'
  assert.same 1843654265.0774949.toPrecision(13), '1843654265.077'
  assert.same NaN.toPrecision(1), 'NaN'
  assert.same 123.456.toPrecision!, '123.456'
  assert.same 123.456.toPrecision(void), '123.456'
  assert.throws (!-> 0.9.toPrecision 0), RangeError
  assert.throws (!-> 0.9.toPrecision 101), RangeError
  assert.throws (-> toPrecision.call {}, 1), TypeError
  assert.throws (-> toPrecision.call \123, 1), TypeError
  assert.throws (-> toPrecision.call no, 1), TypeError
  assert.throws (-> toPrecision.call null, 1), TypeError
  assert.throws (-> toPrecision.call void, 1), TypeError