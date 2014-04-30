isFunction = -> typeof! it is \Function
isNative = -> /^\s*function[^{]+\{\s*\[native code\]\s*\}\s*$/.test it
{getPrototypeOf, create, defineProperty, getOwnPropertyDescriptor} = Object
test 'Object.getPropertyDescriptor' !->
  {getPropertyDescriptor, create} = Object
  ok isFunction(getPropertyDescriptor), 'Is function'
  deepEqual getPropertyDescriptor(create(q: 1), \q), {+enumerable, +configurable, +writable, value: 1}
test 'Object.getOwnPropertyDescriptors' !->
  {getOwnPropertyDescriptors, make} = Object
  ok isFunction(getOwnPropertyDescriptors), 'Is function'
  descs = getOwnPropertyDescriptors(make({q: 1}, w:2), \q)
  ok descs.q is void
  deepEqual descs.w, {+enumerable, +configurable, +writable, value: 2}
test 'Object.isEnumerable' !->
  {isEnumerable} = Object
  ok isFunction(isEnumerable), 'Is function'
  ok isEnumerable q:1, \q
  ok not isEnumerable {} \toString
  ok not isEnumerable ^^{q:1}, \q
test 'Object.isPrototype' !->
  {isPrototype} = Object
  ok isFunction(isPrototype), 'Is function'
  ok isPrototype Object::, {}
  ok isPrototype Object::, []
  ok not isPrototype Array::, {}
  ok isPrototype Array::, []
  ok not isPrototype Function::, []
  ok isPrototype proto = {}, ^^proto
  ok not isPrototype {}, ^^->
test 'Object.classof' !->
  {classof} = Object
  ok isFunction(classof), 'Is function'
  ok classof({}) is \Object
  ok classof(void) is \Undefined
  ok classof(null) is \Null
  ok classof(no) is \Boolean
  ok classof(new Boolean no) is \Boolean
  ok classof('') is \String
  ok classof(new String '') is \String
  ok classof(7) is \Number
  ok classof(new Number 7) is \Number
  ok classof([]) is \Array
  ok classof(->) is \Function
  ok classof(/./) is \RegExp
  ok classof(TypeError!) is \Error
  ok classof((->&)!) is \Arguments
  ok classof(new Set) is \Set
  ok classof(new Map) is \Map
  ok classof(new WeakSet) is \WeakSet
  ok classof(new WeakMap) is \WeakMap
  ok classof(new Promise ->) is \Promise
  ok classof(new Symbol) is \Symbol
  ok classof(Symbol!) is \Symbol
  ok classof([]entries!) is 'Array Iterator'
  ok classof(new Set!entries!) is 'Set Iterator'
  ok classof(new Map!entries!) is 'Map Iterator'
test 'Object.make' !->
  {make} = Object
  ok isFunction(make), 'Is function'
  object = make foo = {q:1}, {w:2}
  ok getPrototypeOf(object) is foo
  ok object.w is 2
test 'Object.define' !->
  {define} = Object
  ok isFunction(define), 'Is function'
  foo = q:1
  ok foo is define foo, w:2
  ok foo.w is 2
  if isNative getOwnPropertyDescriptor
    foo = q:1
    foo2 = defineProperty {}, \w, get: -> @q + 1
    define foo, foo2
    ok foo.w is 2
test 'Object.isObject' !->
  {isObject} = Object
  ok isFunction(isObject), 'Is function'
  ok not isObject void
  ok not isObject null
  ok not isObject 1
  ok not isObject no
  ok not isObject ''
  ok isObject new Number 1
  ok isObject new Boolean no
  ok isObject new String 1
  ok isObject {}
  ok isObject []
  ok isObject /./
  ok isObject new ->
test 'Object.symbol' !->
  {symbol} = Object
  ok isFunction(symbol), 'Is function'
  ok typeof symbol('foo') is 'string', "symbol('foo') return string"
  ok symbol('foo') isnt symbol('foo'), "symbol('foo') !== symbol('foo')"
  ok symbol('foo')slice(0 6) is '@@foo_', "symbol('foo') begin from @@foo_"
  ok symbol('foo')length > 15, "symbol('foo')length > 15"
test 'Object.hidden' !->
  {hidden} = Object
  ok isFunction(hidden), 'Is function'
  o = {}
  ok hidden(o, \key 42) is o, 'return target'
  ok o.key is 42, 'hidden define property'
  if isNative getOwnPropertyDescriptor
    desc = getOwnPropertyDescriptor o, \key
    ok not desc.enumerable, 'hidden define not enumerable property'
    ok desc.writable, 'hidden define writable property'
    ok desc.configurable, 'hidden define configurable property'