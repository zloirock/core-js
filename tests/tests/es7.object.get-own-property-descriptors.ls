QUnit.module 'ES7 Object.getOwnPropertyDescriptors'

descriptors = (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual
{create} = Object

test '*' !->
  {getOwnPropertyDescriptors} = Object
  ok typeof! getOwnPropertyDescriptors is \Function, 'Is function'
  ok /native code/.test(getOwnPropertyDescriptors), 'looks like native'
  
  O = create {q: 1}, e: value: 3
  O.w = 2
  s = Symbol \s
  O[s] = 4
  
  descs = getOwnPropertyDescriptors O
  
  eq descs.q, void
  deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
  if descriptors => deepEqual descs.e, {-enumerable, -configurable, -writable, value: 3}
  else deepEqual descs.e, {+enumerable, +configurable, +writable, value: 3}
  eq descs[s].value, 4