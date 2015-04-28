QUnit.module 'ES6 Symbol'

eq = strictEqual
deq = deepEqual

{defineProperty, getOwnPropertyDescriptor, create} = Object
isFunction = -> typeof! it is \Function
isNative = -> /\[native code\]\s*\}\s*$/.test it

descriptors = (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!

G = global? && global || window

test 'Symbol' !->
  ok isFunction(Symbol), 'Is function'
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
  symbol = Symbol.for \foo
  eq Symbol.for(\foo), symbol
  eq Symbol.keyFor(symbol), \foo
  
test '#@@toStringTag' !->
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
  test 'Descriptors' !->
    {defineProperty, getOwnPropertyDescriptor} = Object
    d = Symbol \d
    e = Symbol \e
    f = Symbol \f
    O = a: \a, (d): \d
    defineProperty O, \b, value: \b
    defineProperty O, \c, value: \c, enumerable: on
    defineProperty O, e, configurable: on, writable:on, value: \e
    defineProperty O, f, value: \f, enumerable: on
    deq getOwnPropertyDescriptor(O, \a), {configurable: on, writable:on, enumerable: on, value: \a}
    deq getOwnPropertyDescriptor(O, \b), {configurable: no, writable:no, enumerable: no, value: \b}
    deq getOwnPropertyDescriptor(O, \c), {configurable: no, writable:no, enumerable: on, value: \c}
    deq getOwnPropertyDescriptor(O, d), {configurable: on, writable:on, enumerable: on, value: \d}
    deq getOwnPropertyDescriptor(O, e), {configurable: on, writable:on, enumerable: no, value: \e}
    deq getOwnPropertyDescriptor(O, f), {configurable: no, writable:no, enumerable: on, value: \f}
    eq Object.keys(O).length, 2
    eq Object.getOwnPropertyNames(O).length, 3
    eq Object.getOwnPropertySymbols(O).length, 3
    eq Reflect.ownKeys(O).length, 6
    delete O[e]
    O[e] = \e
    deq getOwnPropertyDescriptor(O, e), {configurable: on, writable:on, enumerable: on, value: \e}
  test 'Object.defineProperties' !->
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
  test 'Object.create' !->
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