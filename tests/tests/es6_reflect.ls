# Some tests from https://github.com/tvcutsem/harmony-reflect/blob/master/test/testReflect.js  
QUnit.module 'ES6 Reflect'

eq = strictEqual
deq = deepEqual

isFunction = -> typeof! it is \Function

MODERN = /\[native code\]\s*\}\s*$/.test Object.defineProperty

test \Reflect !->
  ok Reflect?, 'Reflect is defined'

test 'Reflect.apply' !->
  ok isFunction(Reflect.apply), 'Reflect.apply is function'
  eq Reflect.apply(Array::push, [1 2], [3 4 5]), 5
  C = (a, b, c)-> a + b + c
  C.apply = 42
  eq Reflect.apply(C, null, <[foo bar baz]>), \foobarbaz, 'works with redefined apply'

test 'Reflect.construct' !->
  ok isFunction(Reflect.construct), 'Reflect.construct is function'
  C = (a, b, c)-> @qux = a + b + c
  eq Reflect.construct(C, <[foo bar baz]>).qux, \foobarbaz, \basic
  C.apply = 42
  eq Reflect.construct(C, <[foo bar baz]>).qux, \foobarbaz, 'works with redefined apply'
  inst = Reflect.construct((-> @x = 42), [], Array)
  eq inst.x, 42, 'constructor with newTarget'
  ok inst instanceof Array, 'prototype with newTarget'

test 'Reflect.defineProperty' !->
  ok isFunction(Reflect.defineProperty), 'Reflect.defineProperty is function'
  O = {}
  eq Reflect.defineProperty(O, \foo, {value: 123}), on
  eq O.foo, 123
  if MODERN
    O = {}
    Reflect.defineProperty O, \foo, {value: 123, enumerable: on}
    deq Object.getOwnPropertyDescriptor(O, \foo), {value: 123, enumerable: on, configurable: no, writable: no}
    eq Reflect.defineProperty(O, \foo, {value: 42}), no

test 'Reflect.deleteProperty' !->
  ok isFunction(Reflect.deleteProperty), 'Reflect.deleteProperty is function'
  O = {bar: 456}
  eq Reflect.deleteProperty(O, \bar), on
  ok \bar not in O
  if MODERN
    eq Reflect.deleteProperty(Object.defineProperty({}, \foo, {value: 42}), \foo), no

test 'Reflect.enumerate' !->
  ok isFunction(Reflect.enumerate), 'Reflect.enumerate is function'
  obj = {foo: 1, bar: 2}
  iterator = Reflect.enumerate obj
  ok Symbol.iterator of iterator, 'returns iterator'
  deq Array.from(iterator), <[foo bar]>, 'bisic'
  obj = {q: 1, w: 2, e: 3}
  iterator = Reflect.enumerate obj
  delete obj.w
  deq Array.from(iterator), <[q e]>, 'ignore holes'
  obj = {q: 1, w: 2, e: 3} with {a: 4, s: 5, d: 6}
  deq Array.from(Reflect.enumerate obj).sort!, <[a d e q s w]>, 'works with prototype'

test 'Reflect.get' !->
  ok isFunction(Reflect.get), 'Reflect.get is function'
  eq Reflect.get({qux: 987}, \qux), 987
  
  if MODERN
    target = Object.create Object.defineProperty({z:3}, \w, {get: -> @}), {
      x: { value: 1 },
      y: { get: -> @ },
    }
    receiver = {}
    
    eq Reflect.get(target, \x, receiver), 1,        'get x'
    eq Reflect.get(target, \y, receiver), receiver, 'get y'
    eq Reflect.get(target, \z, receiver), 3,        'get z'
    eq Reflect.get(target, \w, receiver), receiver, 'get w'
    eq Reflect.get(target, \u, receiver), void,     'get u'

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
  O = {qux: 987}
  eq Reflect.has(O, \qux), on
  eq Reflect.has(O, \qwe), no
  eq Reflect.has(O, \toString), on

test 'Reflect.isExtensible' !->
  ok isFunction(Reflect.isExtensible), 'Reflect.isExtensible is function'
  ok Reflect.isExtensible {}
  if MODERN
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
  ok Reflect.preventExtensions(obj), on
  if MODERN
    ok !Object.isExtensible obj

test 'Reflect.set' !->
  ok isFunction(Reflect.set), 'Reflect.set is function'
  obj = {}
  ok Reflect.set(obj, \quux, 654), on
  eq obj.quux, 654

  target = {}
  receiver = {}

  Reflect.set target, \foo, 1, receiver
  eq target.foo, void, 'target.foo === undefined'
  eq receiver.foo, 1, 'receiver.foo === 1'
  
  if MODERN
    Object.defineProperty receiver, \bar, {value: 0, writable: on, enumerable: no, configurable: on}
    Reflect.set target, \bar, 1, receiver
    eq receiver.bar, 1, 'receiver.bar === 1'
    eq Object.getOwnPropertyDescriptor(receiver, \bar).enumerable, no, 'enumerability not overridden'
    
    var out
    target = Object.create Object.defineProperty({z:3}, \w, {set: (v)-> out := @}), {
      x: { value: 1, writable: on, configurable: on },
      y: { set: (v)!-> out := @},
      c: { value: 1, writable: no, configurable: no },
    }
    
    eq Reflect.set(target, \x, 2, target), on, 'set x'
    eq target.x, 2, 'set x'
    
    out = null
    
    eq Reflect.set(target, \y, 2, target), on, 'set y'
    eq out, target, 'set y'
    
    eq Reflect.set(target, \z, 4, target), on
    eq target.z, 4, 'set z'
    
    out = null
    
    eq Reflect.set(target, \w, 1, target), on 'set w'
    eq out, target, 'set w'
           
    eq Reflect.set(target, \u, 0, target), on, 'set u'
    eq target.u, 0, 'set u'

    eq Reflect.set(target, \c, 2, target), no, 'set c'
    eq target.c, 1, 'set c'

if '__proto__' of Object:: => test 'Reflect.setPrototypeOf' !->
  ok isFunction(Reflect.setPrototypeOf), 'Reflect.setPrototypeOf is function'
  obj = {}
  ok Reflect.setPrototypeOf(obj, Array::), on
  ok obj instanceof Array
  throws (-> Reflect.setPrototypeOf {}, 42), TypeError
  throws (-> Reflect.setPrototypeOf 42, {}), TypeError