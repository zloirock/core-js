{module, test} = QUnit
module \ES6

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