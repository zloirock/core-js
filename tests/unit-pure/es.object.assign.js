import { DESCRIPTORS, FIREFOX_LEGACY_PROXY, FIREFOX_SPLIT_OWN_KEYS, OBJECT_NAMES_ORDER, SAFARI_PROXY_SYMBOL_ORDER } from '../helpers/constants.js';

import Symbol from 'core-js-pure/es/symbol';
import create from 'core-js-pure/es/object/create';
import defineProperty from 'core-js-pure/es/object/define-property';
import keys from 'core-js-pure/es/object/keys';
import assign from 'core-js-pure/es/object/assign';

QUnit.test('Object.assign', assert => {
  assert.isFunction(assign);
  assert.arity(assign, 2);
  assert.name(assign, 'assign');
  let object = { q: 1 };
  assert.same(object, assign(object, { bar: 2 }), 'assign return target');
  assert.same(object.bar, 2, 'assign define properties');
  assert.deepEqual(assign({}, { q: 1 }, { w: 2 }), { q: 1, w: 2 });
  assert.deepEqual(assign({}, 'qwe'), { 0: 'q', 1: 'w', 2: 'e' });
  assert.throws(() => assign(null, { q: 1 }), TypeError);
  assert.throws(() => assign(undefined, { q: 1 }), TypeError);
  let string = assign('qwe', { q: 1 });
  assert.same(typeof string, 'object');
  assert.same(String(string), 'qwe');
  assert.same(string.q, 1);
  assert.same(assign({}, { valueOf: 42 }).valueOf, 42, 'IE enum keys bug');
  if (DESCRIPTORS) {
    object = { baz: 1 };
    assign(object, defineProperty({}, 'bar', {
      get() {
        return this.baz + 1;
      },
    }));
    assert.same(object.bar, undefined, "assign don't copy descriptors");
    object = { a: 'a' };
    const c = Symbol('c');
    const d = Symbol('d');
    object[c] = 'c';
    defineProperty(object, 'b', { value: 'b' });
    defineProperty(object, d, { value: 'd' });
    const object2 = assign({}, object);
    assert.same(object2.a, 'a', 'a');
    assert.same(object2.b, undefined, 'b');
    assert.same(object2[c], 'c', 'c');
    assert.same(object2[d], undefined, 'd');
    try {
      assert.same(Function('assign', `
        return assign({ b: 1 }, { get a() {
          delete this.b;
        }, b: 2 });
      `)(assign).b, 1);
    } catch { /* empty */ }
    try {
      assert.same(Function('assign', `
        return assign({ b: 1 }, { get a() {
          Object.defineProperty(this, "b", {
            value: 3,
            enumerable: false
          });
        }, b: 2 });
      `)(assign).b, 1);
    } catch { /* empty */ }
  }
  string = 'abcdefghijklmnopqrst';
  const result = {};
  for (let i = 0, { length } = string; i < length; ++i) {
    const chr = string.charAt(i);
    result[chr] = chr;
  }
  assert.same(keys(assign({}, result)).join(''), string);
});

if (DESCRIPTORS) QUnit.test('Object.assign enumerability changes', assert => {
  for (const prototype of [Object.prototype, null]) {
    const source = create(prototype);
    const symbol = Symbol('enumerability');
    defineProperty(source, 'a', {
      enumerable: true,
      get() {
        defineProperty(source, 'b', { enumerable: true });
        defineProperty(source, symbol, { enumerable: true });
        defineProperty(source, 'c', { enumerable: false });
        delete source.d;
        source.e = 5;
        return 1;
      },
    });
    defineProperty(source, 'b', { value: 2, configurable: true });
    defineProperty(source, 'c', { value: 3, enumerable: true, configurable: true });
    source.d = 4;
    defineProperty(source, symbol, { value: 6, configurable: true });
    defineProperty(source, 'hidden', { get() { throw new Error('hidden getter'); } });
    const expected = { a: 1, b: 2 };
    expected[symbol] = 6;
    if (OBJECT_NAMES_ORDER) assert.deepEqual(assign({}, source), expected, 'enumerability is checked when visiting each key');
  }
  const numeric = create(null);
  numeric[2] = 2;
  assert.deepEqual(assign({}, numeric), { 2: 2 }, 'numeric key on a fresh null-prototype object');
  const source = create(null);
  source[1] = 1;
  defineProperty(source, '2', { value: 2 });
  source[3] = 3;
  assert.deepEqual(assign({}, source), { 1: 1, 3: 3 }, 'non-enumerable numeric keys on null-prototype objects');
});

// eslint-disable-next-line es/no-proxy -- testing
if (typeof Proxy == 'function' && !FIREFOX_LEGACY_PROXY) QUnit.test('Object.assign proxy operation order', assert => {
  const log = [];
  const symbol = Symbol('proxy key');
  const nativeSymbol = typeof symbol == 'symbol';
  // eslint-disable-next-line es/no-proxy -- testing
  const source = new Proxy({ a: 1, b: 2 }, {
    ownKeys() {
      log.push('ownKeys');
      return nativeSymbol ? ['b', symbol, 'hidden', 'a'] : ['b', 'hidden', 'a'];
    },
    getOwnPropertyDescriptor(target, key) {
      log.push(`descriptor:${ key === symbol ? 'symbol' : key }`);
      return { value: target[key], enumerable: key !== 'hidden', configurable: true };
    },
    get(target, key) {
      log.push(`get:${ key === symbol ? 'symbol' : key }`);
      return key === symbol ? 6 : target[key];
    },
  });
  const expected = { b: 2, a: 1 };
  if (nativeSymbol) expected[symbol] = 6;
  assert.deepEqual(assign({}, source), expected);
  const splitOwnKeys = FIREFOX_SPLIT_OWN_KEYS && log[1] === 'ownKeys';
  if (splitOwnKeys) {
    assert.same(log.shift(), 'ownKeys', 'extra ownKeys without native Reflect.ownKeys');
  }
  assert.deepEqual(log, nativeSymbol
    ? splitOwnKeys || SAFARI_PROXY_SYMBOL_ORDER
      ? ['ownKeys', 'descriptor:b', 'get:b', 'descriptor:hidden', 'descriptor:a', 'get:a', 'descriptor:symbol', 'get:symbol']
      : ['ownKeys', 'descriptor:b', 'get:b', 'descriptor:symbol', 'get:symbol', 'descriptor:hidden', 'descriptor:a', 'get:a']
    : ['ownKeys', 'descriptor:b', 'get:b', 'descriptor:hidden', 'descriptor:a', 'get:a']);
});

if (FIREFOX_LEGACY_PROXY) QUnit.test('Object.assign legacy proxy operation order', assert => {
  const log = [];
  // eslint-disable-next-line es/no-proxy -- testing
  const source = new Proxy({ a: 1, b: 2, hidden: 3 }, {
    getOwnPropertyNames() {
      log.push('getOwnPropertyNames');
      return ['b', 'hidden', 'a'];
    },
    getOwnPropertyDescriptor(target, key) {
      log.push(`descriptor:${ key }`);
      return { value: target[key], enumerable: key !== 'hidden', configurable: true };
    },
    get(target, key) {
      log.push(`get:${ key }`);
      return target[key];
    },
  });
  assert.deepEqual(assign({}, source), { b: 2, a: 1 });
  assert.deepEqual(log, ['getOwnPropertyNames', 'getOwnPropertyNames', 'descriptor:b', 'get:b', 'descriptor:hidden', 'descriptor:a', 'get:a']);
});
