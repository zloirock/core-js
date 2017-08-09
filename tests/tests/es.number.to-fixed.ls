{module, test} = QUnit
module \ES

test 'Number#toFixed' (assert)!->
  {toFixed} = Number::
  assert.isFunction toFixed
  assert.name toFixed, \toFixed
  assert.arity toFixed, 1
  assert.looksNative toFixed
  assert.nonEnumerable Number::, \toFixed
  assert.same 0.00008.toFixed(3), '0.000'
  assert.same 0.9.toFixed(0), '1'
  assert.same 1.255.toFixed(2), '1.25'
  assert.same 1843654265.0774949.toFixed(5), '1843654265.07749'
  assert.same 1000000000000000128.toFixed(0), '1000000000000000128'
  assert.same toFixed.call(1), '1'
  assert.same toFixed.call(1 0), '1'
  assert.same toFixed.call(1 1), '1.0'
  assert.same toFixed.call(1 1.1), '1.0'
  assert.same toFixed.call(1 0.9), '1'
  assert.same toFixed.call(1 '0'), '1'
  assert.same toFixed.call(1 '1'), '1.0'
  assert.same toFixed.call(1 '1.1'), '1.0'
  assert.same toFixed.call(1 '0.9'), '1'
  assert.same toFixed.call(1 NaN), '1'
  assert.same toFixed.call(1 'some string'), '1'
  assert.same (try toFixed.call 1 -0.1), '1'
  assert.same new Number(1).toFixed!, '1'
  assert.same new Number(1).toFixed(0), '1'
  assert.same new Number(1).toFixed(1), '1.0'
  assert.same new Number(1).toFixed(1.1), '1.0'
  assert.same new Number(1).toFixed(0.9), '1'
  assert.same new Number(1).toFixed('0'), '1'
  assert.same new Number(1).toFixed('1'), '1.0'
  assert.same new Number(1).toFixed('1.1'), '1.0'
  assert.same new Number(1).toFixed('0.9'), '1'
  assert.same new Number(1).toFixed(NaN), '1'
  assert.same new Number(1).toFixed('some string'), '1'
  assert.same (try new Number(1).toFixed -0.1), '1'
  assert.same NaN.toFixed!, 'NaN'
  assert.same NaN.toFixed(0), 'NaN'
  assert.same NaN.toFixed(1), 'NaN'
  assert.same NaN.toFixed(1.1), 'NaN'
  assert.same NaN.toFixed(0.9), 'NaN'
  assert.same NaN.toFixed('0'), 'NaN'
  assert.same NaN.toFixed('1'), 'NaN'
  assert.same NaN.toFixed('1.1'), 'NaN'
  assert.same NaN.toFixed('0.9'), 'NaN'
  assert.same NaN.toFixed(NaN), 'NaN'
  assert.same NaN.toFixed('some string'), 'NaN'
  assert.same (try NaN.toFixed -0.1), 'NaN'
  assert.same new Number(1e21).toFixed!, String 1e21
  assert.same new Number(1e21).toFixed(0), String 1e21
  assert.same new Number(1e21).toFixed(1), String 1e21
  assert.same new Number(1e21).toFixed(1.1), String 1e21
  assert.same new Number(1e21).toFixed(0.9), String 1e21
  assert.same new Number(1e21).toFixed('0'), String 1e21
  assert.same new Number(1e21).toFixed('1'), String 1e21
  assert.same new Number(1e21).toFixed('1.1'), String 1e21
  assert.same new Number(1e21).toFixed('0.9'), String 1e21
  assert.same new Number(1e21).toFixed(NaN), String 1e21
  assert.same new Number(1e21).toFixed('some string'), String 1e21
  assert.same (try new Number(1e21).toFixed -0.1), String 1e21
  assert.throws (!-> 1.0.toFixed -101), RangeError, 'If f < 0 or f > 20, throw a RangeError exception.'
  assert.throws (!-> 1.0.toFixed 101), RangeError, 'If f < 0 or f > 20, throw a RangeError exception.'
  assert.throws (!-> NaN.toFixed Infinity), RangeError, 'If f < 0 or f > 20, throw a RangeError exception.'
  assert.throws (!-> toFixed.call {}, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed.call \123, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed.call no, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed.call null, 1), TypeError, '? thisNumberValue(this value)'
  assert.throws (!-> toFixed.call void, 1), TypeError, '? thisNumberValue(this value)'