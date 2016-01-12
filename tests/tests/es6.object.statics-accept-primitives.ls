{module, test} = QUnit
module \ES6

{keys, getOwnPropertyNames, getOwnPropertySymbols} = Object

test 'Object static methods accept primitives' (assert)->
  for method in <[getOwnPropertyDescriptor getPrototypeOf keys getOwnPropertyNames]>
    assert.ok /native code/.test(Object[method]), "Object.#method looks like native"
    for value in [42 \foo no]
      assert.ok (try => Object[method] value; on), "Object.#method accept #{typeof! value}"
    for value in [null void]
      assert.throws (-> Object[method] value), TypeError, "Object.#method assert.throws on #value"
  assert.strictEqual Object.getPrototypeOf(\foo), String::