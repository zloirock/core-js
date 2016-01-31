{module, test} = QUnit
module \ES6

test 'Number#toPrecision' (assert)!->
  {toPrecision} = core.Number
  assert.isFunction toPrecision
  assert.same toPrecision(0.00008 3), '0.0000800'
  assert.same toPrecision(1.255 2), '1.3'
  assert.same toPrecision(1843654265.0774949 13), '1843654265.077'
  assert.same toPrecision(NaN, 1), 'NaN'
  assert.same toPrecision(123.456), '123.456'
  assert.same toPrecision(123.456 void), '123.456'
  assert.throws (!-> toPrecision 0.9 0), RangeError
  assert.throws (!-> toPrecision 0.9 101), RangeError
  assert.throws (-> toPrecision {}, 1), TypeError
  assert.throws (-> toPrecision \123, 1), TypeError
  assert.throws (-> toPrecision no, 1), TypeError
  assert.throws (-> toPrecision null, 1), TypeError
  assert.throws (-> toPrecision void, 1), TypeError