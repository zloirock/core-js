QUnit.module 'ES6 Reflect.deleteProperty'

{defineProperty} = core.Object

MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual

test '*' !->
  {deleteProperty} = core.Reflect
  ok typeof! deleteProperty is \Function, 'Reflect.deleteProperty is function'
  eq deleteProperty.length, 2, 'arity is 2'
  if \name of deleteProperty => eq deleteProperty.name, \deleteProperty, 'name is "deleteProperty"'
  O = {bar: 456}
  eq deleteProperty(O, \bar), on
  ok \bar not in O
  if MODERN
    eq deleteProperty(defineProperty({}, \foo, {value: 42}), \foo), no
  throws (-> deleteProperty 42, \foo), TypeError, 'throws on primitive'