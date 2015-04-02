# Some tests from https://github.com/tvcutsem/harmony-reflect/blob/master/test/testReflect.js  
QUnit.module 'ES6 Reflect'

eq = strictEqual
deq = deepEqual

isFunction = -> typeof! it is \Function

MODERN = /\[native code\]\s*\}\s*$/.test core.Object.defineProperty

test \Reflect !->
  ok core.Reflect?, 'Reflect is defined'

test 'Reflect.apply' !->
  ok isFunction(core.Reflect.apply), 'Reflect.apply is function'
  eq core.Reflect.apply(Array::push, [1 2], [3 4 5]), 5
  C = (a, b, c)-> a + b + c
  C.apply = 42
  eq core.Reflect.apply(C, null, <[foo bar baz]>), \foobarbaz, 'works with redefined apply'
  throws (-> core.Reflect.apply 42, null, []), TypeError, 'throws on primitive'

test 'Reflect.construct' !->
  ok isFunction(core.Reflect.construct), 'Reflect.construct is function'
  C = (a, b, c)-> @qux = a + b + c
  eq core.Reflect.construct(C, <[foo bar baz]>).qux, \foobarbaz, \basic
  C.apply = 42
  eq core.Reflect.construct(C, <[foo bar baz]>).qux, \foobarbaz, 'works with redefined apply'
  inst = core.Reflect.construct((-> @x = 42), [], Array)
  eq inst.x, 42, 'constructor with newTarget'
  ok inst instanceof Array, 'prototype with newTarget'
  throws (-> core.Reflect.construct 42, []), TypeError, 'throws on primitive'
  f = (->)
  f:: = 42
  ok try core.Object.getPrototypeOf(core.Reflect.construct f, []) is Object::
  catch => no

test 'Reflect.defineProperty' !->
  ok isFunction(core.Reflect.defineProperty), 'Reflect.defineProperty is function'
  O = {}
  eq core.Reflect.defineProperty(O, \foo, {value: 123}), on
  eq O.foo, 123
  if MODERN
    O = {}
    core.Reflect.defineProperty O, \foo, {value: 123, enumerable: on}
    deq core.Object.getOwnPropertyDescriptor(O, \foo), {value: 123, enumerable: on, configurable: no, writable: no}
    eq core.Reflect.defineProperty(O, \foo, {value: 42}), no
  throws (-> core.Reflect.defineProperty 42, \foo, {value: 42}), TypeError, 'throws on primitive'

test 'Reflect.deleteProperty' !->
  ok isFunction(core.Reflect.deleteProperty), 'Reflect.deleteProperty is function'
  O = {bar: 456}
  eq core.Reflect.deleteProperty(O, \bar), on
  ok \bar not in O
  if MODERN
    eq core.Reflect.deleteProperty(core.Object.defineProperty({}, \foo, {value: 42}), \foo), no
  throws (-> core.Reflect.deleteProperty 42, \foo), TypeError, 'throws on primitive'

test 'Reflect.enumerate' !->
  ok isFunction(core.Reflect.enumerate), 'Reflect.enumerate is function'
  obj = {foo: 1, bar: 2}
  iterator = core.Reflect.enumerate obj
  ok core.Symbol.iterator of iterator, 'returns iterator'
  deq core.Array.from(iterator), <[foo bar]>, 'bisic'
  obj = {q: 1, w: 2, e: 3}
  iterator = core.Reflect.enumerate obj
  delete obj.w
  deq core.Array.from(iterator), <[q e]>, 'ignore holes'
  obj = {q: 1, w: 2, e: 3} with {a: 4, s: 5, d: 6}
  deq core.Array.from(core.Reflect.enumerate obj).sort!, <[a d e q s w]>, 'works with prototype'
  throws (-> core.Reflect.enumerate 42), TypeError, 'throws on primitive'

test 'Reflect.get' !->
  ok isFunction(core.Reflect.get), 'Reflect.get is function'
  eq core.Reflect.get({qux: 987}, \qux), 987
  
  if MODERN
    target = core.Object.create core.Object.defineProperty({z:3}, \w, {get: -> @}), {
      x: { value: 1 },
      y: { get: -> @ },
    }
    receiver = {}
    
    eq core.Reflect.get(target, \x, receiver), 1,        'get x'
    eq core.Reflect.get(target, \y, receiver), receiver, 'get y'
    eq core.Reflect.get(target, \z, receiver), 3,        'get z'
    eq core.Reflect.get(target, \w, receiver), receiver, 'get w'
    eq core.Reflect.get(target, \u, receiver), void,     'get u'
  
  throws (-> core.Reflect.get 42 \constructor), TypeError, 'throws on primitive'

test 'Reflect.getOwnPropertyDescriptor' !->
  ok isFunction(core.Reflect.getOwnPropertyDescriptor), 'Reflect.getOwnPropertyDescriptor is function'
  obj = {baz: 789}
  desc = core.Reflect.getOwnPropertyDescriptor obj, \baz
  eq desc.value, 789
  throws (-> core.Reflect.getOwnPropertyDescriptor 42 \constructor), TypeError, 'throws on primitive'

test 'Reflect.getPrototypeOf' !->
  ok isFunction(core.Reflect.getPrototypeOf), 'Reflect.getPrototypeOf is function'
  eq core.Reflect.getPrototypeOf([]), Array::
  throws (-> core.Reflect.getPrototypeOf 42), TypeError, 'throws on primitive'

test 'Reflect.has' !->
  ok isFunction(core.Reflect.has), 'Reflect.has is function'
  O = {qux: 987}
  eq core.Reflect.has(O, \qux), on
  eq core.Reflect.has(O, \qwe), no
  eq core.Reflect.has(O, \toString), on
  throws (-> core.Reflect.has 42, \constructor), TypeError, 'throws on primitive'

test 'Reflect.isExtensible' !->
  ok isFunction(core.Reflect.isExtensible), 'Reflect.isExtensible is function'
  ok core.Reflect.isExtensible {}
  if MODERN
    ok !core.Reflect.isExtensible core.Object.preventExtensions {}
  throws (-> core.Reflect.isExtensible 42), TypeError, 'throws on primitive'
  
test 'Reflect.ownKeys' !->
  ok isFunction(core.Reflect.ownKeys), 'Reflect.ownKeys is function'
  O1 = {a: 1}
  core.Object.defineProperty O1, \b, value: 2
  sym = core.Symbol \c
  O1[sym] = 3
  keys = core.Reflect.ownKeys O1
  eq keys.length, 3, 'ownKeys return all own keys'
  eq O1[keys.0], 1, 'ownKeys return all own keys: simple'
  eq O1[keys.1], 2, 'ownKeys return all own keys: hidden'
  eq O1[keys.2], 3, 'ownKeys return all own keys: symbol'
  O2 = ^^O1
  keys = core.Reflect.ownKeys O2
  eq keys.length, 0, 'ownKeys return only own keys'
  throws (-> core.Reflect.ownKeys 42), TypeError, 'throws on primitive'

test 'Reflect.preventExtensions' !->
  ok isFunction(core.Reflect.preventExtensions), 'Reflect.preventExtensions is function'
  obj = {}
  ok core.Reflect.preventExtensions(obj), on
  if MODERN
    ok !core.Object.isExtensible obj
  throws (-> core.Reflect.preventExtensions 42), TypeError, 'throws on primitive'

test 'Reflect.set' !->
  ok isFunction(core.Reflect.set), 'Reflect.set is function'
  obj = {}
  ok core.Reflect.set(obj, \quux, 654), on
  eq obj.quux, 654

  target = {}
  receiver = {}

  core.Reflect.set target, \foo, 1, receiver
  eq target.foo, void, 'target.foo === undefined'
  eq receiver.foo, 1, 'receiver.foo === 1'
  
  if MODERN
    core.Object.defineProperty receiver, \bar, {value: 0, writable: on, enumerable: no, configurable: on}
    core.Reflect.set target, \bar, 1, receiver
    eq receiver.bar, 1, 'receiver.bar === 1'
    eq core.Object.getOwnPropertyDescriptor(receiver, \bar).enumerable, no, 'enumerability not overridden'
    
    var out
    target = core.Object.create core.Object.defineProperty({z:3}, \w, {set: (v)-> out := @}), {
      x: { value: 1, writable: on, configurable: on },
      y: { set: (v)!-> out := @},
      c: { value: 1, writable: no, configurable: no },
    }
    
    eq core.Reflect.set(target, \x, 2, target), on, 'set x'
    eq target.x, 2, 'set x'
    
    out = null
    
    eq core.Reflect.set(target, \y, 2, target), on, 'set y'
    eq out, target, 'set y'
    
    eq core.Reflect.set(target, \z, 4, target), on
    eq target.z, 4, 'set z'
    
    out = null
    
    eq core.Reflect.set(target, \w, 1, target), on 'set w'
    eq out, target, 'set w'
           
    eq core.Reflect.set(target, \u, 0, target), on, 'set u'
    eq target.u, 0, 'set u'

    eq core.Reflect.set(target, \c, 2, target), no, 'set c'
    eq target.c, 1, 'set c'
  throws (-> core.Reflect.set 42, \q, 42), TypeError, 'throws on primitive'

if '__proto__' of Object:: => test 'Reflect.setPrototypeOf' !->
  ok isFunction(core.Reflect.setPrototypeOf), 'Reflect.setPrototypeOf is function'
  obj = {}
  ok core.Reflect.setPrototypeOf(obj, Array::), on
  ok obj instanceof Array
  throws (-> core.Reflect.setPrototypeOf {}, 42), TypeError
  throws (-> core.Reflect.setPrototypeOf 42, {}), TypeError, 'throws on primitive'