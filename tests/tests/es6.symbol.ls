QUnit.module \ES6

eq = strictEqual
deq = deepEqual

{defineProperty, getOwnPropertyDescriptor, create} = Object
isFunction = -> typeof! it is \Function
isNative = -> /\[native code\]\s*\}\s*$/.test it

descriptors = (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!

G = global? && global || window

test 'Symbol' !->
  ok isFunction(Symbol), 'Is function'
  ok /native code/.test(Symbol), 'looks like native'
  s1 = Symbol 'foo'
  s2 = Symbol 'foo'
  ok s1 isnt s2, 'Symbol("foo") !== Symbol("foo")'
  O = {}
  O[s1] = 42
  ok O[s1] is 42, 'Symbol() work as key'
  ok O[s2] isnt 42, 'Various symbols from one description are various keys'
  if descriptors
    count = 0
    for i of O => count++
    ok count is 0, 'object[Symbol()] is not enumerable'
test 'Well-known Symbols' !->
  for <[hasInstance isConcatSpreadable iterator match replace search species split toPrimitive toStringTag unscopables]>
    ok .. of Symbol, "Symbol.#{..} available"
    ok Object(Symbol[..]) instanceof Symbol, "Symbol.#{..} is symbol"
test 'Global symbol registry' !->
  ok isFunction(Symbol.for), 'Symbol.for is function'
  ok isFunction(Symbol.keyFor), 'Symbol.keyFor is function'
  ok /native code/.test(Symbol.for), 'Symbol.for looks like native'
  ok /native code/.test(Symbol.keyFor), 'Symbol.keyFor looks like native'
  symbol = Symbol.for \foo
  eq Symbol.for(\foo), symbol
  eq Symbol.keyFor(symbol), \foo
  
test 'Symbol#@@toStringTag' !->
  ok Symbol::[Symbol.toStringTag] is \Symbol, 'Symbol::@@toStringTag is `Symbol`'

test 'Object.getOwnPropertySymbols' !->
  {getOwnPropertySymbols, getOwnPropertyNames} = Object
  ok isFunction(getOwnPropertySymbols), 'Is function'
  obj = {q: 1, w: 2, e: 3}
  obj[Symbol()] = 42
  obj[Symbol()] = 43
  deq getOwnPropertyNames(obj)sort!, <[e q w]>
  eq getOwnPropertySymbols(obj).length, 2
  foo = obj with {a: 1, s: 2, d: 3}
  foo[Symbol()] = 44
  deq getOwnPropertyNames(foo)sort!, <[a d s]>
  eq getOwnPropertySymbols(foo).length, 1

if descriptors
  test 'Symbols & descriptors' !->
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
    eq desc.enumerable, on, 'defineProperty not changes descriptor object'
    deq getOwnPropertyDescriptor(O, \a), {configurable: on, writable:on, enumerable: on, value: \a}, 'getOwnPropertyDescriptor a'
    deq getOwnPropertyDescriptor(O, \b), {configurable: no, writable:no, enumerable: no, value: \b}, 'getOwnPropertyDescriptor b'
    deq getOwnPropertyDescriptor(O, \c), {configurable: no, writable:no, enumerable: on, value: \c}, 'getOwnPropertyDescriptor c'
    deq getOwnPropertyDescriptor(O, d), {configurable: on, writable:on, enumerable: on, value: \d}, 'getOwnPropertyDescriptor d'
    deq getOwnPropertyDescriptor(O, e), {configurable: on, writable:on, enumerable: no, value: \e}, 'getOwnPropertyDescriptor e'
    deq getOwnPropertyDescriptor(O, f), {configurable: no, writable:no, enumerable: on, value: \f}, 'getOwnPropertyDescriptor f'
    eq getOwnPropertyDescriptor(O, \g), void, 'getOwnPropertyDescriptor g'
    eq getOwnPropertyDescriptor(O, \h), void, 'getOwnPropertyDescriptor h'
    eq getOwnPropertyDescriptor(O, i), void, 'getOwnPropertyDescriptor i'
    eq getOwnPropertyDescriptor(O, j), void, 'getOwnPropertyDescriptor j'
    eq getOwnPropertyDescriptor(O, \k), void, 'getOwnPropertyDescriptor k'
    eq O.propertyIsEnumerable(\a), on, 'propertyIsEnumerable a'
    eq O.propertyIsEnumerable(\b), no, 'propertyIsEnumerable b'
    eq O.propertyIsEnumerable(\c), on, 'propertyIsEnumerable c'
    eq O.propertyIsEnumerable(d), on, 'propertyIsEnumerable d'
    eq O.propertyIsEnumerable(e), no, 'propertyIsEnumerable e'
    eq O.propertyIsEnumerable(f), on, 'propertyIsEnumerable f'
    eq O.propertyIsEnumerable(\g), no, 'propertyIsEnumerable g'
    eq O.propertyIsEnumerable(\h), no, 'propertyIsEnumerable h'
    eq O.propertyIsEnumerable(i), no, 'propertyIsEnumerable i'
    eq O.propertyIsEnumerable(j), no, 'propertyIsEnumerable j'
    eq O.propertyIsEnumerable(\k), no, 'propertyIsEnumerable k'
    eq keys(O).length, 2, 'Object.keys'
    eq getOwnPropertyNames(O).length, 3, 'Object.getOwnPropertyNames'
    eq getOwnPropertySymbols(O).length, 3, 'Object.getOwnPropertySymbols'
    eq Reflect.ownKeys(O).length, 6, 'Reflect.ownKeys'
    delete O[e]
    O[e] = \e
    deq getOwnPropertyDescriptor(O, e), {configurable: on, writable:on, enumerable: on, value: \e}, 'redefined non-enum key'
  test 'Symbols & Object.defineProperties' !->
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
    eq O.a, \a, \a
    eq O.b, void, \b
    eq O[c], \c, \c
    eq O[d], void, \d
  test 'Symbols & Object.create' !->
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
    eq O.a, \a, \a
    eq O.b, void, \b
    eq O[c], \c, \c
    eq O[d], void, \d

  for key in <[Array RegExp Map Set WeakMap WeakSet Promise]> 
    test "#key@@species" !->
      eq G[key][Symbol.species], G[key], "#key@@species === #key"
      C = Object.create G[key]
      eq C[Symbol.species], C, "#key sub"