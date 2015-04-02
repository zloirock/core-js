QUnit.module 'ES6 Object static methods accept primitives'

eq = strictEqual

test '*' !->
  for method in <[freeze seal preventExtensions getOwnPropertyDescriptor getPrototypeOf isExtensible isSealed isFrozen keys getOwnPropertyNames]>
    for value in [42 \foo no]
      ok (try => core.Object[method] value; on), "Object.#method accept #{typeof! value}"
  for method in <[freeze seal preventExtensions]>
    for value in [42 \foo no null void, {}]
      eq core.Object[method](value), value, "Object.#method returns target on #{typeof! value}"
  for method in <[isSealed isFrozen]>
    for value in [42 \foo no null void]
      eq core.Object[method](value), on, "Object.#method returns true on #{typeof! value}"
  for value in [42 \foo no null void]
    eq core.Object.isExtensible(value), no, "Object.isExtensible returns false on #{typeof! value}"
  for method in <[getOwnPropertyDescriptor getPrototypeOf keys getOwnPropertyNames]>
    for value in [null void]
      throws (-> core.Object[method] value), TypeError, "Object.#method throws on #value"
  eq core.Object.getPrototypeOf(\foo), String::