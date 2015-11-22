{module, test} = QUnit
module \ES6

test 'Object static methods accept primitives' (assert)->
  for method in <[freeze seal preventExtensions getOwnPropertyDescriptor getPrototypeOf isExtensible isSealed isFrozen keys getOwnPropertyNames]>
    for value in [42 \foo no]
      assert.ok (try => core.Object[method] value; on), "Object.#method accept #{typeof! value}"
  for method in <[freeze seal preventExtensions]>
    for value in [42 \foo no null void, {}]
      assert.strictEqual core.Object[method](value), value, "Object.#method returns target on #{typeof! value}"
  for method in <[isSealed isFrozen]>
    for value in [42 \foo no null void]
      assert.strictEqual core.Object[method](value), on, "Object.#method returns true on #{typeof! value}"
  for value in [42 \foo no null void]
    assert.strictEqual core.Object.isExtensible(value), no, "Object.isExtensible returns false on #{typeof! value}"
  for method in <[getOwnPropertyDescriptor getPrototypeOf keys getOwnPropertyNames]>
    for value in [null void]
      assert.throws (-> core.Object[method] value), TypeError, "Object.#method assert.throws on #value"
  assert.strictEqual core.Object.getPrototypeOf(\foo), String::

test 'Object.seal' (assert)!->
  {seal} = core.Object
  assert.arrayEqual core.Object.getOwnPropertyNames(seal {}), []
  assert.arrayEqual core.Object.getOwnPropertySymbols(seal {}), []

test 'Object.freeze' (assert)!->
  {freeze} = core.Object
  assert.arrayEqual core.Object.getOwnPropertyNames(freeze {}), []
  assert.arrayEqual core.Object.getOwnPropertySymbols(freeze {}), []

test 'Object.preventExtensions' (assert)!->
  {preventExtensions} = core.Object
  assert.arrayEqual core.Object.getOwnPropertyNames(preventExtensions {}), []
  assert.arrayEqual core.Object.getOwnPropertySymbols(preventExtensions {}), []