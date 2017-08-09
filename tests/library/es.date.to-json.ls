{module, test} = QUnit
module \ES

test 'Date#toJSON' (assert)!->
  {toJSON, toISOString} = core.Date
  assert.isFunction toJSON
  if Date::toISOString
    d = new Date!
    assert.same toJSON(d), toISOString(d), 'base'
  assert.same toJSON(new Date NaN), null, 'not finite'
  assert.same toJSON(toISOString: -> 42), 42, 'generic'