QUnit.module 'core-js Object'
isFunction = -> typeof! it is \Function
test '.isObject' !->
  {isObject} = core.Object
  ok isFunction(isObject), 'Is function'
  ok not isObject(void), 'isObject undefined return false'
  ok not isObject(null), 'isObject null return false'
  ok not isObject(1), 'isObject number return false'
  ok not isObject(true), 'isObject bool return false'
  ok not isObject('string'), 'isObject string return false'
  ok isObject(new Number 1), 'isObject new Number return true'
  ok isObject(new Boolean no), 'isObject new Boolean return true'
  ok isObject(new String 1), 'isObject new String return true'
  ok isObject({}), 'isObject object return true'
  ok isObject([]), 'isObject array return true'
  ok isObject(/./), 'isObject regexp return true'
  ok isObject(->), 'isObject function return true'
  ok isObject(new ->), 'isObject constructor instance return true'
test '.classof' !->
  {classof} = core.Object
  ok isFunction(classof), 'Is function'
  ok classof(void) is \Undefined, 'classof undefined is `Undefined`'
  ok classof(null) is \Null, 'classof null is `Null`'
  ok classof(true) is \Boolean, 'classof bool is `Boolean`'
  ok classof('string') is \String, 'classof string is `String`'
  ok classof(7) is \Number, 'classof number is `Number`'
  ok classof(core.Symbol!) is \Symbol, 'classof symbol is `Symbol`'
  ok classof(new Boolean no) is \Boolean, 'classof new Boolean is `Boolean`'
  ok classof(new String '') is \String, 'classof new String is `String`'
  ok classof(new Number 7) is \Number, 'classof new Number is `Number`'
  ok classof({}) is \Object, 'classof {} is `Object`'
  ok classof([]) is \Array, 'classof array is `Array`'
  ok classof(->) is \Function, 'classof function is `Function`'
  ok classof(/./) is \RegExp, 'classof regexp is `Undefined`'
  ok classof(TypeError!) is \Error, 'classof new TypeError is `RegExp`'
  ok classof((->&)!) is \Arguments, 'classof arguments list is `Arguments`'
  ok classof(new core.Set) is \Set, 'classof undefined is `Map`'
  ok classof(new core.Map) is \Map, 'classof map is `Undefined`'
  ok classof(new core.WeakSet) is \WeakSet, 'classof weakset is `WeakSet`'
  ok classof(new core.WeakMap) is \WeakMap, 'classof weakmap is `WeakMap`'
  ok classof(new core.Promise ->) is \Promise, 'classof promise is `Promise`'
  ok classof(core.getIterator '') is 'String Iterator', 'classof String Iterator is `String Iterator`'
  ok classof(core.getIterator []) is 'Array Iterator', 'classof Array Iterator is `Array Iterator`'
  ok classof(new core.Set!entries!) is 'Set Iterator', 'classof Set Iterator is `Set Iterator`'
  ok classof(new core.Map!entries!) is 'Map Iterator', 'classof Map Iterator is `Map Iterator`'
  ok classof(Math) is \Math, 'classof Math is `Math`'
  if JSON?
    ok classof(JSON) is \JSON, 'classof JSON is `JSON`'
  class Class
    @::[core.Symbol.toStringTag] = \Class
  ok classof(new Class) is \Class, 'classof user class is [Symbol.toStringTag]'
test '.make' !->
  {make} = core.Object
  ok isFunction(make), 'Is function'
  object = make foo = {q:1}, {w:2}
  ok core.Object.getPrototypeOf(object) is foo
  ok object.w is 2
test '.define' !->
  {define} = core.Object
  ok isFunction(define), 'Is function'
  foo = q:1
  ok foo is define foo, w:2
  ok foo.w is 2
  if /\[native code\]\s*\}\s*$/.test core.Object.defineProperty
    foo = q:1
    foo2 = core.Object.defineProperty {}, \w, get: -> @q + 1
    define foo, foo2
    ok foo.w is 2