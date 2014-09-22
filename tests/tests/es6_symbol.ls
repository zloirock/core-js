module 'ES6 Symbol'
{defineProperty, getOwnPropertyDescriptor, create} = Object
isFunction = -> typeof! it is \Function
isNative = -> /\[native code\]\s*\}\s*$/.test it
that = global? && global || window
test 'Symbol' !->
  ok isFunction(that.Symbol), 'Is function'
  s1 = Symbol 'foo'
  s2 = Symbol 'foo'
  ok s1 isnt s2, 'Symbol("foo") !== Symbol("foo")'
  O = {}
  O[s1] = 42
  ok O[s1] is 42, 'Symbol() work as key'
  ok O[s2] isnt 42, 'Various symbols from one description are various keys'
  if isNative defineProperty
    count = 0
    for i of O => count++
    ok count is 0, 'object[Symbol()] is not enumerable'
test '.iterator' !->
  ok \iterator of Symbol, 'iterator in Symbol'
test '.toStringTag' !->
  ok \toStringTag of Symbol, 'toStringTag in Symbol'
test '::@@toStringTag' !->
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
  if !isNative(Symbol) && isNative defineProperty
    ok getOwnPropertyDescriptor(O, sym).enumerable is false, 'Symbol.set set enumerable: false value'
test 'Reflect.ownKeys' !->
  ok Reflect?, 'Reflect is defined'
  ok isFunction(Reflect.ownKeys), 'Reflect.ownKeys is function'
  O1 = {a: 1}
  defineProperty O1, \b, value: 2
  sym = Symbol \c
  O1[sym] = 3
  keys = Reflect.ownKeys O1
  ok keys.length is 3, 'ownKeys return all own keys'
  ok O1[keys.0] is 1, 'ownKeys return all own keys: simple'
  ok O1[keys.1] is 2, 'ownKeys return all own keys: hidden'
  ok O1[keys.2] is 3, 'ownKeys return all own keys: symbol'
  O2 = create O1
  keys = Reflect.ownKeys O2
  ok keys.length is 0, 'ownKeys return only own keys'