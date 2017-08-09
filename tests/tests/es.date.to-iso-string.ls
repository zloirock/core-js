{module, test} = QUnit
module \ES

test 'Date#toISOString' (assert)!->
  assert.isFunction Date::toISOString
  assert.arity Date::toISOString, 0
  assert.name Date::toISOString, \toISOString
  assert.looksNative Date::toISOString
  assert.nonEnumerable Date::, \toISOString
  assert.strictEqual new Date(0).toISOString!, '1970-01-01T00:00:00.000Z'
  assert.strictEqual new Date(1e12+1).toISOString!, '2001-09-09T01:46:40.001Z'
  assert.strictEqual new Date(-5e13-1).toISOString!, '0385-07-25T07:06:39.999Z'
  ft = new Date(1e15+1).toISOString!
  assert.ok(ft is '+033658-09-27T01:46:40.001Z' or ft is '33658-09-27T01:46:40.001Z')
  bc = new Date(-1e15+1).toISOString!
  assert.ok(bc is '-029719-04-05T22:13:20.001Z' or bc is '-29719-04-05T22:13:20.001Z')
  assert.throws (!-> new Date(NaN).toISOString!), RangeError