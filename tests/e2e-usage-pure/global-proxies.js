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

// a proxy-global constructor-static consumed by an outer hop before an instance method
// (`(eff(), globalThis).Set.length.toFixed(2)`): the receiver collapses `globalThis.Set -> _Set` and the
// instance dispatch nests AROUND it. the SE prefix runs once and the chain yields a value - a flat .length
// hop keeps this engine-independent (ctor arity is ES1). guards the unplugin compose crash on the buried
// `globalThis.Set` needle when the mid-chain ctor-static was wrongly collapsed into the instance receiver
QUnit.test('global-proxy: mid-chain ctor-static under SE prefix composes with instance method', assert => {
  const log = [];
  const eff = () => log.push('e');
  const r = (eff(), globalThis).Set.length.toFixed(2);
  assert.same(typeof r, 'string');
  assert.true(/\.00$/.test(r));
  assert.deepEqual(log, ['e']);
});

// an effectful IIFE buried in a sequence below a forwarder member and a static
// (`(0, (() => { c++; return globalThis; })().self).Array.from(...)`): the subsumption walk must peel the
// buried sequence to reach + mark the IIFE root, else unplugin queues a parallel rewrite the static
// collapse cannot compose. the IIFE carries an effect so it is PRESERVED and runs; the dead `0` prefix
// drops and the receiver collapses to the pure static
QUnit.test('global-proxy: effectful IIFE buried below a forwarder runs, receiver collapses', assert => {
  let c = 0;
  const r = (0, (() => {
    c++;
    return globalThis;
  })().self).Array.from([1, 2, 3]);
  assert.deepEqual(r, [1, 2, 3]);
  assert.same(c, 1);
});

// proxy-hop collapse for a NON-pure leaf (the `Array` constructor / `Array.isArray`, neither pure-
// substituted): the redundant `.self` / `.window` hop must be DROPPED at compile time
// (`globalThis.self.Array` -> `_globalThis.Array`). `self` / `window` do not exist in Node, so this
// runs ONLY because the hop was collapsed - a surviving `_globalThis.self` would read undefined and
// throw here. the runtime oracle for the direct-root collapse across dotted / multi-hop / static shapes
QUnit.test('global-proxy: non-pure leaf collapses its .self / .window hop (runs without it in Node)', assert => {
  assert.same(new globalThis.self.Array(3).length, 3);
  assert.same(new globalThis.self.window.Array(2).length, 2);
  assert.true(globalThis.self.Array.isArray([1]));
  // oxc preserves a paren that babel folds; the hop must still collapse (a residual `.self` throws here).
  // the parens are the point of the test - the proxy navigation is parenthesized on purpose
  /* eslint-disable @stylistic/no-extra-parens -- the parens are the test subject (paren-wrapped proxy navigation) */
  assert.same(new (globalThis.self).Array(4).length, 4);
  assert.same(new (globalThis).self.Array(5).length, 5);
  /* eslint-enable @stylistic/no-extra-parens -- restore after the deliberately parenthesized cases */
});

// the same collapse for an ALIAS root (`const g = globalThis; g.self.Array` -> `g.Array`): the chain has
// no `kind:'global'` trigger on the local `g`, so the hop must be dropped through the alias root, keeping
// `g`. `self` / `window` do not exist in Node, so a surviving `g.self.Array` would read an undefined hop
// and throw - this runs ONLY because the alias hop collapsed. covers ctor / static / multi-hop / `self` alias
QUnit.test('global-proxy: alias-rooted .self / .window hop collapses (runs without it in Node)', assert => {
  const g = globalThis;
  assert.same(new g.self.Array(3).length, 3);
  assert.same(new g.self.window.Array(2).length, 2);
  assert.true(g.self.Array.isArray([1]));
  // a COMPUTED const-binding hop (`g[k]`, k = 'self') resolves binding-aware and collapses too
  const k = 'self';
  assert.same(new g[k].Array(6).length, 6);
  // eslint-disable-next-line no-restricted-globals, unicorn/prefer-global-this -- a `self` alias is the test subject
  const s = self;
  assert.same(new s.window.Array(4).length, 4);
});
