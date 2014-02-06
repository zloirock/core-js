{isFunction} = Function
test 'Object.getPropertyDescriptor' !->
  {getPropertyDescriptor, create} = Object
  ok isFunction getPropertyDescriptor
  deepEqual getPropertyDescriptor(create(q: 1), \q), {+enumerable, +configurable, +writable, value: 1}
test 'Object.getOwnPropertyDescriptors' !->
  {getOwnPropertyDescriptors, make} = Object
  ok isFunction getOwnPropertyDescriptors
  descs = getOwnPropertyDescriptors(make({q: 1}, w:2), \q)
  ok descs.q is void
  deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
test 'Object.getPropertyDescriptors' !->
  {getPropertyDescriptors, make} = Object
  ok isFunction getPropertyDescriptors
  descs = getPropertyDescriptors(make({q: 1}, w:2), \q)
  deepEqual descs.q, {+enumerable, +configurable, +writable, value: 1}
  deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
test 'Object.getPropertyNames' !->
  {getPropertyNames} = Object
  ok isFunction getPropertyNames
  names = getPropertyNames {q:1}
  ok \q in names
  ok \toString in names
  ok \w not in names