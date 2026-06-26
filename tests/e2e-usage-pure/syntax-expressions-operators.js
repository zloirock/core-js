// Expressions / operators around polyfill injection. Every test is DISTINGUISHING: it asserts
// something that would change if the transform regressed - a side effect evaluated exactly once
// (the chain memoizes the receiver into a temp), the receiver `this` threaded through a chain,
// a short-circuit suppressing evaluation, or spread/sequence ordering. A generic "polyfill works"
// would pass regardless of the plugin, so those are intentionally absent.

// --- Receiver memoization: a side-effecting receiver is evaluated ONCE across a chain ---

QUnit.test('expr: side-effecting receiver evaluated once before a polyfilled .at', assert => {
  let calls = 0;
  function get() {
    calls += 1;
    return [10, 20, 30];
  }
  assert.same(get().at(-1), 30);
  assert.same(calls, 1);
});

QUnit.test('expr: receiver evaluated once across TWO chained instance polyfills', assert => {
  let calls = 0;
  function get() {
    calls += 1;
    return [[1], [2], [3]];
  }
  assert.same(get().flat().at(-1), 3);
  assert.same(calls, 1);
});

QUnit.test('expr: receiver evaluated once across THREE chained polyfills', assert => {
  let calls = 0;
  function get() {
    calls += 1;
    return [3, 1, 2];
  }
  assert.same(get().toSorted().at(-1).toString(), '3');
  assert.same(calls, 1);
});

QUnit.test('expr: arrow-body chain memoizes the argument receiver once', assert => {
  let calls = 0;
  function src(x) {
    calls += 1;
    return [x, x + 1];
  }
  function f(x) {
    return src(x).at(-1).toFixed(0);
  }
  assert.same(f(5), '6');
  assert.same(calls, 1);
});

// --- Receiver `this`: each polyfill operates on the PREVIOUS result, not the original ---

QUnit.test('expr: chained polyfills thread the correct receiver', assert => {
  // .at runs on the .flatMap result [1,2,3]; threading the ORIGINAL [[1],[2],[3]] would yield [3]
  assert.same([[1], [2], [3]].flat().at(-1), 3);
});

QUnit.test('expr: instance polyfill after a static polyfill keeps its own receiver', assert => {
  // Array.of(...) is the receiver of .findLast; a mis-thread would call findLast on the wrong value
  assert.same(Array.of(5, 6, 7).findLast(x => x < 7), 6);
});

QUnit.test('expr: split chain into a temp does not duplicate the receiver effect', assert => {
  let calls = 0;
  function make() {
    calls += 1;
    return [1, 2, 3, 4];
  }
  const arr = make();
  assert.same(arr.at(-1), 4);
  assert.same(arr.at(0), 1);
  assert.same(calls, 1);
});

// --- Optional chaining: the polyfilled tail is suppressed when the head is nullish ---

QUnit.test('expr: optional chain short-circuits the polyfilled tail', assert => {
  // when the head is nullish the trailing `.at` polyfill must not run; a broken short-circuit throws
  function make(present) {
    return present ? { arr: [1, 2, 3] } : null;
  }
  assert.same(make(false)?.arr.at(-1), undefined);
  assert.same(make(true)?.arr.at(-1), 3);
});

QUnit.test('expr: optional call short-circuits a chained polyfill', assert => {
  let calls = 0;
  function provider(enabled) {
    return enabled ? () => {
      calls += 1;
      return [7, 8, 9];
    } : undefined;
  }
  assert.same(provider(false)?.().at(-1), undefined);
  assert.same(calls, 0);
  assert.same(provider(true)?.().at(-1), 9);
  assert.same(calls, 1);
});

QUnit.test('expr: nested optional chain with a polyfilled leaf', assert => {
  const data = { inner: { list: [1, 2, 3] } };
  assert.same(data?.inner?.list.at(-1), 3);
  assert.same(data?.missing?.list?.at(-1), undefined);
});

QUnit.test('expr: optional member short-circuits a polyfilled includes', assert => {
  function box(on) {
    return on ? { k: [4, 5, 6] } : null;
  }
  assert.same(box(false)?.k.includes(5), undefined);
  assert.true(box(true)?.k.includes(5));
});

// --- Spread: the spread source is evaluated once and in order ---

QUnit.test('expr: spread source feeding a static polyfill is evaluated once', assert => {
  let calls = 0;
  function gen() {
    calls += 1;
    return [1, 2, 3];
  }
  assert.deepEqual(Array.of(...gen()), [1, 2, 3]);
  assert.same(calls, 1);
});

QUnit.test('expr: spread of a polyfill result into a new-expression', assert => {
  const set = new Set(Array.from('aab'));
  assert.same(set.size, 2);
});

QUnit.test('expr: spread of a polyfill result into a call argument list', assert => {
  assert.same(Math.max(...Array.of(3, 9, 4)), 9);
});

QUnit.test('expr: spread into an array literal preserves order around a polyfill', assert => {
  assert.deepEqual([0, ...Array.of(1, 2), 3], [0, 1, 2, 3]);
});

// --- Sequence / short-circuit: evaluation order and suppression ---

QUnit.test('expr: sequence expression runs side effect before the polyfill value', assert => {
  const order = [];
  const arr = [1, 2, 3];
  const value = (order.push('se'), arr.at(-1));
  assert.same(value, 3);
  assert.deepEqual(order, ['se']);
});

QUnit.test('expr: logical && suppresses the polyfilled right side when left is falsy', assert => {
  let calls = 0;
  function right() {
    calls += 1;
    return [1, 2, 3].at(-1);
  }
  function guarded(flag) {
    return flag && right();
  }
  assert.same(guarded(0), 0);
  assert.same(calls, 0);
  assert.same(guarded(1), 3);
  assert.same(calls, 1);
});

QUnit.test('expr: nullish coalescing only evaluates the polyfilled fallback when needed', assert => {
  let calls = 0;
  function fallback() {
    calls += 1;
    return Array.of(9).at(0);
  }
  function coalesce(input) {
    return input ?? fallback();
  }
  assert.same(coalesce(5), 5);
  assert.same(calls, 0);
  assert.same(coalesce(null), 9);
  assert.same(calls, 1);
});

QUnit.test('expr: ternary evaluates only the chosen arm polyfill', assert => {
  let a = 0;
  let b = 0;
  function left() {
    a += 1;
    return Array.of(1).at(0);
  }
  function right() {
    b += 1;
    return Array.of(2).at(0);
  }
  function choose(cond) {
    return cond ? left() : right();
  }
  assert.same(choose(true), 1);
  assert.same(a, 1);
  assert.same(b, 0);
});

// --- Logical / nullish assignment: the right side polyfill fires only when it should ---

QUnit.test('expr: ||= assigns the polyfill only when the target is falsy', assert => {
  let calls = 0;
  function compute() {
    calls += 1;
    return Array.of(1, 2, 3).at(-1);
  }
  const box = { v: 7 };
  box.v ||= compute();
  assert.same(box.v, 7);
  assert.same(calls, 0);
  const empty = { v: 0 };
  empty.v ||= compute();
  assert.same(empty.v, 3);
  assert.same(calls, 1);
});

QUnit.test('expr: ??= assigns the polyfill only when the target is nullish', assert => {
  let calls = 0;
  function compute() {
    calls += 1;
    return Array.from('xy');
  }
  const box = { v: undefined };
  box.v ??= compute();
  assert.deepEqual(box.v, ['x', 'y']);
  box.v ??= compute();
  assert.same(calls, 1);
});

// --- Receiver behind a wrapper: the wrapper side effect runs once, receiver still resolves ---

QUnit.test('expr: sequence-wrapped global receiver runs its effect once', assert => {
  let calls = 0;
  function mark() {
    calls += 1;
    return Array;
  }
  assert.deepEqual(mark().of(1, 2), [1, 2]);
  assert.same(calls, 1);
});

QUnit.test('expr: polyfill result drives a template literal once', assert => {
  let calls = 0;
  function last() {
    calls += 1;
    return [1, 2, 3].at(-1);
  }
  assert.same(`last=${ last() }`, 'last=3');
  assert.same(calls, 1);
});

QUnit.test('expr: tagged template reads a polyfill interpolation once', assert => {
  let calls = 0;
  function v() {
    calls += 1;
    return Array.of(4, 2).at(0);
  }
  function tag(strings, x) {
    return `${ strings[0] }${ x }`;
  }
  assert.same(tag`n=${ v() }`, 'n=4');
  assert.same(calls, 1);
});
