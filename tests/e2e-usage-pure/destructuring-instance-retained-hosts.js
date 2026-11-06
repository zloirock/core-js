import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('a captured constructor getter retains a later static assignment', assert => {
  const events = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- exercise constructor inference through a class getter
  class Source {
    static get value() {
      events.push('get');
      return Array;
    }
  }
  let reversed, of;
  // eslint-disable-next-line prefer-const -- exercise the ordered assignment capture
  ({ prototype: { toReversed: reversed }, of } = Source.value);
  assert.deepEqual(reversed.call([1, 2]), [2, 1]);
  assert.deepEqual(of(3, 4), [3, 4]);
  assert.arrayEqual(events, ['get']);
});

QUnit.test('nested instance assignments retain prefixed receivers', assert => {
  const events = [];
  const array = [3, [7]];
  const host = { get m() {
    events.push('get');
    return array;
  } };
  let at = null;
  ({ m: { at } } = (events.push(at), events.push('prefix'), host));
  assert.same(at.call(array, 0), 3);
  assert.deepEqual(events, [null, 'prefix', 'get']);
});

QUnit.test('nested instance loop initializers retain prefixed receivers', assert => {
  const events = [];
  const array = [3, [7]];
  const host = { get m() {
    events.push('get');
    return array;
  } };
  // eslint-disable-next-line no-var -- the var loop initializer is the host under test
  for (var { m: { at } } = (events.push('prefix'), host), i = 0; i < 1; i++) {
    assert.same(at.call(array, 0), 3);
  }
  assert.deepEqual(events, ['prefix', 'get']);
});

QUnit.test('nested instance defaults keep their prefix in the default arm', assert => {
  let calls = 0;
  function read({ m: { at } } = (calls++, { m: [3] })) { return at; }
  assert.same(read().call([3], 0), 3);
  assert.same(calls, 1);
  function supplied() { return 'own'; }
  assert.same(read({ m: { at: supplied } }), supplied);
  assert.same(calls, 1);
  assert.same(read({ m: { at: undefined } }), undefined);
});

QUnit.test('nested instance assignments keep sibling reads after their binding', assert => {
  const events = [];
  const array = [3, 7];
  let at = null;
  let x = null;
  const host = {
    get m() {
      events.push(x, 'm');
      return array;
    },
    get x() { events.push(typeof at); return 9; },
  };
  ({ m: { at }, x } = host);
  assert.same(at.call(array, 1), 7);
  assert.same(x, 9);
  assert.deepEqual(events, [null, 'm', 'function']);
});

QUnit.test('retained instance assignments preserve supplied object properties', assert => {
  let reads = 0;
  function custom() { return 'own'; }
  const host = { m: { get at() {
    reads++;
    return custom;
  } }, x: 9 };
  let at, x;
  ({ m: { at }, x } = (reads++, host));
  assert.same(at, custom);
  assert.same(x, 9);
  assert.same(reads, 2);
  ({ m: { at }, x } = { m: { at: undefined }, x: 10 });
  assert.same(at, undefined);
  assert.same(x, 10);
});

QUnit.test('several instance leaves share a default receiver evaluation', assert => {
  let calls = 0;
  const array = [3, [7]];
  function make() {
    calls++;
    return array;
  }
  const { A: { at, flat } = make() } = {};
  assert.same(at.call(array, 0), 3);
  assert.deepEqual(flat.call(array), [3, 7]);
  assert.same(calls, 1);
  function customAt() { return 'at'; }
  function customFlat() { return 'flat'; }
  const supplied = { at: customAt, flat: customFlat };
  const { A: { at: ownAt, flat: ownFlat } = make() } = { A: supplied };
  assert.same(ownAt, customAt);
  assert.same(ownFlat, customFlat);
  assert.same(calls, 1);
});

QUnit.test('shared nested default captures belong to each invocation', assert => {
  let reads = 0;
  function read(depth) {
    const array = [depth, [7]];
    Object.defineProperty(array, 'at', { get() {
      reads++;
      if (depth) assert.deepEqual(read(0), [0, 7]);
      return function () { return depth; };
    } });
    function make() { return array; }
    const { A: { at, flat } = make() } = {};
    return [at.call(array, 0), flat.call(array)[1]];
  }
  assert.deepEqual(read(1), [1, 7]);
  assert.same(reads, 2);
});

QUnit.test('a symbol iterator instance claim survives a static sibling mirror', assert => {
  let reads = 0;
  function iterator() { return 7; }
  const key = Symbol.iterator;
  const previous = Object.getOwnPropertyDescriptor(Array, key);
  restoreProperty(iterator, 'name', undefined);
  restoreProperty(Array, key, { configurable: true, get() {
    reads++;
    return iterator;
  } });
  try {
    const { of, [Symbol.iterator]: { name } } = Array;
    assert.same(of(3)[0], 3);
    assert.same(typeof name, 'string');
    assert.same(reads, 1);
  } finally {
    restoreProperty(Array, key, previous);
  }
  assert.throws(() => {
    const { of, [Symbol.iterator]: { name } } = Array;
    return [of, name];
  }, TypeError, 'an unpatched Array constructor has no iterator method to destructure');
});

QUnit.test('a sentinel receiver memo keeps an independent declarator claim', assert => {
  const events = [];
  const previous = Object.getOwnPropertyDescriptor(Array.prototype, 'last');
  const previousReceiver = Object.getOwnPropertyDescriptor(globalThis, 'deferredDeclarationArray');
  restoreProperty(globalThis, 'deferredDeclarationArray', { configurable: true, value: [4] });
  restoreProperty(Array.prototype, 'last', { configurable: true, get() {
    events.push('last');
    return { t: 7 };
  } });
  function effect() { events.push('key'); }
  function read() {
    const { y: { last: { t }, [(effect(), 'fill')]: fill } } = { y: [1] },
          // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- a foreign receiver keeps the opaque memo route
          { at } = deferredDeclarationArray;
    return [t, fill.call([1], 6)[0], at.call([4], 0)];
  }
  try {
    assert.deepEqual(read(), [7, 6, 4]);
    assert.deepEqual(events, ['last', 'key']);
  } finally {
    restoreProperty(Array.prototype, 'last', previous);
    restoreProperty(globalThis, 'deferredDeclarationArray', previousReceiver);
  }
});

QUnit.test('unbraced nested var claims retain their receiver and conditional scope', assert => {
  const events = [];
  const after = { includes: undefined, other: { q: 99 } };
  function fallback() { return 'fallback'; }
  function read(condition, src) {
    function effect() {
      events.push('key');
      src = after;
    }
    // eslint-disable-next-line no-var -- the unbraced var declaration is the host under test
    if (condition) var { y: { other: { q }, [(effect(), 'includes')]: includes = fallback } } = { y: src };
    return [q, includes, src === after];
  }
  const array = [1, 2];
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the native sibling slot belongs to this receiver
  array.other = { q: 8 };
  const first = read(true, array);
  assert.same(first[0], 8);
  assert.same(first[1].call(array, 2), true);
  assert.same(first[2], true);
  assert.deepEqual(read(false, array), [undefined, undefined, false]);
  const supplied = read(true, { includes: undefined, other: { q: 9 } });
  assert.same(supplied[0], 9);
  assert.same(supplied[1], fallback);
  assert.deepEqual(events, ['key', 'key']);
});

QUnit.test('an opaque instance memo keeps its receiverless static sibling', assert => {
  // eslint-disable-next-line unicorn/no-duplicate-logical-operands -- the constructor selection is the source shape under test
  const { name, groupBy } = Map || Map;
  assert.same(typeof name, 'string');
  assert.deepEqual(groupBy([1, 2, 3], value => value % 2).get(1), [1, 3]);
  const { groupBy: realmGroupBy, name: realmName } = globalThis.Map || Map;
  assert.same(typeof realmName, 'string');
  assert.deepEqual(realmGroupBy([2, 4], value => value % 2).get(0), [2, 4]);
});
