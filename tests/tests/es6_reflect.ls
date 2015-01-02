QUnit.module 'ES6 Reflect'

eq = strictEqual
deq = deepEqual

isFunction = -> typeof! it is \Function

test \Reflect !->
  ok Reflect?, 'Reflect is defined'

test 'Reflect.apply' !->
  ok isFunction(Reflect.apply), 'Reflect.apply is function'
  eq Reflect.apply(Array::push, [1 2], [3 4 5]), 5

test 'Reflect.construct' !->
  ok isFunction(Reflect.construct), 'Reflect.construct is function'
  eq Reflect.construct(((a, b, c)-> @qux = a + b + c), <[foo bar baz]>).qux, \foobarbaz

test 'Reflect.defineProperty' !->
  ok isFunction(Reflect.defineProperty), 'Reflect.defineProperty is function'
  obj = {}
  Reflect.defineProperty obj, \foo, {value: 123}
  eq obj.foo, 123

test 'Reflect.deleteProperty' !->
  ok isFunction(Reflect.deleteProperty), 'Reflect.deleteProperty is function'
  obj = {bar: 456}
  Reflect.deleteProperty obj, \bar
  ok \bar not in obj

test 'Reflect.enumerate' !->
  ok isFunction(Reflect.enumerate), 'Reflect.enumerate is function'
  obj = {foo: 1, bar: 2}
  iterator = Reflect.enumerate obj
  ok Symbol.iterator of iterator
  deq Array.from(iterator), <[foo bar]>

test 'Reflect.get' !->
  ok isFunction(Reflect.get), 'Reflect.get is function'
  eq Reflect.get({qux: 987}, \qux), 987

test 'Reflect.getOwnPropertyDescriptor' !->
  ok isFunction(Reflect.getOwnPropertyDescriptor), 'Reflect.getOwnPropertyDescriptor is function'
  obj = {baz: 789}
  desc = Reflect.getOwnPropertyDescriptor obj, \baz
  eq desc.value, 789

test 'Reflect.getPrototypeOf' !->
  ok isFunction(Reflect.getPrototypeOf), 'Reflect.getPrototypeOf is function'
  eq Reflect.getPrototypeOf([]), Array::

test 'Reflect.has' !->
  ok isFunction(Reflect.has), 'Reflect.has is function'
  ok Reflect.has {qux: 987}, \qux

test 'Reflect.isExtensible' !->
  ok isFunction(Reflect.isExtensible), 'Reflect.isExtensible is function'
  ok Reflect.isExtensible {}
  ok !Reflect.isExtensible Object.preventExtensions {}
  
test 'Reflect.ownKeys' !->
  ok isFunction(Reflect.ownKeys), 'Reflect.ownKeys is function'
  O1 = {a: 1}
  Object.defineProperty O1, \b, value: 2
  sym = Symbol \c
  O1[sym] = 3
  keys = Reflect.ownKeys O1
  eq keys.length, 3, 'ownKeys return all own keys'
  eq O1[keys.0], 1, 'ownKeys return all own keys: simple'
  eq O1[keys.1], 2, 'ownKeys return all own keys: hidden'
  eq O1[keys.2], 3, 'ownKeys return all own keys: symbol'
  O2 = ^^O1
  keys = Reflect.ownKeys O2
  eq keys.length, 0, 'ownKeys return only own keys'

test 'Reflect.preventExtensions' !->
  ok isFunction(Reflect.preventExtensions), 'Reflect.preventExtensions is function'
  obj = {}
  Reflect.preventExtensions obj
  ok !Object.isExtensible obj

test 'Reflect.set' !->
  ok isFunction(Reflect.set), 'Reflect.set is function'
  obj = {}
  Reflect.set obj, \quux, 654
  eq obj.quux, 654

if '__proto__' of Object:: => test 'Reflect.setPrototypeOf' !->
  ok isFunction(Reflect.setPrototypeOf), 'Reflect.setPrototypeOf is function'
  obj = {}
  Reflect.setPrototypeOf obj, Array::
  ok obj instanceof Array