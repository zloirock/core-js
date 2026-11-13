import { DESCRIPTORS, FIREFOX_LEGACY_PROXY, OBJECT_NAMES_ORDER } from '../helpers/constants.js';

import Symbol from 'core-js-pure/es/symbol';
import assign from 'core-js-pure/es/object/assign';
import create from 'core-js-pure/es/object/create';
import defineProperty from 'core-js-pure/es/object/define-property';
import values from 'core-js-pure/es/object/values';

QUnit.test('Object.values', assert => {
  assert.isFunction(values);
  assert.arity(values, 1);
  assert.name(values, 'values');
  assert.deepEqual(values({ q: 1, w: 2, e: 3 }), [1, 2, 3]);
  assert.deepEqual(values(new String('qwe')), ['q', 'w', 'e']);
  assert.deepEqual(values(assign(create({ q: 1, w: 2, e: 3 }), { a: 4, s: 5, d: 6 })), [4, 5, 6]);
  assert.deepEqual(values({ valueOf: 42 }), [42], 'IE enum keys bug');
  try {
    assert.deepEqual(Function('values', `
      return values({ a: 1, get b() {
        delete this.c;
        return 2;
      }, c: 3 });
   `)(values), [1, 2]);
  } catch { /* empty */ }
  try {
    assert.deepEqual(Function('values', `
      return values({ a: 1, get b() {
        Object.defineProperty(this, "c", {
          value: 4,
          enumerable: false
        });
        return 2;
      }, c: 3 });
    `)(values), [1, 2]);
  } catch { /* empty */ }
});

if (DESCRIPTORS) QUnit.test('Object.values enumerability changes', assert => {
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
    if (OBJECT_NAMES_ORDER) assert.deepEqual(values(source), [1, 2], 'enumerability is checked when visiting each key');
  }
  const numeric = create(null);
  numeric[2] = 2;
  assert.deepEqual(values(numeric), [2], 'numeric key on a fresh null-prototype object');
  const source = create(null);
  source[1] = 1;
  defineProperty(source, '2', { value: 2 });
  source[3] = 3;
  assert.deepEqual(values(source), [1, 3], 'non-enumerable numeric keys on null-prototype objects');
});

// eslint-disable-next-line es/no-proxy -- testing
if (typeof Proxy == 'function' && !FIREFOX_LEGACY_PROXY) QUnit.test('Object.values proxy operation order', assert => {
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
  assert.deepEqual(values(source), [2, 1]);
  assert.deepEqual(log, ['ownKeys', 'descriptor:b', 'get:b', 'descriptor:hidden', 'descriptor:a', 'get:a']);
});

if (FIREFOX_LEGACY_PROXY) QUnit.test('Object.values legacy proxy operation order', assert => {
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
  assert.deepEqual(values(source), [2, 1]);
  assert.deepEqual(log, ['getOwnPropertyNames', 'descriptor:b', 'get:b', 'descriptor:hidden', 'descriptor:a', 'get:a']);
});
