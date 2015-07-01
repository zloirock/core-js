QUnit.module \ES7

descriptors = (-> try 2 == core.Object.defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual
{create} = core.Object

test 'Object.getOwnPropertyDescriptors' !->
  {getOwnPropertyDescriptors} = core.Object
  ok typeof! getOwnPropertyDescriptors is \Function, 'Is function'
  
  O = create {q: 1}, e: value: 3
  O.w = 2
  s = core.Symbol \s
  O[s] = 4
  
  descs = getOwnPropertyDescriptors O
  
  eq descs.q, void
  deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
  if descriptors => deepEqual descs.e, {-enumerable, -configurable, -writable, value: 3}
  else deepEqual descs.e, {+enumerable, +configurable, +writable, value: 3}
  eq descs[s].value, 4