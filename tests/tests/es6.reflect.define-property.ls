QUnit.module 'ES6 Reflect.defineProperty'

{defineProperty, getOwnPropertyDescriptor} = Object

MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual
deq = deepEqual

test '*' !->
  {defineProperty} = Reflect
  ok typeof! defineProperty is \Function, 'Reflect.defineProperty is function'
  eq defineProperty.length, 3, 'arity is 3'
  ok /native code/.test(defineProperty), 'looks like native'
  if \name of defineProperty => eq defineProperty.name, \defineProperty, 'name is "defineProperty"'
  O = {}
  eq defineProperty(O, \foo, {value: 123}), on
  eq O.foo, 123
  if MODERN
    O = {}
    defineProperty O, \foo, {value: 123, enumerable: on}
    deq getOwnPropertyDescriptor(O, \foo), {value: 123, enumerable: on, configurable: no, writable: no}
    eq defineProperty(O, \foo, {value: 42}), no
  throws (-> defineProperty 42, \foo, {value: 42}), TypeError, 'throws on primitive'