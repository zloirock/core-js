'use strict'
strict = (-> @).call(void) is void

QUnit.module 'ES6 Object prototype'

eq = strictEqual

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