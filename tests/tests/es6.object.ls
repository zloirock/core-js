'use strict'
strict = (-> @).call(void) is void
descriptors = /\[native code\]\s*\}\s*$/.test Object.defineProperty

QUnit.module 'ES6 Object'

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
test 'Object#toString' !->
  {toString} = Object::
  if strict
    eq toString.call(null), '[object Null]', 'classof null is `Null`'
    eq toString.call(void), '[object Undefined]', 'classof void is `Undefined`'
  eq toString.call(true), '[object Boolean]', 'classof bool is `Boolean`'
  eq toString.call('string'), '[object String]', 'classof string is `String`'
  eq toString.call(7), '[object Number]', 'classof number is `Number`'
  eq toString.call(Symbol!), '[object Symbol]', 'classof symbol is `Symbol`'
  eq toString.call(new Boolean no), '[object Boolean]', 'classof new Boolean is `Boolean`'
  eq toString.call(new String ''), '[object String]', 'classof new String is `String`'
  eq toString.call(new Number 7), '[object Number]', 'classof new Number is `Number`'
  eq '' + {}, '[object Object]', 'classof {} is `Object`'
  eq toString.call([]), '[object Array]', 'classof array is `Array`'
  eq toString.call(->), '[object Function]', 'classof function is `Function`'
  eq toString.call(/./), '[object RegExp]', 'classof regexp is `Undefined`'
  eq toString.call(TypeError!), '[object Error]', 'classof new TypeError is `RegExp`'
  eq toString.call((->&)!), '[object Arguments]', 'classof arguments list is `Arguments`'
  eq '' + new Set, '[object Set]', 'classof undefined is `Map`'
  eq '' + new Map, '[object Map]', 'classof map is `Undefined`'
  eq '' + new WeakSet, '[object WeakSet]', 'classof weakset is `WeakSet`'
  eq '' + new WeakMap, '[object WeakMap]', 'classof weakmap is `WeakMap`'
  eq '' + new Promise(->), '[object Promise]', 'classof promise is `Promise`'
  eq '' + ''[Symbol.iterator]!, '[object String Iterator]', 'classof String Iterator is `String Iterator`'
  eq '' + []entries!, '[object Array Iterator]', 'classof Array Iterator is `Array Iterator`'
  eq '' + new Set!entries!, '[object Set Iterator]', 'classof Set Iterator is `Set Iterator`'
  eq '' + new Map!entries!, '[object Map Iterator]', 'classof Map Iterator is `Map Iterator`'
  eq '' + Math, '[object Math]', 'classof Math is `Math`'
  if JSON?
    eq toString.call(JSON), '[object JSON]', 'classof JSON is `JSON`'
  class Class
    @::[Symbol.toStringTag] = \Class
  eq '' + new Class, '[object Class]', 'classof user class is [Symbol.toStringTag]'