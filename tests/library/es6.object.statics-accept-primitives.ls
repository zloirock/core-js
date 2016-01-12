{module, test} = QUnit
module \ES6

test 'Object static methods accept primitives' (assert)->
  for method in <[getOwnPropertyDescriptor getPrototypeOf keys getOwnPropertyNames]>
    for value in [42 \foo no]
      assert.ok (try => core.Object[method] value; on), "Object.#method accept #{typeof! value}"
    for value in [null void]
      assert.throws (-> core.Object[method] value), TypeError, "Object.#method assert.throws on #value"
  assert.strictEqual core.Object.getPrototypeOf(\foo), String::