{module, test} = QUnit
module \ES

test 'Object#toString' (assert)->
  assert.arity Object::toString, 0
  assert.name Object::toString, \toString
  assert.looksNative Object::toString
  assert.nonEnumerable Object::, \toString
  {toString} = Object::
  if STRICT
    assert.strictEqual toString.call(null), '[object Null]', 'null -> `Null`'
    assert.strictEqual toString.call(void), '[object Undefined]', 'undefined -> `Undefined`'
  assert.strictEqual toString.call(true), '[object Boolean]', 'bool -> `Boolean`'
  assert.strictEqual toString.call('string'), '[object String]', 'string -> `String`'
  assert.strictEqual toString.call(7), '[object Number]', 'number -> `Number`'
  Symbol? and assert.strictEqual toString.call(Symbol!), '[object Symbol]', 'symbol -> `Symbol`'
  assert.strictEqual toString.call(new Boolean no), '[object Boolean]', 'new Boolean -> `Boolean`'
  assert.strictEqual toString.call(new String ''), '[object String]', 'new String -> `String`'
  assert.strictEqual toString.call(new Number 7), '[object Number]', 'new Number -> `Number`'
  assert.strictEqual '' + {}, '[object Object]', '{} -> `Object`'
  assert.strictEqual toString.call([]), '[object Array]', ' [] -> `Array`'
  assert.strictEqual toString.call(->), '[object Function]', 'function -> `Function`'
  assert.strictEqual toString.call(/./), '[object RegExp]', 'regexp -> `RegExp`'
  assert.strictEqual toString.call(TypeError!), '[object Error]', 'new TypeError -> `Error`'
  assert.strictEqual toString.call((->&)!), '[object Arguments]', 'arguments -> `Arguments`'
  for <[Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array ArrayBuffer]>
    Constructor = global[..]
    if Constructor
      assert.strictEqual toString.call(new Constructor 1), "[object #{..}]", "new #{..} -> `#{..}`"
  if NATIVE and DataView? # fails in IE / Edge, enable with TA polyfill
    assert.strictEqual '' + new DataView(new ArrayBuffer 1), '[object DataView]', 'new DataView -> `DataView`'
  if Set?
    assert.strictEqual '' + new Set, '[object Set]', 'set -> `Set`'
  if Map?
    assert.strictEqual '' + new Map, '[object Map]', 'map -> `Map`'
  if WeakSet?
    assert.strictEqual '' + new WeakSet, '[object WeakSet]', 'weakset -> `WeakSet`'
  if WeakMap?
    assert.strictEqual '' + new WeakMap, '[object WeakMap]', 'weakmap -> `WeakMap`'
  if Promise?
    assert.strictEqual '' + new Promise(->), '[object Promise]', 'promise -> `Promise`'
  if ''[Symbol?iterator]
    assert.strictEqual '' + ''[Symbol.iterator]!, '[object String Iterator]', 'String Iterator -> `String Iterator`'
  if []entries
    assert.strictEqual '' + []entries!, '[object Array Iterator]', 'Array Iterator -> `Array Iterator`'
  if Set?entries
    assert.strictEqual '' + new Set!entries!, '[object Set Iterator]', 'Set Iterator -> `Set Iterator`'
  if Map?entries
    assert.strictEqual '' + new Map!entries!, '[object Map Iterator]', 'Map Iterator -> `Map Iterator`'
  assert.strictEqual '' + Math, '[object Math]', 'Math -> `Math`'
  if JSON?
    assert.strictEqual toString.call(JSON), '[object JSON]', 'JSON -> `JSON`'
  class Class
    @::[Symbol?toStringTag] = \Class
  assert.strictEqual '' + new Class, '[object Class]', 'user class instance -> [Symbol.toStringTag]'