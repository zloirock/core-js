// Global proxies: globalThis — accessing globals and statics through it
// === globalThis ===
QUnit.test('globalThis.Promise', assert => {
  const async = assert.async();
  new globalThis.Promise(resolve => resolve(1)).then(v => {
    assert.same(v, 1);
    async();
  });
});

QUnit.test('globalThis.Map', assert => {
  const map = new globalThis.Map([['a', 1]]);
  assert.same(map.get('a'), 1);
});

QUnit.test('globalThis.Set', assert => {
  const set = new globalThis.Set([1, 2, 3]);
  assert.same(set.size, 3);
});

QUnit.test('globalThis.Symbol.iterator', assert => {
  assert.notSame(globalThis.Symbol.iterator, undefined);
});

QUnit.test('globalThis.Array.from', assert => {
  assert.deepEqual(globalThis.Array.from([1, 2, 3]), [1, 2, 3]);
});

QUnit.test('globalThis.Object.assign', assert => {
  assert.deepEqual(globalThis.Object.assign({}, { a: 1 }), { a: 1 });
});

QUnit.test('globalThis.Object.keys', assert => {
  assert.deepEqual(globalThis.Object.keys({ a: 1, b: 2 }), ['a', 'b']);
});

QUnit.test('globalThis.parseInt', assert => {
  assert.same(globalThis.parseInt('42', 10), 42);
});

QUnit.test('globalThis.parseFloat', assert => {
  assert.same(globalThis.parseFloat('3.14'), 3.14);
});

QUnit.test('globalThis.URL', assert => {
  const url = new globalThis.URL('https://example.com');
  assert.same(url.hostname, 'example.com');
});

QUnit.test('globalThis.structuredClone', assert => {
  const obj = { a: [1, 2] };
  const clone = globalThis.structuredClone(obj);
  assert.deepEqual(clone, obj);
  assert.notSame(clone.a, obj.a);
});

