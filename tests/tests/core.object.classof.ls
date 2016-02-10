{module, test} = QUnit
module \core-js

test 'Object.classof' (assert)!->
  {classof} = Object
  assert.isFunction classof
  assert.ok classof(void) is \Undefined, 'classof undefined is `Undefined`'
  assert.ok classof(null) is \Null, 'classof null is `Null`'
  assert.ok classof(true) is \Boolean, 'classof bool is `Boolean`'
  assert.ok classof('string') is \String, 'classof string is `String`'
  assert.ok classof(7) is \Number, 'classof number is `Number`'
  assert.ok classof(Symbol!) is \Symbol, 'classof symbol is `Symbol`'
  assert.ok classof(new Boolean no) is \Boolean, 'classof new Boolean is `Boolean`'
  assert.ok classof(new String '') is \String, 'classof new String is `String`'
  assert.ok classof(new Number 7) is \Number, 'classof new Number is `Number`'
  assert.ok classof({}) is \Object, 'classof {} is `Object`'
  assert.ok classof([]) is \Array, 'classof array is `Array`'
  assert.ok classof(->) is \Function, 'classof function is `Function`'
  assert.ok classof(/./) is \RegExp, 'classof regexp is `Undefined`'
  assert.ok classof(TypeError!) is \Error, 'classof new TypeError is `RegExp`'
  assert.ok classof((->&)!) is \Arguments, 'classof arguments list is `Arguments`'
  assert.ok classof(new Set) is \Set, 'classof undefined is `Map`'
  assert.ok classof(new Map) is \Map, 'classof map is `Undefined`'
  assert.ok classof(new WeakSet) is \WeakSet, 'classof weakset is `WeakSet`'
  assert.ok classof(new WeakMap) is \WeakMap, 'classof weakmap is `WeakMap`'
  assert.ok classof(new Promise ->) is \Promise, 'classof promise is `Promise`'
  assert.ok classof(''[Symbol.iterator]!) is 'String Iterator', 'classof String Iterator is `String Iterator`'
  assert.ok classof([]entries!) is 'Array Iterator', 'classof Array Iterator is `Array Iterator`'
  assert.ok classof(new Set!entries!) is 'Set Iterator', 'classof Set Iterator is `Set Iterator`'
  assert.ok classof(new Map!entries!) is 'Map Iterator', 'classof Map Iterator is `Map Iterator`'
  assert.ok classof(Math) is \Math, 'classof Math is `Math`'
  if JSON?
    assert.ok classof(JSON) is \JSON, 'classof JSON is `JSON`'
  class Class
    @::[Symbol?toStringTag] = \Class
  assert.ok classof(new Class) is \Class, 'classof user class is [Symbol.toStringTag]'