import { withTemporaryProperty } from '../helpers/restore-property.cjs';

// A store preserves its own value. Realm-looking keys above a user property do
// not turn that value into the global object, even when the source starts there.
QUnit.test('stored user receiver: reads keep their source', assert => {
  const log = [];
  const host = { get self() {
    log.push('self');
    return { href: '/own', list: [4, 9] };
  } };
  withTemporaryProperty(globalThis, 'e2eStoredHost', host, () => {
    let held;
    assert.same((held = globalThis.e2eStoredHost).self.href, '/own');
    assert.same(held, host);
    assert.deepEqual(log, ['self']);
  });
});

QUnit.test('stored user receiver: optional probes observe the user value', assert => {
  for (const self of [null, undefined, { list: [4, 9] }]) {
    withTemporaryProperty(globalThis, 'e2eStoredHost', { self }, () => {
      let held, inner;
      assert.same((held = globalThis.e2eStoredHost).self?.list.at(-1), self ? 9 : undefined);
      assert.same(held.self, self);
      assert.same((held = (inner = globalThis.e2eStoredHost).self)?.list.at(-1), self ? 9 : undefined);
      assert.same(held, self);
      assert.same(inner.self, self);
    });
  }
});

QUnit.test('stored user receiver: write and delete keep the user object', assert => {
  const log = [];
  const own = {};
  const host = { get window() {
    log.push('window');
    return own;
  } };
  withTemporaryProperty(globalThis, 'e2eStoredHost', host, () => {
    withTemporaryProperty(globalThis, 'e2eStoredSlot', 17, () => {
      let held;
      (held = globalThis.e2eStoredHost).window.e2eStoredSlot = (log.push('rhs'), 23);
      assert.same(held, host);
      assert.same(own.e2eStoredSlot, 23);
      assert.same(globalThis.e2eStoredSlot, 17);
      assert.same(delete (held = globalThis.e2eStoredHost).window.e2eStoredSlot, true);
      assert.same(held, host);
      assert.same(Object.hasOwn(own, 'e2eStoredSlot'), false);
      assert.same(globalThis.e2eStoredSlot, 17);
      assert.deepEqual(log, ['window', 'rhs', 'window']);
    });
  });
});

QUnit.test('stored user receiver: iterator read and call preserve receiver', assert => {
  const log = [];
  const own = { [Symbol.iterator]() {
    log.push(this === own ? 'this' : 'wrong');
    return { next() { return { value: 31, done: false }; } };
  } };
  withTemporaryProperty(globalThis, 'e2eStoredHost', { self: own }, () => {
    let held;
    const method = (held = globalThis.e2eStoredHost).self[Symbol.iterator];
    assert.same(held.self, own);
    assert.same(method.call(own).next().value, 31);
    assert.same((held = globalThis.e2eStoredHost).self[Symbol.iterator]().next().value, 31);
    assert.same(held.self, own);
    assert.deepEqual(log, ['this', 'this']);
  });
});

QUnit.test('stored user receiver: destructuring keeps one source read and the store', assert => {
  const log = [];
  const list = [4, 9];
  const host = { get self() {
    log.push('self');
    return { list };
  } };
  withTemporaryProperty(globalThis, 'e2eStoredHost', host, () => {
    let held;
    const { at, length } = (held = globalThis.e2eStoredHost).self.list;
    assert.same(at.call(list, -1), 9);
    assert.same(length, 2);
    assert.same(held, host);
    let includes, size;
    // eslint-disable-next-line prefer-const -- Exercise the destructuring assignment channel.
    ({ includes, length: size } = (held = globalThis.e2eStoredHost).self.list);
    assert.same(held, host);
    assert.same(includes.call(list, 4), true);
    assert.same(size, 2);
    assert.deepEqual(log, ['self', 'self']);
  });
});

QUnit.test('stored user receiver: nested stores retain prefixes, setters and throws', assert => {
  const log = [];
  const host = { get self() {
    log.push('self');
    throw new RangeError('read');
  } };
  let saved;
  const box = { set value(value) {
    log.push('store');
    saved = value;
  } };
  withTemporaryProperty(globalThis, 'e2eStoredHost', host, () => {
    let held;
    assert.throws(() => (box.value = (log.push('prefix'), held = globalThis.e2eStoredHost)).self?.list.at(0), RangeError);
    assert.same(held, host);
    assert.same(saved, host);
    assert.deepEqual(log, ['prefix', 'store', 'self']);
  });
});
