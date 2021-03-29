import { GLOBAL, STRICT } from '../helpers/constants';

QUnit.test('Object#toString', assert => {
  const { toString } = Object.prototype;
  const Symbol = GLOBAL.Symbol || {};
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);
  assert.nonEnumerable(Object.prototype, 'toString');
  if (STRICT) {
    assert.strictEqual(toString.call(null), '[object Null]', 'null -> `Null`');
    assert.strictEqual(toString.call(undefined), '[object Undefined]', 'undefined -> `Undefined`');
  }
  assert.strictEqual(toString.call(true), '[object Boolean]', 'bool -> `Boolean`');
  assert.strictEqual(toString.call('string'), '[object String]', 'string -> `String`');
  assert.strictEqual(toString.call(7), '[object Number]', 'number -> `Number`');
  assert.strictEqual(`${ {} }`, '[object Object]', '{} -> `Object`');
  assert.strictEqual(toString.call([]), '[object Array]', ' [] -> `Array`');
  assert.strictEqual(toString.call(() => { /* empty */ }), '[object Function]', 'function -> `Function`');
  assert.strictEqual(toString.call(/./), '[object RegExp]', 'regexp -> `RegExp`');
  assert.strictEqual(toString.call(new TypeError()), '[object Error]', 'new TypeError -> `Error`');
  assert.strictEqual(toString.call(function () {
    return arguments;
  }()), '[object Arguments]', 'arguments -> `Arguments`');
  const constructors = [
    'Array',
    'RegExp',
    'Boolean',
    'String',
    'Number',
    'Error',
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array',
    'ArrayBuffer',
  ];
  for (const name of constructors) {
    const Constructor = GLOBAL[name];
    if (Constructor) {
      assert.strictEqual(toString.call(new Constructor(1)), `[object ${ name }]`, `new ${ name }(1) -> \`${ name }\``);
    }
  }
  if (GLOBAL.DataView) {
    assert.strictEqual(`${ new DataView(new ArrayBuffer(1)) }`, '[object DataView]', 'dataview -> `DataView`');
  }
  if (GLOBAL.Set) {
    assert.strictEqual(`${ new Set() }`, '[object Set]', 'set -> `Set`');
  }
  if (GLOBAL.Map) {
    assert.strictEqual(`${ new Map() }`, '[object Map]', 'map -> `Map`');
  }
  if (GLOBAL.WeakSet) {
    assert.strictEqual(`${ new WeakSet() }`, '[object WeakSet]', 'weakset -> `WeakSet`');
  }
  if (GLOBAL.WeakMap) {
    assert.strictEqual(`${ new WeakMap() }`, '[object WeakMap]', 'weakmap -> `WeakMap`');
  }
  if (GLOBAL.Promise) {
    assert.strictEqual(`${ new Promise((() => { /* empty */ })) }`, '[object Promise]', 'promise -> `Promise`');
  }
  if (''[Symbol.iterator]) {
    assert.strictEqual(`${ ''[Symbol.iterator]() }`, '[object String Iterator]', 'String Iterator -> `String Iterator`');
  }
  if ([].entries) {
    assert.strictEqual(`${ [].entries() }`, '[object Array Iterator]', 'Array Iterator -> `Array Iterator`');
  }
  if (GLOBAL.Set && Set.entries) {
    assert.strictEqual(`${ new Set().entries() }`, '[object Set Iterator]', 'Set Iterator -> `Set Iterator`');
  }
  if (GLOBAL.Map && Map.entries) {
    assert.strictEqual(`${ new Map().entries() }`, '[object Map Iterator]', 'Map Iterator -> `Map Iterator`');
  }
  assert.strictEqual(`${ Math }`, '[object Math]', 'Math -> `Math`');
  assert.strictEqual(`${ JSON }`, '[object JSON]', 'JSON -> `JSON`');
  function Class() { /* empty */ }
  Class.prototype[Symbol.toStringTag] = 'Class';
  assert.strictEqual(`${ new Class() }`, '[object Class]', 'user class instance -> [Symbol.toStringTag]');
});
