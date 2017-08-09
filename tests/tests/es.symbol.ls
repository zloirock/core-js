{module, test} = QUnit
module \ES

{defineProperty, getOwnPropertyDescriptor, create} = Object

test 'Symbol' (assert)!->
  assert.isFunction Symbol
  NATIVE and assert.strictEqual Symbol.length, 0 'arity is 0' # fails in most engines
  assert.name Symbol, \Symbol
  assert.looksNative Symbol
  s1 = Symbol 'foo'
  s2 = Symbol 'foo'
  assert.ok s1 isnt s2, 'Symbol("foo") !== Symbol("foo")'
  O = {}
  O[s1] = 42
  assert.ok O[s1] is 42, 'Symbol() work as key'
  assert.ok O[s2] isnt 42, 'Various symbols from one description are various keys'
  if DESCRIPTORS
    count = 0
    for i of O => count++
    assert.ok count is 0, 'object[Symbol()] is not enumerable'

test 'Well-known Symbols' (assert)!->
  for <[hasInstance isConcatSpreadable iterator match replace search species split toPrimitive toStringTag unscopables]>
    assert.ok .. of Symbol, "Symbol.#{..} available"
    assert.nonEnumerable Symbol, ..
    assert.ok Object(Symbol[..]) instanceof Symbol, "Symbol.#{..} is symbol"
    if DESCRIPTORS
      desc = getOwnPropertyDescriptor Symbol, ..
      assert.ok !desc.enumerble, 'non-enumerable'
      assert.ok !desc.writable, 'non-writable'
      assert.ok !desc.configurable, 'non-configurable'


test 'Global symbol registry' (assert)!->
  assert.isFunction Symbol.for, 'Symbol.for is function'
  assert.nonEnumerable Symbol, \for
  assert.strictEqual Symbol.for.length, 1 'Symbol.for arity is 1'
  NATIVE and assert.strictEqual Symbol.for.name, \for, 'Symbol.for.name is "for"' # can't be polyfilled in some environments
  assert.ok /native code/.test(Symbol.for), 'Symbol.for looks like native'
  assert.isFunction Symbol.keyFor, 'Symbol.keyFor is function'
  assert.nonEnumerable Symbol, \keyFor
  assert.strictEqual Symbol.keyFor.length, 1 'Symbol.keyFor arity is 1'
  assert.strictEqual Symbol.keyFor.name, \keyFor, 'Symbol.keyFor.name is "keyFor"'
  assert.ok /native code/.test(Symbol.keyFor), 'Symbol.keyFor looks like native'
  symbol = Symbol.for \foo
  assert.strictEqual Symbol.for(\foo), symbol
  assert.strictEqual Symbol.keyFor(symbol), \foo
  assert.throws (!-> Symbol.keyFor \foo), 'throws on non-symbol'
  
test 'Symbol#@@toPrimitive' (assert)!->
  assert.isFunction Symbol::[Symbol.toPrimitive]
  S = Symbol!
  assert.same S, S[Symbol.toPrimitive]!, \works

test 'Symbol#@@toStringTag' (assert)!->
  assert.ok Symbol::[Symbol.toStringTag] is \Symbol, 'Symbol::@@toStringTag is `Symbol`'

test 'Object.getOwnPropertySymbols' (assert)!->
  {getOwnPropertySymbols, getOwnPropertyNames} = Object
  assert.isFunction getOwnPropertySymbols
  assert.nonEnumerable Object, \getOwnPropertySymbols
  assert.strictEqual getOwnPropertySymbols.length, 1 'arity is 1'
  assert.name getOwnPropertySymbols, \getOwnPropertySymbols
  assert.looksNative getOwnPropertySymbols
  obj = {q: 1, w: 2, e: 3}
  obj[Symbol()] = 42
  obj[Symbol()] = 43
  assert.deepEqual getOwnPropertyNames(obj)sort!, <[e q w]>
  assert.strictEqual getOwnPropertySymbols(obj).length, 2
  foo = obj with {a: 1, s: 2, d: 3}
  foo[Symbol()] = 44
  assert.deepEqual getOwnPropertyNames(foo)sort!, <[a d s]>
  assert.strictEqual getOwnPropertySymbols(foo).length, 1
  assert.strictEqual getOwnPropertySymbols(Object::).length, 0

if JSON?
  test 'Symbols & JSON.stringify' (assert)!->
    assert.strictEqual JSON.stringify([1, Symbol(\foo), no, Symbol(\bar), {}]), '[1,null,false,null,{}]', 'array value'
    assert.strictEqual JSON.stringify({foo: Symbol \foo}), '{}', 'object value'
    if DESCRIPTORS => assert.strictEqual JSON.stringify({(Symbol(\foo)): 1, bar: 2}), '{"bar":2}', 'object key'
    assert.strictEqual JSON.stringify(Symbol \foo), void, 'symbol value'
    if typeof Symbol! is \symbol => assert.strictEqual JSON.stringify(Object Symbol \foo), '{}', 'boxed symbol'

if DESCRIPTORS
  test 'Symbols & descriptors' (assert)!->
    {create, defineProperty, getOwnPropertyDescriptor, keys, getOwnPropertyNames, getOwnPropertySymbols} = Object
    d = Symbol \d
    e = Symbol \e
    f = Symbol \f
    i = Symbol \i
    j = Symbol \j
    proto = {g: \g, (i): \i}
    defineProperty proto, \h, value: \h
    defineProperty proto, \j, value: \j
    O = create proto
    O.a = \a
    O[d] = \d
    defineProperty O, \b, value: \b
    defineProperty O, \c, value: \c, enumerable: on
    defineProperty O, e, configurable: on, writable:on, value: \e
    desc = value: \f, enumerable: on
    defineProperty O, f, desc
    assert.strictEqual desc.enumerable, on, 'defineProperty not changes descriptor object'
    assert.deepEqual getOwnPropertyDescriptor(O, \a), {configurable: on, writable:on, enumerable: on, value: \a}, 'getOwnPropertyDescriptor a'
    assert.deepEqual getOwnPropertyDescriptor(O, \b), {configurable: no, writable:no, enumerable: no, value: \b}, 'getOwnPropertyDescriptor b'
    assert.deepEqual getOwnPropertyDescriptor(O, \c), {configurable: no, writable:no, enumerable: on, value: \c}, 'getOwnPropertyDescriptor c'
    assert.deepEqual getOwnPropertyDescriptor(O, d), {configurable: on, writable:on, enumerable: on, value: \d}, 'getOwnPropertyDescriptor d'
    assert.deepEqual getOwnPropertyDescriptor(O, e), {configurable: on, writable:on, enumerable: no, value: \e}, 'getOwnPropertyDescriptor e'
    assert.deepEqual getOwnPropertyDescriptor(O, f), {configurable: no, writable:no, enumerable: on, value: \f}, 'getOwnPropertyDescriptor f'
    assert.strictEqual getOwnPropertyDescriptor(O, \g), void, 'getOwnPropertyDescriptor g'
    assert.strictEqual getOwnPropertyDescriptor(O, \h), void, 'getOwnPropertyDescriptor h'
    assert.strictEqual getOwnPropertyDescriptor(O, i), void, 'getOwnPropertyDescriptor i'
    assert.strictEqual getOwnPropertyDescriptor(O, j), void, 'getOwnPropertyDescriptor j'
    assert.strictEqual getOwnPropertyDescriptor(O, \k), void, 'getOwnPropertyDescriptor k'
    assert.strictEqual getOwnPropertyDescriptor(Object::, \toString).enumerable, no, 'getOwnPropertyDescriptor on Object.prototype'
    assert.strictEqual getOwnPropertyDescriptor(Object::, d), void, 'getOwnPropertyDescriptor on Object.prototype missed symbol'
    assert.strictEqual O.propertyIsEnumerable(\a), on, 'propertyIsEnumerable a'
    assert.strictEqual O.propertyIsEnumerable(\b), no, 'propertyIsEnumerable b'
    assert.strictEqual O.propertyIsEnumerable(\c), on, 'propertyIsEnumerable c'
    assert.strictEqual O.propertyIsEnumerable(d), on, 'propertyIsEnumerable d'
    assert.strictEqual O.propertyIsEnumerable(e), no, 'propertyIsEnumerable e'
    assert.strictEqual O.propertyIsEnumerable(f), on, 'propertyIsEnumerable f'
    assert.strictEqual O.propertyIsEnumerable(\g), no, 'propertyIsEnumerable g'
    assert.strictEqual O.propertyIsEnumerable(\h), no, 'propertyIsEnumerable h'
    assert.strictEqual O.propertyIsEnumerable(i), no, 'propertyIsEnumerable i'
    assert.strictEqual O.propertyIsEnumerable(j), no, 'propertyIsEnumerable j'
    assert.strictEqual O.propertyIsEnumerable(\k), no, 'propertyIsEnumerable k'
    assert.strictEqual Object::propertyIsEnumerable(\toString), no, 'propertyIsEnumerable on Object.prototype'
    assert.strictEqual Object::propertyIsEnumerable(d), no, 'propertyIsEnumerable on Object.prototype missed symbol'
    assert.strictEqual keys(O).length, 2, 'Object.keys'
    assert.strictEqual getOwnPropertyNames(O).length, 3, 'Object.getOwnPropertyNames'
    assert.strictEqual getOwnPropertySymbols(O).length, 3, 'Object.getOwnPropertySymbols'
    Reflect?ownKeys and assert.strictEqual Reflect.ownKeys(O).length, 6, 'Reflect.ownKeys'
    delete O[e]
    O[e] = \e
    assert.deepEqual getOwnPropertyDescriptor(O, e), {configurable: on, writable:on, enumerable: on, value: \e}, 'redefined non-enum key'

  test 'Symbols & Object.defineProperties' (assert)!->
    {defineProperty, defineProperties} = Object
    c = Symbol \c
    d = Symbol \d
    D = {
      a: value: \a
      (c): value: \c
    }
    defineProperty D, \b, value: value: \b
    defineProperty D, d, value: value: \d
    O = defineProperties {}, D
    assert.strictEqual O.a, \a, \a
    assert.strictEqual O.b, void, \b
    assert.strictEqual O[c], \c, \c
    assert.strictEqual O[d], void, \d

  test 'Symbols & Object.create' (assert)!->
    {defineProperty, create} = Object
    c = Symbol \c
    d = Symbol \d
    D = {
      a: value: \a
      (c): value: \c
    }
    defineProperty D, \b, value: value: \b
    defineProperty D, d, value: value: \d
    O = create null, D
    assert.strictEqual O.a, \a, \a
    assert.strictEqual O.b, void, \b
    assert.strictEqual O[c], \c, \c
    assert.strictEqual O[d], void, \d

  for $key in <[Array RegExp Map Set Promise]> 
    let key = $key => test "#key@@species" (assert)!->
      assert.strictEqual global[key][Symbol.species], global[key], "#key@@species === #key"
      C = Object.create global[key]
      assert.strictEqual C[Symbol.species], C, "#key sub"