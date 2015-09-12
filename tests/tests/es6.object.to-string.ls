'use strict'

{module, test} = QUnit
module \ES6

test 'Object#toString' (assert)->
  assert.strictEqual Object::toString.length, 0, 'length is 0'
  assert.strictEqual Object::toString.name, \toString, 'name is "toString"'
  assert.ok /native code/.test(Object::toString), 'looks like native'
  {toString} = Object::
  if !(-> @)!
    assert.strictEqual toString.call(null), '[object Null]', 'classof null is `Null`'
    assert.strictEqual toString.call(void), '[object Undefined]', 'classof void is `Undefined`'
  assert.strictEqual toString.call(true), '[object Boolean]', 'classof bool is `Boolean`'
  assert.strictEqual toString.call('string'), '[object String]', 'classof string is `String`'
  assert.strictEqual toString.call(7), '[object Number]', 'classof number is `Number`'
  assert.strictEqual toString.call(Symbol!), '[object Symbol]', 'classof symbol is `Symbol`'
  assert.strictEqual toString.call(new Boolean no), '[object Boolean]', 'classof new Boolean is `Boolean`'
  assert.strictEqual toString.call(new String ''), '[object String]', 'classof new String is `String`'
  assert.strictEqual toString.call(new Number 7), '[object Number]', 'classof new Number is `Number`'
  assert.strictEqual '' + {}, '[object Object]', 'classof {} is `Object`'
  assert.strictEqual toString.call([]), '[object Array]', 'classof array is `Array`'
  assert.strictEqual toString.call(->), '[object Function]', 'classof function is `Function`'
  assert.strictEqual toString.call(/./), '[object RegExp]', 'classof regexp is `Undefined`'
  assert.strictEqual toString.call(TypeError!), '[object Error]', 'classof new TypeError is `RegExp`'
  assert.strictEqual toString.call((->&)!), '[object Arguments]', 'classof arguments list is `Arguments`'
  assert.strictEqual '' + new Set, '[object Set]', 'classof undefined is `Map`'
  assert.strictEqual '' + new Map, '[object Map]', 'classof map is `Undefined`'
  assert.strictEqual '' + new WeakSet, '[object WeakSet]', 'classof weakset is `WeakSet`'
  assert.strictEqual '' + new WeakMap, '[object WeakMap]', 'classof weakmap is `WeakMap`'
  assert.strictEqual '' + new Promise(->), '[object Promise]', 'classof promise is `Promise`'
  assert.strictEqual '' + ''[Symbol.iterator]!, '[object String Iterator]', 'classof String Iterator is `String Iterator`'
  assert.strictEqual '' + []entries!, '[object Array Iterator]', 'classof Array Iterator is `Array Iterator`'
  assert.strictEqual '' + new Set!entries!, '[object Set Iterator]', 'classof Set Iterator is `Set Iterator`'
  assert.strictEqual '' + new Map!entries!, '[object Map Iterator]', 'classof Map Iterator is `Map Iterator`'
  assert.strictEqual '' + Math, '[object Math]', 'classof Math is `Math`'
  if JSON?
    assert.strictEqual toString.call(JSON), '[object JSON]', 'classof JSON is `JSON`'
  class Class
    @::[Symbol.toStringTag] = \Class
  assert.strictEqual '' + new Class, '[object Class]', 'classof user class is [Symbol.toStringTag]'