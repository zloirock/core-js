QUnit.module 'core-js Object.define'
test '*' !->
  {define, defineProperty} = Object
  ok typeof! define is \Function, 'Is function'
  foo = q:1
  ok foo is define foo, w:2
  ok foo.w is 2
  if (-> try 2 == defineProperty({}, \a, get: -> 2)a)!
    foo = q:1
    foo2 = defineProperty {}, \w, get: -> @q + 1
    define foo, foo2
    ok foo.w is 2