// Global proxies: globalThis - accessing globals and statics through it
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

QUnit.test('globalThis.WeakMap', assert => {
  const wm = new globalThis.WeakMap();
  const key = {};
  wm.set(key, 'val');
  assert.same(wm.get(key), 'val');
});

// === IIFE-rooted proxy chains: side-effect preservation ===
// the receiver chain folds to the polyfilled global, but an IIFE chain root carries observable
// setup that must survive the fold (and the inner globalThis must keep its own polyfill without
// crashing the text-transform queue)
QUnit.test('IIFE-proxy Symbol.iterator value-ref: side effect runs once', assert => {
  let calls = 0;
  const it = (() => {
    calls++;
    return globalThis;
  })().Symbol.iterator;
  assert.same(calls, 1);
  assert.same(it, Symbol.iterator);
});

QUnit.test('IIFE-proxy Promise.resolve: side effect runs once', assert => {
  const async = assert.async();
  let calls = 0;
  (() => {
    calls++;
    return globalThis;
  })().Promise.resolve(7).then(v => {
    assert.same(calls, 1);
    assert.same(v, 7);
    async();
  });
});

QUnit.test('IIFE-proxy Array.from: side effect runs once', assert => {
  let calls = 0;
  const out = (() => {
    calls++;
    return globalThis;
  })().Array.from([1, 2, 3]);
  assert.same(calls, 1);
  assert.deepEqual(out, [1, 2, 3]);
});

QUnit.test('IIFE-proxy Symbol.iterator as computed key: side effect runs once', assert => {
  let calls = 0;
  const arr = [10, 20];
  const method = arr[(() => {
    calls++;
    return globalThis;
  })().Symbol.iterator];
  assert.same(calls, 1);
  assert.same(typeof method, 'function');
  assert.deepEqual(Array.from(method.call(arr)), [10, 20]);
});

QUnit.test('IIFE-proxy Symbol.iterator in operator: side effect runs once', assert => {
  let calls = 0;
  const arr = [1];
  const has = (() => {
    calls++;
    return globalThis;
  })().Symbol.iterator in arr;
  assert.same(calls, 1);
  assert.true(has);
});

// intermediate hops use `.globalThis.` - `self` / `window` don't exist in Node, those hop
// spellings are covered by transpiler fixtures instead
QUnit.test('IIFE-proxy with intermediate hop: side effect runs once', assert => {
  let calls = 0;
  const it = (() => {
    calls++;
    return globalThis;
  })().globalThis.Symbol.iterator;
  assert.same(calls, 1);
  assert.same(it, Symbol.iterator);
});

QUnit.test('IIFE-proxy behind chain assignment: assignment and side effect preserved', assert => {
  let calls = 0;
  let captured;
  const it = (captured = (() => {
    calls++;
    return globalThis;
  })()).Symbol.iterator;
  assert.same(calls, 1);
  assert.same(captured, globalThis);
  assert.same(it, Symbol.iterator);
});

QUnit.test('nested IIFE-proxy: side effect runs once', assert => {
  let calls = 0;
  const it = (() => (() => {
    calls++;
    return globalThis;
  })())().Symbol.iterator;
  assert.same(calls, 1);
  assert.same(it, Symbol.iterator);
});

QUnit.test('IIFE-proxy with optional hop: side effect runs once', assert => {
  const async = assert.async();
  let calls = 0;
  (() => {
    calls++;
    return globalThis;
  })()?.Promise.resolve(11).then(v => {
    assert.same(calls, 1);
    assert.same(v, 11);
    async();
  });
});
