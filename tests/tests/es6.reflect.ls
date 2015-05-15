# Some tests from https://github.com/tvcutsem/harmony-reflect/blob/master/test/testReflect.js  
QUnit.module 'ES6 Reflect'

eq = strictEqual
deq = deepEqual

isFunction = -> typeof! it is \Function

MODERN = (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
REAL_FREEZE = (->
  'use strict';
  x = Object.freeze({})
  try
    x.f=true
  x.f
)!

test \Reflect !->
  ok Reflect?, 'Reflect is defined'

test 'Reflect.apply' !->
  {apply} = Reflect
  ok isFunction(apply), 'Reflect.apply is function'
  eq apply.length, 3, 'arity is 3'
  ok /native code/.test(apply), 'looks like native'
  if \name of apply => eq apply.name, \apply, 'name is "apply"'
  eq apply(Array::push, [1 2], [3 4 5]), 5
  C = (a, b, c)-> a + b + c
  C.apply = 42
  eq apply(C, null, <[foo bar baz]>), \foobarbaz, 'works with redefined apply'
  throws (-> apply 42, null, []), TypeError, 'throws on primitive'

test 'Reflect.construct' !->
  {construct} = Reflect
  ok isFunction(construct), 'Reflect.construct is function'
  eq construct.length, 2, 'arity is 2'
  ok /native code/.test(construct), 'looks like native'
  if \name of construct => eq construct.name, \construct, 'name is "construct"'
  C = (a, b, c)-> @qux = a + b + c
  eq construct(C, <[foo bar baz]>).qux, \foobarbaz, \basic
  C.apply = 42
  eq construct(C, <[foo bar baz]>).qux, \foobarbaz, 'works with redefined apply'
  inst = construct((-> @x = 42), [], Array)
  eq inst.x, 42, 'constructor with newTarget'
  ok inst instanceof Array, 'prototype with newTarget'
  throws (-> construct 42, []), TypeError, 'throws on primitive'
  f = (->)
  f:: = 42
  ok try Object.getPrototypeOf(construct f, []) is Object::
  catch => no

test 'Reflect.defineProperty' !->
  {defineProperty} = Reflect
  ok isFunction(defineProperty), 'Reflect.defineProperty is function'
  eq defineProperty.length, 3, 'arity is 3'
  ok /native code/.test(defineProperty), 'looks like native'
  if \name of defineProperty => eq defineProperty.name, \defineProperty, 'name is "defineProperty"'
  O = {}
  eq defineProperty(O, \foo, {value: 123}), on
  eq O.foo, 123
  if MODERN
    O = {}
    defineProperty O, \foo, {value: 123, enumerable: on}
    deq Object.getOwnPropertyDescriptor(O, \foo), {value: 123, enumerable: on, configurable: no, writable: no}
    eq defineProperty(O, \foo, {value: 42}), no
  throws (-> defineProperty 42, \foo, {value: 42}), TypeError, 'throws on primitive'

test 'Reflect.deleteProperty' !->
  {deleteProperty} = Reflect
  ok isFunction(deleteProperty), 'Reflect.deleteProperty is function'
  eq deleteProperty.length, 2, 'arity is 2'
  ok /native code/.test(deleteProperty), 'looks like native'
  if \name of deleteProperty => eq deleteProperty.name, \deleteProperty, 'name is "deleteProperty"'
  O = {bar: 456}
  eq deleteProperty(O, \bar), on
  ok \bar not in O
  if MODERN
    eq deleteProperty(Object.defineProperty({}, \foo, {value: 42}), \foo), no
  throws (-> deleteProperty 42, \foo), TypeError, 'throws on primitive'

test 'Reflect.enumerate' !->
  {enumerate} = Reflect
  ok isFunction(enumerate), 'Reflect.enumerate is function'
  eq enumerate.length, 1, 'arity is 1'
  ok /native code/.test(enumerate), 'looks like native'
  if \name of enumerate => eq enumerate.name, \enumerate, 'name is "enumerate"'
  obj = {foo: 1, bar: 2}
  iterator = enumerate obj
  ok Symbol.iterator of iterator, 'returns iterator'
  deq Array.from(iterator), <[foo bar]>, 'bisic'
  obj = {q: 1, w: 2, e: 3}
  iterator = enumerate obj
  delete obj.w
  deq Array.from(iterator), <[q e]>, 'ignore holes'
  obj = {q: 1, w: 2, e: 3} with {a: 4, s: 5, d: 6}
  deq Array.from(enumerate obj).sort!, <[a d e q s w]>, 'works with prototype'
  throws (-> enumerate 42), TypeError, 'throws on primitive'

test 'Reflect.get' !->
  {get} = Reflect
  ok isFunction(get), 'Reflect.get is function'
  eq get.length, 2, 'arity is 2'
  ok /native code/.test(get), 'looks like native'
  if \name of get => eq get.name, \get, 'name is "get"'
  eq get({qux: 987}, \qux), 987
  
  if MODERN
    target = Object.create Object.defineProperty({z:3}, \w, {get: -> @}), {
      x: { value: 1 },
      y: { get: -> @ },
    }
    receiver = {}
    
    eq get(target, \x, receiver), 1,        'get x'
    eq get(target, \y, receiver), receiver, 'get y'
    eq get(target, \z, receiver), 3,        'get z'
    eq get(target, \w, receiver), receiver, 'get w'
    eq get(target, \u, receiver), void,     'get u'
  
  throws (-> get 42 \constructor), TypeError, 'throws on primitive'

test 'Reflect.getOwnPropertyDescriptor' !->
  {getOwnPropertyDescriptor} = Reflect
  ok isFunction(getOwnPropertyDescriptor), 'Reflect.getOwnPropertyDescriptor is function'
  eq getOwnPropertyDescriptor.length, 2, 'arity is 2'
  ok /native code/.test(getOwnPropertyDescriptor), 'looks like native'
  if \name of getOwnPropertyDescriptor => eq getOwnPropertyDescriptor.name, \getOwnPropertyDescriptor, 'name is "getOwnPropertyDescriptor"'
  obj = {baz: 789}
  desc = getOwnPropertyDescriptor obj, \baz
  eq desc.value, 789
  throws (-> getOwnPropertyDescriptor 42 \constructor), TypeError, 'throws on primitive'

test 'Reflect.getPrototypeOf' !->
  {getPrototypeOf} = Reflect
  ok isFunction(getPrototypeOf), 'Reflect.getPrototypeOf is function'
  eq getPrototypeOf.length, 1, 'arity is 1'
  ok /native code/.test(getPrototypeOf), 'looks like native'
  if \name of getPrototypeOf => eq getPrototypeOf.name, \getPrototypeOf, 'name is "getPrototypeOf"'
  eq getPrototypeOf([]), Array::
  throws (-> getPrototypeOf 42), TypeError, 'throws on primitive'

test 'Reflect.has' !->
  {has} = Reflect
  ok isFunction(has), 'Reflect.has is function'
  eq has.length, 2, 'arity is 2'
  ok /native code/.test(has), 'looks like native'
  if \name of has => eq has.name, \has, 'name is "has"'
  O = {qux: 987}
  eq has(O, \qux), on
  eq has(O, \qwe), no
  eq has(O, \toString), on
  throws (-> has 42, \constructor), TypeError, 'throws on primitive'

test 'Reflect.isExtensible' !->
  {isExtensible} = Reflect
  ok isFunction(isExtensible), 'Reflect.isExtensible is function'
  eq isExtensible.length, 1, 'arity is 1'
  ok /native code/.test(isExtensible), 'looks like native'
  if \name of isExtensible => eq isExtensible.name, \isExtensible, 'name is "isExtensible"'
  ok isExtensible {}
  if MODERN
    ok !isExtensible Object.preventExtensions {}
  throws (-> isExtensible 42), TypeError, 'throws on primitive'
  
test 'Reflect.ownKeys' !->
  {ownKeys} = Reflect
  ok isFunction(ownKeys), 'Reflect.ownKeys is function'
  eq ownKeys.length, 1, 'arity is 1'
  ok /native code/.test(ownKeys), 'looks like native'
  if \name of ownKeys => eq ownKeys.name, \ownKeys, 'name is "ownKeys"'
  O1 = {a: 1}
  Object.defineProperty O1, \b, value: 2
  sym = Symbol \c
  O1[sym] = 3
  keys = ownKeys O1
  eq keys.length, 3, 'ownKeys return all own keys'
  eq O1[keys.0], 1, 'ownKeys return all own keys: simple'
  eq O1[keys.1], 2, 'ownKeys return all own keys: hidden'
  eq O1[keys.2], 3, 'ownKeys return all own keys: symbol'
  O2 = ^^O1
  keys = ownKeys O2
  eq keys.length, 0, 'ownKeys return only own keys'
  throws (-> ownKeys 42), TypeError, 'throws on primitive'

test 'Reflect.preventExtensions' !->
  {preventExtensions} = Reflect
  ok isFunction(preventExtensions), 'Reflect.preventExtensions is function'
  eq preventExtensions.length, 1, 'arity is 1'
  ok /native code/.test(preventExtensions), 'looks like native'
  if \name of preventExtensions => eq preventExtensions.name, \preventExtensions, 'name is "preventExtensions"'
  obj = {}
  ok preventExtensions(obj), on
  if MODERN
    ok !Object.isExtensible obj
  throws (-> preventExtensions 42), TypeError, 'throws on primitive'

test 'Reflect.set' !->
  {set} = Reflect
  ok isFunction(set), 'Reflect.set is function'
  eq set.length, 3, 'arity is 3'
  ok /native code/.test(set), 'looks like native'
  if \name of set => eq set.name, \set, 'name is "set"'
  obj = {}
  ok set(obj, \quux, 654), on
  eq obj.quux, 654

  target = {}
  receiver = {}

  set target, \foo, 1, receiver
  eq target.foo, void, 'target.foo === undefined'
  eq receiver.foo, 1, 'receiver.foo === 1'
  
  if MODERN
    Object.defineProperty receiver, \bar, {value: 0, writable: on, enumerable: no, configurable: on}
    set target, \bar, 1, receiver
    eq receiver.bar, 1, 'receiver.bar === 1'
    eq Object.getOwnPropertyDescriptor(receiver, \bar).enumerable, no, 'enumerability not overridden'
    
    var out
    target = Object.create Object.defineProperty({z:3}, \w, {set: (v)-> out := @}), {
      x: { value: 1, writable: on, configurable: on },
      y: { set: (v)!-> out := @},
      c: { value: 1, writable: no, configurable: no },
    }
    
    eq set(target, \x, 2, target), on, 'set x'
    eq target.x, 2, 'set x'
    
    out = null
    
    eq set(target, \y, 2, target), on, 'set y'
    eq out, target, 'set y'
    
    eq set(target, \z, 4, target), on
    eq target.z, 4, 'set z'
    
    out = null
    
    eq set(target, \w, 1, target), on 'set w'
    eq out, target, 'set w'
           
    eq set(target, \u, 0, target), on, 'set u'
    eq target.u, 0, 'set u'

    eq set(target, \c, 2, target), no, 'set c'
    eq target.c, 1, 'set c'
  throws (-> set 42, \q, 42), TypeError, 'throws on primitive'

if '__proto__' of {} => test 'Reflect.setPrototypeOf' !->
  {setPrototypeOf} = Reflect
  ok isFunction(setPrototypeOf), 'Reflect.setPrototypeOf is function'
  eq setPrototypeOf.length, 2, 'arity is 2'
  ok /native code/.test(setPrototypeOf), 'looks like native'
  if \name of setPrototypeOf => eq setPrototypeOf.name, \setPrototypeOf, 'name is "setPrototypeOf"'
  obj = {}
  ok setPrototypeOf(obj, Array::), on
  ok obj instanceof Array
  throws (-> setPrototypeOf {}, 42), TypeError
  throws (-> setPrototypeOf 42, {}), TypeError, 'throws on primitive'
  ok setPrototypeOf(o = {}, o) is no, 'false on recursive __proto__'
  if REAL_FREEZE
    ok setPrototypeOf(Object.freeze({}), {}) is no, 'false on frozen object'