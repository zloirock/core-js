// Destructuring: const { method } = Constructor - ObjectPattern path in usagePure

QUnit.test('destructuring: const { from } = Array', assert => {
  const { from } = Array;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('destructuring: const { assign, keys } = Object', assert => {
  const { assign, keys } = Object;
  assert.deepEqual(assign({}, { a: 1 }), { a: 1 });
  assert.deepEqual(keys({ x: 1, y: 2 }), ['x', 'y']);
});

QUnit.test('destructuring: const { resolve, all } = Promise', assert => {
  const { resolve, all } = Promise;
  const async = assert.async();
  all([resolve(1), resolve(2)]).then(r => {
    assert.deepEqual(r, [1, 2]);
    async();
  });
});

QUnit.test('destructuring: const { isFinite, isNaN } = Number', assert => {
  const { isFinite, isNaN } = Number;
  assert.true(isFinite(42));
  assert.false(isFinite(Infinity));
  assert.true(isNaN(NaN));
  assert.false(isNaN(1));
});

QUnit.test('destructuring: const { sign, trunc } = Math', assert => {
  const { sign, trunc } = Math;
  assert.same(sign(-5), -1);
  assert.same(trunc(1.9), 1);
});

QUnit.test('destructuring: const { ownKeys } = Reflect', assert => {
  const { ownKeys } = Reflect;
  assert.deepEqual(ownKeys({ a: 1 }), ['a']);
});

// multi-word method names exercise the kebab->camel conversion in the polyfill-entry
// resolver: canonical entry path uses kebab segments (`reflect/set-prototype-of`,
// `array/from-async`, `promise/with-resolvers`) but lookup-table keys are camelCase.
// without the conversion these destructures would not be recognised as polyfill aliases

QUnit.test('destructuring: const { setPrototypeOf } = Object', assert => {
  const { setPrototypeOf } = Object;
  const obj = {};
  setPrototypeOf(obj, { tag: 'custom' });
  assert.same(obj.tag, 'custom');
});

QUnit.test('destructuring: const { setPrototypeOf } = Reflect', assert => {
  const { setPrototypeOf } = Reflect;
  const obj = {};
  assert.true(setPrototypeOf(obj, { tag: 'reflect' }));
  assert.same(obj.tag, 'reflect');
});

QUnit.test('destructuring: const { fromAsync } = Array', assert => {
  const { fromAsync } = Array;
  const async = assert.async();
  fromAsync([1, 2, 3], x => x * 10).then(arr => {
    assert.deepEqual(arr, [10, 20, 30]);
    async();
  });
});

QUnit.test('destructuring: const { fromEntries, getOwnPropertyDescriptor } = Object', assert => {
  const { fromEntries, getOwnPropertyDescriptor } = Object;
  assert.deepEqual(fromEntries([['a', 1], ['b', 2]]), { a: 1, b: 2 });
  assert.same(getOwnPropertyDescriptor({ x: 42 }, 'x').value, 42);
});

QUnit.test('destructuring: const { canParse, parse } = URL', assert => {
  const { canParse, parse } = URL;
  assert.true(canParse('https://example.com'));
  assert.same(parse('https://example.com').hostname, 'example.com');
});

QUnit.test('destructuring: const { groupBy } = Map (multi-word renamed)', assert => {
  const { groupBy: mapGroupBy } = Map;
  const result = mapGroupBy([1, 2, 3, 4], x => x % 2 ? 'odd' : 'even');
  assert.deepEqual(result.get('odd'), [1, 3]);
});

// rest element - polyfill extracted, rest semantics preserved (from excluded from rest)
QUnit.test('destructuring: rest element with polyfilled property', assert => {
  const { from, ...rest } = Array;
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.false('from' in rest);
});

QUnit.test('destructuring: rest element with multiple polyfilled properties', assert => {
  const { assign, keys, ...rest } = Object;
  assert.deepEqual(assign({}, { a: 1 }), { a: 1 });
  assert.deepEqual(keys({ x: 1 }), ['x']);
  assert.false('assign' in rest);
  assert.false('keys' in rest);
});

// assignment destructuring (not declaration)
QUnit.test('destructuring: assignment expression', assert => {
  let from;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ from } = Array);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

// renamed binding
QUnit.test('destructuring: renamed binding', assert => {
  const { from: arrayFrom } = Array;
  assert.deepEqual(arrayFrom([1]), [1]);
});

// from globalThis proxy
QUnit.test('destructuring: from globalThis', assert => {
  const { Promise: P } = globalThis;
  const async = assert.async();
  P.resolve(42).then(v => {
    assert.same(v, 42);
    async();
  });
});

QUnit.test('destructuring: const { from } = Array ?? null', assert => {
  const { from } = Array ?? null;
  assert.deepEqual(from([1, 2]), [1, 2]);
});

QUnit.test('destructuring: const { from } = Array || Promise', assert => {
  const { from } = Array || Promise;
  assert.deepEqual(from('ab'), ['a', 'b']);
});

QUnit.test('destructuring: sequence expression init', assert => {
  const { from } = (0, Array);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('destructuring: with default value', assert => {
  const { from = null } = Array;
  assert.same(typeof from, 'function');
  assert.deepEqual(from([1]), [1]);
});

// deferred-SE fixed-point loop: when a destructure SE contains a callback whose body
// has another destructure-with-SE, the inner SE must survive the compiler's lift

QUnit.test('destructuring: nested SE inside lifted callback', assert => {
  const log = [];
  let captured;
  const wrap = obj => {
    log.push('outer');
    captured = obj.fn;
  };
  const innerFn = () => {
    const { of } = (log.push('inner'), Array);
    return of;
  };
  const { from } = (wrap({ fn: innerFn }), Array);
  assert.deepEqual(log, ['outer']);
  assert.same(typeof captured(), 'function');
  assert.deepEqual(log, ['outer', 'inner']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: triple-level nested SE', assert => {
  const log = [];
  let mid, deep;
  const outer = cb => {
    log.push('outer');
    mid = cb;
  };
  const wrap = cb => {
    log.push('mid');
    deep = cb;
  };
  const { from } = (outer(() => {
    const { of } = (wrap(() => {
      const { fromAsync } = (log.push('deep'), Array);
      return fromAsync;
    }), Array);
    return of;
  }), Array);
  assert.deepEqual(log, ['outer']);
  mid();
  assert.deepEqual(log, ['outer', 'mid']);
  assert.same(typeof deep(), 'function');
  assert.deepEqual(log, ['outer', 'mid', 'deep']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: nested SE in assignment form', assert => {
  const log = [];
  let captured;
  const wrap = obj => {
    log.push('outer');
    captured = obj.fn;
  };
  const innerFn = () => {
    const { of } = (log.push('inner'), Array);
    return of;
  };
  let from;
  // eslint-disable-next-line prefer-const -- testing assignment-form destructure path
  ({ from } = (wrap({ fn: innerFn }), Array));
  captured();
  assert.deepEqual(log, ['outer', 'inner']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: deeply nested with Array.from / array defaults', assert => {
  const { a: { b = Array.from('xyz'), c: [first = 'none'] = [] } = {} } = { a: { c: [] } };
  assert.deepEqual(b, ['x', 'y', 'z']);
  assert.same(first, 'none');
});

// IIFE-invoked param destructure with a member-expression default + a classifiable caller-arg:
// the caller passes the receiver, so the member default never fires; the polyfill must be wired
// onto the live caller-arg, not the dead default (else the destructured method is undefined)
QUnit.test('destructuring: IIFE member-default overridden by caller-arg', assert => {
  // eslint-disable-next-line es/no-nonstandard-iterator-properties -- testing
  const result = (function ({ of } = globalThis.Iterator) {
    return of(1);
  })(Array);
  assert.deepEqual(result, [1]);
});
