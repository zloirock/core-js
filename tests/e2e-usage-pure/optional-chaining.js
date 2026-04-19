// Optional chaining: various patterns with polyfilled methods

// basic
QUnit.test('optional: obj?.includes(x)', assert => {
  const arr = [1, 2, 3];
  assert.true(arr?.includes(2));
  assert.same(null?.includes(2), undefined);
});

QUnit.test('optional: obj?.at(i)', assert => {
  const arr = [10, 20, 30];
  assert.same(arr?.at(-1), 30);
  assert.same(null?.at(0), undefined);
});

QUnit.test('optional: obj?.trim()', assert => {
  assert.same('  hello  '?.trim(), 'hello');
  assert.same(null?.trim(), undefined);
});

QUnit.test('optional: obj?.startsWith(x)', assert => {
  assert.true('hello'?.startsWith('hel'));
  assert.same(null?.startsWith('hel'), undefined);
});

QUnit.test('optional: arr?.flat()', assert => {
  assert.deepEqual([[1], [2, 3]]?.flat(), [1, 2, 3]);
  assert.same(null?.flat(), undefined);
});

QUnit.test('optional: arr?.findIndex(fn)', assert => {
  assert.same([10, 20, 30]?.findIndex(x => x > 15), 1);
  assert.same(null?.findIndex(x => x > 15), undefined);
});

QUnit.test('optional: str?.padStart(n, ch)', assert => {
  assert.same('5'?.padStart(3, '0'), '005');
  assert.same(null?.padStart(3, '0'), undefined);
});

QUnit.test('optional: null?.reduce(fn, init)', assert => {
  assert.same(null?.reduce((a, b) => a + b, 0), undefined);
});

// chained
QUnit.test('optional chain: arr?.filter(fn)?.map(fn)', assert => {
  assert.deepEqual([1, 2, 3, 4]?.filter(x => x % 2)?.map(x => x * 10), [10, 30]);
  assert.same(null?.filter(x => x % 2)?.map(x => x * 10), undefined);
});

QUnit.test('optional chain: arr?.filter(fn)?.at(-1)', assert => {
  assert.same([1, 2, 3, 4, 5]?.filter(x => x > 3)?.at(-1), 5);
  assert.same(null?.filter(x => x > 3)?.at(-1), undefined);
});

// deep nesting
QUnit.test('deep optional: obj?.prop?.includes(x)', assert => {
  const data = { items: [1, 2, 3] };
  assert.true(data?.items?.includes(2));
  assert.same(null?.items?.includes(2), undefined);
  assert.same(data?.missing?.includes(2), undefined);
});

QUnit.test('deep optional: a?.b?.c?.includes(x)', assert => {
  const obj = { b: { c: [1, 2, 3] } };
  assert.true(obj?.b?.c?.includes(2));
  assert.same(null?.b?.c?.includes(2), undefined);
});

// mixed optional and non-optional
QUnit.test('mixed: data?.items.at(-1)', assert => {
  const data = { items: [10, 20, 30] };
  assert.same(data?.items.at(-1), 30);
  assert.true(data?.items.includes(20));
});

// optional on static
QUnit.test('optional static: Array?.from', assert => {
  assert.deepEqual(Array?.from('abc'), ['a', 'b', 'c']);
});

// optional call on stored reference
QUnit.test('optional call: fn?.call(ctx, arg)', assert => {
  const arr = [1, 2, 3];
  const fn = arr.includes;
  assert.true(fn?.call(arr, 2));
});

// chain continuation after polyfill - .valueOf() must stay inside guard
QUnit.test('optional chain continuation: arr?.flat().valueOf()', assert => {
  assert.deepEqual([1, [2]]?.flat().valueOf(), [1, 2]);
  assert.same(null?.flat().valueOf(), undefined);
});

// double optional with two polyfilled methods
QUnit.test('double optional: arr?.at(0)?.toString()', assert => {
  assert.same([42]?.at(0)?.toString(), '42');
  assert.same(null?.at(0)?.toString(), undefined);
});

// parenthesized optional callee - breaks chain
QUnit.test('parenthesized optional: (arr?.includes)(1)', assert => {
  // null case: (null?.includes) -> undefined, then (undefined)(2) -> TypeError
  const nil = null;
  // eslint-disable-next-line no-unsafe-optional-chaining -- testing this exact pattern
  assert.throws(() => (nil?.includes)(2), TypeError);
});

// parenthesized non-optional - this preserved
QUnit.test('parenthesized non-optional: (arr.at)(0)', assert => {
  const arr = [10, 20, 30];
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing parenthesized callee
  assert.same((arr.at)(0), 10);
});

// nested optional with non-polyfillable first member
QUnit.test('nested optional: obj?.prop?.includes(x)', assert => {
  const obj = { list: [1, 2, 3] };
  assert.true(obj?.list?.includes(2));
  assert.same(null?.list?.includes(2), undefined);
  assert.same(obj?.missing?.includes(2), undefined);
});

// --- chained polyfills via optional call: inner chain + outer polyfill ---

// user method returning array, followed by non-optional polyfilled .at
QUnit.test('user method chain: a?.b?.().at(0)', assert => {
  const a = { b: () => [10, 20, 30] };
  assert.same(a?.b?.().at(0), 10);
  assert.same(null?.b?.().at(0), undefined);
  assert.same({ b: null }?.b?.().at(0), undefined);
});

// polyfillable instance method inside the chain + non-optional outer polyfill
QUnit.test('poly chain with side-effect receiver: (a())?.at?.(1).slice(0)', assert => {
  const nil = () => null;
  assert.same(nil()?.at?.(1).slice(0), undefined);
  const arr = () => [[1], [2], [3]];
  assert.deepEqual(arr()?.at?.(1).slice(0), [2]);
});

// both inner and outer polyfilled, non-optional continuation
QUnit.test('poly chain: [].at?.(1).slice(0) with non-empty', assert => {
  const arr = [[1], [2], [3]];
  assert.deepEqual(arr.at?.(1).slice(0), [2]);
});

// inner returns value-undef (NOT short-circuit) and non-optional outer runs on it - native throws
QUnit.test('poly chain: [].at?.(1).slice(0) on empty throws like native', assert => {
  assert.throws(() => [].at?.(1).slice(0), TypeError);
});

// both-optional variant
QUnit.test('poly chain both optional: arr.at?.(i)?.slice(0)', assert => {
  const arr = [[1], [2], [3]];
  assert.deepEqual(arr.at?.(1)?.slice(0), [2]);
  assert.same([].at?.(5)?.slice(0), undefined);
});

// side-effect receiver + polyfill chain + polyfill outer
QUnit.test('poly chain: a()?.flat?.(1).at(0)', assert => {
  const nil = () => null;
  assert.same(nil()?.flat?.(1).at(0), undefined);
  const nested = () => [[1], [2]];
  assert.same(nested()?.flat?.(1).at(0), 1);
});

// deeper user-chain with polyfill at the tail
QUnit.test('deep user chain: a?.b?.c?.().at(0)', assert => {
  const a = { b: { c: () => [10, 20] } };
  assert.same(a?.b?.c?.().at(0), 10);
  assert.same(null?.b?.c?.().at(0), undefined);
  assert.same({ b: null }?.b?.c?.().at(0), undefined);
  assert.same({ b: { c: null } }?.b?.c?.().at(0), undefined);
});

QUnit.test('optional: factory returning maybe-null array + .at / .includes chain', assert => {
  const make = n => n > 0 ? [1, 2, 3] : null;
  assert.same(make(1)?.at(-1), 3);
  assert.same(make(0)?.at(-1), undefined);
  assert.same(make(1)?.includes?.(2), true);
});
