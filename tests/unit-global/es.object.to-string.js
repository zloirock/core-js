import { GLOBAL } from '../helpers/constants.js';

QUnit.test('Object#toString', assert => {
  const { toString } = Object.prototype;
  const Symbol = GLOBAL.Symbol || {};
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);
  assert.nonEnumerable(Object.prototype, 'toString');

  assert.same(toString.call(null), '[object Null]', 'null -> `Null`');
  assert.same(toString.call(undefined), '[object Undefined]', 'undefined -> `Undefined`');

  assert.same(toString.call(true), '[object Boolean]', 'bool -> `Boolean`');
  assert.same(toString.call('string'), '[object String]', 'string -> `String`');
  assert.same(toString.call(7), '[object Number]', 'number -> `Number`');
  assert.same(`${ {} }`, '[object Object]', '{} -> `Object`');
  assert.same(toString.call([]), '[object Array]', ' [] -> `Array`');
  assert.same(toString.call(() => { /* empty */ }), '[object Function]', 'function -> `Function`');
  assert.same(toString.call(/./), '[object RegExp]', 'regexp -> `RegExp`');
  assert.same(toString.call(new TypeError()), '[object Error]', 'new TypeError -> `Error`');
  assert.same(toString.call(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
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
      assert.same(toString.call(new Constructor(1)), `[object ${ name }]`, `new ${ name }(1) -> \`${ name }\``);
    }
  }
  if (GLOBAL.DataView) {
    assert.same(`${ new DataView(new ArrayBuffer(1)) }`, '[object DataView]', 'dataview -> `DataView`');
  }
  if (GLOBAL.Set) {
    assert.same(`${ new Set() }`, '[object Set]', 'set -> `Set`');
  }
  if (GLOBAL.Map) {
    assert.same(`${ new Map() }`, '[object Map]', 'map -> `Map`');
  }
  if (GLOBAL.WeakSet) {
    assert.same(`${ new WeakSet() }`, '[object WeakSet]', 'weakset -> `WeakSet`');
  }
  if (GLOBAL.WeakMap) {
    assert.same(`${ new WeakMap() }`, '[object WeakMap]', 'weakmap -> `WeakMap`');
  }
  if (GLOBAL.Promise) {
    assert.same(`${ new Promise((() => { /* empty */ })) }`, '[object Promise]', 'promise -> `Promise`');
  }
  if (''[Symbol.iterator]) {
    assert.same(`${ ''[Symbol.iterator]() }`, '[object String Iterator]', 'String Iterator -> `String Iterator`');
  }
  if ([].entries) {
    assert.same(`${ [].entries() }`, '[object Array Iterator]', 'Array Iterator -> `Array Iterator`');
  }
  if (GLOBAL.Set && Set.prototype.entries) {
    assert.same(`${ new Set().entries() }`, '[object Set Iterator]', 'Set Iterator -> `Set Iterator`');
  }
  if (GLOBAL.Map && Map.prototype.entries) {
    assert.same(`${ new Map().entries() }`, '[object Map Iterator]', 'Map Iterator -> `Map Iterator`');
  }
  assert.same(`${ Math }`, '[object Math]', 'Math -> `Math`');
  if (GLOBAL.JSON) {
    assert.same(`${ JSON }`, '[object JSON]', 'JSON -> `JSON`');
  }
  function Class() { /* empty */ }
  Class.prototype[Symbol.toStringTag] = 'Class';
  assert.same(`${ new Class() }`, '[object Class]', 'user class instance -> [Symbol.toStringTag]');
});
