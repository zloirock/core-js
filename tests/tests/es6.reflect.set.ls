QUnit.module 'ES6 Reflect.set'

{defineProperty, getOwnPropertyDescriptor, create} = Object

MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual

test '*' !->
  {set} = Reflect
  ok typeof! set is \Function, 'Reflect.set is function'
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
    defineProperty receiver, \bar, {value: 0, writable: on, enumerable: no, configurable: on}
    set target, \bar, 1, receiver
    eq receiver.bar, 1, 'receiver.bar === 1'
    eq getOwnPropertyDescriptor(receiver, \bar).enumerable, no, 'enumerability not overridden'
    
    var out
    target = create defineProperty({z:3}, \w, {set: (v)-> out := @}), {
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