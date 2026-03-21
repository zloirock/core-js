// Globals: constructors and functions replaced with pure imports

// constructors
QUnit.test('globals: Promise', assert => {
  const p = new Promise(resolve => resolve(42));
  assert.true(p instanceof Promise);
  const async = assert.async();
  p.then(v => {
    assert.same(v, 42);
    async();
  });
});

QUnit.test('globals: Map', assert => {
  const map = new Map([['a', 1], ['b', 2]]);
  assert.same(map.size, 2);
  assert.same(map.get('a'), 1);
  assert.true(map.has('b'));
});

QUnit.test('globals: Set', assert => {
  const set = new Set([1, 2, 3, 2, 1]);
  assert.same(set.size, 3);
  assert.true(set.has(1));
  assert.false(set.has(4));
});

QUnit.test('globals: WeakMap', assert => {
  const key = {};
  const wm = new WeakMap([[key, 42]]);
  assert.same(wm.get(key), 42);
});

QUnit.test('globals: URL', assert => {
  const url = new URL('https://example.com/path?q=1');
  assert.same(url.hostname, 'example.com');
  assert.same(url.pathname, '/path');
});

QUnit.test('globals: URLSearchParams', assert => {
  const params = new URLSearchParams('a=1&b=2');
  assert.same(params.get('a'), '1');
  assert.same(params.get('b'), '2');
});

QUnit.test('globals: AggregateError', assert => {
  const err = new AggregateError([new Error('a'), new Error('b')], 'msg');
  assert.same(err.message, 'msg');
  assert.same(err.errors.length, 2);
});

QUnit.test('globals: globalThis', assert => {
  assert.same(typeof globalThis, 'object');
  assert.same(globalThis.Math, Math);
});

QUnit.test('globals: structuredClone', assert => {
  const obj = { a: 1, b: [2, 3] };
  const clone = structuredClone(obj);
  assert.deepEqual(clone, obj);
  assert.notSame(clone, obj);
  assert.notSame(clone.b, obj.b);
});

QUnit.test('globals: DOMException', assert => {
  const err = new DOMException('test', 'DataError');
  assert.true(err instanceof DOMException);
  assert.same(err.message, 'test');
  assert.same(err.name, 'DataError');
});

QUnit.test('globals: DOMException predefined codes', assert => {
  const err = new DOMException('fail', 'NotFoundError');
  assert.same(err.code, DOMException.NOT_FOUND_ERR);
});

// functions
QUnit.test('globals: atob / btoa', assert => {
  assert.same(btoa('hello'), 'aGVsbG8=');
  assert.same(atob('aGVsbG8='), 'hello');
});

QUnit.test('globals: queueMicrotask', assert => {
  assert.isFunction(queueMicrotask);
  const async = assert.async();
  let called = false;
  queueMicrotask(() => {
    called = true;
    assert.true(called);
    async();
  });
});

QUnit.test('globals: parseInt / parseFloat', assert => {
  assert.same(parseInt('10', 10), 10);
  assert.same(parseFloat('3.14'), 3.14);
});

QUnit.test('globals: Iterator', assert => {
  assert.isFunction(Iterator);
  assert.isFunction(Iterator.from);
});

QUnit.test('globals: Symbol', assert => {
  const s = Symbol('test');
  assert.notSame(s, undefined);
  assert.same(s.description, 'test');
});
