QUnit.module \ES6

{defineProperty, create} = core.Object

MODERN = (-> try 2 == defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual

test 'Reflect.get' !->
  {get} = core.Reflect
  ok typeof! get is \Function, 'Reflect.get is function'
  #eq get.length, 2, 'arity is 2' # fails in MS Edge
  if \name of get => eq get.name, \get, 'name is "get"'
  eq get({qux: 987}, \qux), 987
  
  if MODERN
    target = create defineProperty({z:3}, \w, {get: -> @}), {
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