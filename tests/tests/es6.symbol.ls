QUnit.module 'ES6 Symbol'

eq = strictEqual
deq = deepEqual

{defineProperty, getOwnPropertyDescriptor, create} = Object
isFunction = -> typeof! it is \Function
isNative = -> /\[native code\]\s*\}\s*$/.test it

descriptors = isNative defineProperty

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
test '.pure' !->
  {pure} = Symbol
  ok isFunction(pure), 'Is function'
  if isNative Symbol
    ok typeof pure! is \symbol, 'Symbol.pure() return symbol'
  else ok typeof pure! is \string, 'Symbol.pure() return string'
  ok pure(\S) isnt pure(\S), 'Symbol.pure(key) != Symbol.pure(key)'
test '.set' !->
  {set} = Symbol
  ok isFunction(set), 'Is function'
  O = {}
  sym = Symbol!
  ok set(O, sym, 42) is O, 'Symbol.set return object'
  ok O[sym] is 42, 'Symbol.set set value'
  if !isNative(Symbol) && descriptors
    ok getOwnPropertyDescriptor(O, sym).enumerable is false, 'Symbol.set set enumerable: false value'

test 'Object.getOwnPropertySymbols' !->
  {getOwnPropertySymbols, getOwnPropertyNames} = Object
  ok isFunction(getOwnPropertySymbols), 'Is function'
  obj = {q: 1, w: 2, e: 3}
  obj[Symbol()] = 42
  obj[Symbol()] = 43
  deq getOwnPropertyNames(obj), <[q w e]>
  eq getOwnPropertySymbols(obj).length, 2
  foo = obj with {a: 1, s: 2, d: 3}
  foo[Symbol()] = 44
  deq getOwnPropertyNames(foo), <[a s d]>
  eq getOwnPropertySymbols(foo).length, 1

if descriptors => for key in <[Array RegExp Map Set WeakMap WeakSet Promise]> 
  test "#key@@species" !->
    eq G[key][Symbol.species], G[key], "#key@@species === #key"
    C = Object.create G[key]
    eq C[Symbol.species], C, "#key sub"