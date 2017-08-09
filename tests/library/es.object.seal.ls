{module, test} = QUnit
module \ES

test 'Object.seal' (assert)!->
  {seal, keys, getOwnPropertyNames, getOwnPropertySymbols} = core.Object
  {ownKeys} = core.Reflect
  assert.isFunction seal
  assert.arity seal, 1
  for value in [42 \foo no null void, {}]
    assert.ok (try => seal value; on), "accept #{typeof! value}"
    assert.same seal(value), value, "returns target on #{typeof! value}"
  assert.arrayEqual [key for key of seal {}], []
  assert.arrayEqual keys(seal {}), []
  assert.arrayEqual getOwnPropertyNames(seal {}), []
  assert.arrayEqual getOwnPropertySymbols(seal {}), []
  assert.arrayEqual ownKeys(seal {}), []