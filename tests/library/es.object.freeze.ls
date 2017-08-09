{module, test} = QUnit
module \ES

test 'Object.freeze' (assert)!->
  {freeze, keys, getOwnPropertyNames, getOwnPropertySymbols} = core.Object
  {ownKeys} = core.Reflect
  assert.isFunction freeze
  assert.arity freeze, 1
  for value in [42 \foo no null void, {}]
    assert.ok (try => freeze value; on), "accept #{typeof! value}"
    assert.same freeze(value), value, "returns target on #{typeof! value}"
  assert.arrayEqual [key for key of freeze {}], []
  assert.arrayEqual keys(freeze {}), []
  assert.arrayEqual getOwnPropertyNames(freeze {}), []
  assert.arrayEqual getOwnPropertySymbols(freeze {}), []
  assert.arrayEqual ownKeys(freeze {}), []