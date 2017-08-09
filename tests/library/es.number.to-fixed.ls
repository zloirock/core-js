{module, test} = QUnit
module \ES

test 'Number#toFixed' (assert)!->
  {toFixed} = core.Number
  assert.isFunction toFixed
  assert.same toFixed(0.00008 3), '0.000'
  assert.same toFixed(0.9 0), '1'
  assert.same toFixed(1.255 2), '1.25'
  assert.same toFixed(1843654265.0774949 5), '1843654265.07749'
  assert.same toFixed(1000000000000000128 0), '1000000000000000128'
  assert.same toFixed(1), '1'
  assert.same toFixed(1 0), '1'
  assert.same toFixed(1 1), '1.0'
  assert.same toFixed(1 1.1), '1.0'
  assert.same toFixed(1 0.9), '1'
  assert.same toFixed(1 '0'), '1'
  assert.same toFixed(1 '1'), '1.0'
  assert.same toFixed(1 '1.1'), '1.0'
  assert.same toFixed(1 '0.9'), '1'
  assert.same toFixed(1 NaN), '1'
  assert.same toFixed(1 'some string'), '1'
  assert.same (try toFixed 1 -0.1), '1'
  assert.same toFixed(Object(1)), '1'
  assert.same toFixed(Object(1), 0), '1'
  assert.same toFixed(Object(1), 1), '1.0'
  assert.same toFixed(Object(1), 1.1), '1.0'
  assert.same toFixed(Object(1), 0.9), '1'
  assert.same toFixed(Object(1), '0'), '1'
  assert.same toFixed(Object(1), '1'), '1.0'
  assert.same toFixed(Object(1), '1.1'), '1.0'
  assert.same toFixed(Object(1), '0.9'), '1'
  assert.same toFixed(Object(1), NaN), '1'
  assert.same toFixed(Object(1), 'some string'), '1'
  assert.same (try toFixed Object(1), -0.1), '1'
  assert.same toFixed(NaN), 'NaN'
  assert.same toFixed(NaN, 0), 'NaN'
  assert.same toFixed(NaN, 1), 'NaN'
  assert.same toFixed(NaN, 1.1), 'NaN'
  assert.same toFixed(NaN, 0.9), 'NaN'
  assert.same toFixed(NaN, '0'), 'NaN'
  assert.same toFixed(NaN, '1'), 'NaN'
  assert.same toFixed(NaN, '1.1'), 'NaN'
  assert.same toFixed(NaN, '0.9'), 'NaN'
  assert.same toFixed(NaN, NaN), 'NaN'
  assert.same toFixed(NaN, 'some string'), 'NaN'
  assert.same (try toFixed NaN, -0.1), 'NaN'
  assert.same toFixed(1e21), String 1e21
  assert.same toFixed(1e21 0), String 1e21
  assert.same toFixed(1e21 1), String 1e21
  assert.same toFixed(1e21 1.1), String 1e21
  assert.same toFixed(1e21 0.9), String 1e21
  assert.same toFixed(1e21 '0'), String 1e21
  assert.same toFixed(1e21 '1'), String 1e21
  assert.same toFixed(1e21 '1.1'), String 1e21
  assert.same toFixed(1e21 '0.9'), String 1e21
  assert.same toFixed(1e21 NaN), String 1e21
  assert.same toFixed(1e21 'some string'), String 1e21
  assert.same (try toFixed 1e21 -0.1), String 1e21
  assert.throws (!-> toFixed 1 -101), RangeError, 'If f < 0 or f > 20, throw a RangeError exception.'
  assert.throws (!-> toFixed 1 101), RangeError, 'If f < 0 or f > 20, throw a RangeError exception.'
  assert.throws (!-> toFixed NaN, Infinity), RangeError, 'If f < 0 or f > 20, throw a RangeError exception.'
  assert.throws (!-> toFixed {}, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed \123, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed no, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed null, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed void, 1), TypeError, '? thisNumberValue(this value)'