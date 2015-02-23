'use strict'
descriptors = /\[native code\]\s*\}\s*$/.test Object.defineProperty

QUnit.module 'ES6 Object statics'

eq = strictEqual
deq = deepEqual
isFunction = -> typeof! it is \Function

test 'Object.assign' !->
  {assign} = Object
  ok isFunction(assign), 'Is function'
  foo = q: 1
  eq foo, assign(foo, bar: 2), 'assign return target'
  eq foo.bar, 2, 'assign define properties'
  if descriptors
    foo = baz: 1
    assign foo, Object.defineProperty {}, \bar, get: -> @baz + 1
    ok foo.bar is void, "assign don't copy descriptors"
  deq assign({}, {q: 1}, {w: 2}), {q: 1, w: 2}
  deq assign({}, \qwe), {0: \q, 1: \w, 2: \e}
  throws (-> assign null {q: 1}), TypeError
  throws (-> assign void, {q: 1}), TypeError
  str = assign(\qwe, {q: 1})
  eq typeof str, \object
  eq String(str), \qwe
  eq str.q, 1
test 'Object.is' !->
  same = Object.is
  ok isFunction(same), 'Is function'
  ok same(1 1), '1 is 1'
  ok same(NaN, NaN), '1 is 1'
  ok not same(0 -0), '0 isnt -0'
  ok not same({} {}), '{} isnt {}'
if Object.setPrototypeOf
  test 'Object.setPrototypeOf' !->
    {setPrototypeOf} = Object
    ok isFunction(setPrototypeOf), 'Is function'
    ok \apply of setPrototypeOf({} Function::), 'Parent properties in target'
    eq setPrototypeOf(a:2, {b: -> @a^2})b!, 4, 'Child and parent properties in target'
    eq setPrototypeOf(tmp = {}, {a: 1}), tmp, 'setPrototypeOf return target'
    ok !(\toString of setPrototypeOf {} null), 'Can set null as prototype'