{module, test} = QUnit
module \ES6

{seal, freeze, preventExtensions, keys, getOwnPropertyNames, getOwnPropertySymbols} = Object

test 'Object static methods accept primitives' (assert)->
  for method in <[freeze seal preventExtensions getOwnPropertyDescriptor getPrototypeOf isExtensible isSealed isFrozen keys getOwnPropertyNames]>
    assert.ok /native code/.test(Object[method]), "Object.#method looks like native"
    for value in [42 \foo no]
      assert.ok (try => Object[method] value; on), "Object.#method accept #{typeof! value}"
  for method in <[freeze seal preventExtensions]>
    for value in [42 \foo no null void, {}]
      assert.strictEqual Object[method](value), value, "Object.#method returns target on #{typeof! value}"
  for method in <[isSealed isFrozen]>
    for value in [42 \foo no null void]
      assert.strictEqual Object[method](value), on, "Object.#method returns true on #{typeof! value}"
  for value in [42 \foo no null void]
    assert.strictEqual Object.isExtensible(value), no, "Object.isExtensible returns false on #{typeof! value}"
  for method in <[getOwnPropertyDescriptor getPrototypeOf keys getOwnPropertyNames]>
    for value in [null void]
      assert.throws (-> Object[method] value), TypeError, "Object.#method assert.throws on #value"
  assert.strictEqual Object.getPrototypeOf(\foo), String::

test 'Object.seal' (assert)!->
  assert.arrayEqual [key for key of seal {}], []
  assert.arrayEqual keys(seal {}), []
  assert.arrayEqual getOwnPropertyNames(seal {}), []
  assert.arrayEqual getOwnPropertySymbols(seal {}), []
  assert.arrayEqual Reflect.ownKeys(seal {}), []

test 'Object.freeze' (assert)!->
  assert.arrayEqual [key for key of freeze {}], []
  assert.arrayEqual keys(freeze {}), []
  assert.arrayEqual getOwnPropertyNames(freeze {}), []
  assert.arrayEqual getOwnPropertySymbols(freeze {}), []
  assert.arrayEqual Reflect.ownKeys(freeze {}), []

test 'Object.preventExtensions' (assert)!->
  assert.arrayEqual [key for key of preventExtensions {}], []
  assert.arrayEqual keys(preventExtensions {}), []
  assert.arrayEqual getOwnPropertyNames(preventExtensions {}), []
  assert.arrayEqual getOwnPropertySymbols(preventExtensions {}), []
  assert.arrayEqual Reflect.ownKeys(preventExtensions {}), []