{module, test} = QUnit
module \ES

test 'Date#toJSON' (assert)!->
  assert.isFunction Date::toJSON
  assert.arity Date::toJSON, 1
  assert.name Date::toJSON, \toJSON
  assert.looksNative Date::toJSON
  assert.nonEnumerable Date::, \toJSON
  d = new Date!
  assert.same d.toJSON!, d.toISOString!, 'base'
  assert.same new Date(NaN)toJSON!, null, 'not finite'
  assert.same Date::toJSON.call(toISOString: -> 42), 42, 'generic'
