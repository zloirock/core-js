// Loops, binding and scope around polyfill injection. Every test is DISTINGUISHING: a lazy
// iterator-helper must map exactly one element per pull, a per-iteration `let` capture must see its
// own loop value through a polyfill (a hoisting bug would share one), a side-effecting receiver in
// a loop body runs once per pass, and a binding whose TYPE changes still resolves its instance
// polyfill on the live value (the narrowed helper must keep its generic fallback). Generic
// "polyfill in a loop" tests are absent.

// --- Iterator helpers are lazy: one user-callback invocation per consumed element ---

QUnit.test('loop: iterator-helper map is lazy, one call per pulled element', assert => {
  let calls = 0;
  const mapped = Iterator.from([1, 2, 3, 4, 5]).map(x => {
    calls += 1;
    return x * 2;
  });
  assert.same(mapped.next().value, 2);
  assert.same(calls, 1);
  assert.same(mapped.next().value, 4);
  assert.same(calls, 2);
});

QUnit.test('loop: iterator-helper take stops pulling the source after the limit', assert => {
  let produced = 0;
  const source = Iterator.from([10, 20, 30, 40]).map(x => {
    produced += 1;
    return x;
  });
  assert.deepEqual(source.take(2).toArray(), [10, 20]);
  assert.same(produced, 2);
});

QUnit.test('loop: for-of over a filtered iterator-helper pulls lazily to the break', assert => {
  let seen = 0;
  let stopped = null;
  for (const value of Iterator.from([1, 2, 3, 4, 5]).filter(x => {
    seen += 1;
    return x % 2 === 1;
  })) {
    if (value === 3) {
      stopped = value;
      break;
    }
  }
  assert.same(stopped, 3);
  assert.same(seen, 3);
});

QUnit.test('loop: flatMap iterator-helper expands lazily', assert => {
  let calls = 0;
  const out = Iterator.from([1, 2]).flatMap(x => {
    calls += 1;
    return [x, x * 10];
  }).toArray();
  assert.deepEqual(out, [1, 10, 2, 20]);
  assert.same(calls, 2);
});

// --- Side-effecting receiver in a loop body: one evaluation per iteration ---

QUnit.test('loop: chained-polyfill receiver in a loop body runs once per iteration', assert => {
  let calls = 0;
  const out = [];
  for (let i = 0; i < 3; i += 1) {
    function make() {
      calls += 1;
      return [i, i + 1];
    }
    out.push(make().at(-1));
  }
  assert.deepEqual(out, [1, 2, 3]);
  assert.same(calls, 3);
});

QUnit.test('loop: nested loops each call a polyfill once per inner step', assert => {
  let calls = 0;
  const grid = [];
  for (const r of [0, 1]) {
    for (const c of [0, 1, 2]) {
      calls += 1;
      grid.push(Array.of(r, c).at(-1));
    }
  }
  assert.deepEqual(grid, [0, 1, 2, 0, 1, 2]);
  assert.same(calls, 6);
});

// --- Loop-variable capture: per-iteration `let` vs shared `var`, observed through a polyfill ---

QUnit.test('loop: per-iteration let capture each see their own index via a polyfill', assert => {
  const fns = [];
  for (let i = 0; i < 3; i += 1) {
    fns.push(() => Array.of(i).at(0));
  }
  assert.deepEqual(fns.map(f => f()), [0, 1, 2]);
});

QUnit.test('loop: shared var capture all see the final index via a polyfill', assert => {
  const fns = [];
  /* eslint-disable-next-line no-var -- testing shared var capture semantics */
  for (var i = 0; i < 3; i += 1) {
    fns.push(() => Array.of(i).at(0));
  }
  assert.deepEqual(fns.map(f => f()), [3, 3, 3]);
});

QUnit.test('loop: closure built per iteration captures a polyfilled slice', assert => {
  const base = [10, 20, 30, 40];
  const heads = [];
  for (let n = 1; n <= 3; n += 1) {
    heads.push(() => Array.from(base).at(n - 1));
  }
  assert.deepEqual(heads.map(f => f()), [10, 20, 30]);
});

// --- A binding whose TYPE changes still resolves its instance polyfill on the live value ---

QUnit.test('loop: reassigned binding keeps .at correct across an array-to-string change', assert => {
  let x = [1, 2, 3];
  const first = x.at(-1);
  x = 'hello';
  const second = x.at(-1);
  assert.same(first, 3);
  assert.same(second, 'o');
});

QUnit.test('loop: binding reassigned in a loop resolves the polyfill on each value', assert => {
  const inputs = [[1, 2, 3], 'abc', [9]];
  const lasts = [];
  for (let i = 0; i < inputs.length; i += 1) {
    const cur = inputs[i];
    lasts.push(cur.at(-1));
  }
  assert.deepEqual(lasts, [3, 'c', 9]);
});

QUnit.test('loop: each assignment value drives the instance polyfill', assert => {
  let x = [1, 2];
  assert.same(x.at(-1), 2);
  x = 'tail';
  assert.same(x.at(-1), 'l');
  x = [7, 8, 9];
  assert.same(x.at(-1), 9);
});

// --- Array-destructuring from a polyfill result ---

QUnit.test('loop: array-destructure head and rest from a polyfill result', assert => {
  const [first, ...rest] = Array.from('abcd');
  assert.same(first, 'a');
  assert.deepEqual(rest, ['b', 'c', 'd']);
});

QUnit.test('loop: swap via array-destructure preserves polyfilled values', assert => {
  let a = Array.of(1).at(0);
  let b = Array.of(2).at(0);
  [a, b] = [b, a];
  assert.deepEqual([a, b], [2, 1]);
});

// --- Recursion / mutual recursion carrying a polyfill at each level ---

QUnit.test('loop: recursion accumulates via a polyfill at each level', assert => {
  function flatten(node) {
    return Array.isArray(node)
      ? node.flatMap(flatten)
      : [node];
  }
  assert.deepEqual(flatten([1, [2, [3, 4]], 5]), [1, 2, 3, 4, 5]);
});

QUnit.test('loop: mutual recursion threads a polyfilled accumulator', assert => {
  function isEven(n) {
    return n === 0 ? Array.of(true).at(0) : isOdd(n - 1);
  }
  function isOdd(n) {
    return n === 0 ? Array.of(false).at(0) : isEven(n - 1);
  }
  assert.true(isEven(4));
  assert.false(isOdd(4));
});

// --- Block scope and hoisting interacting with the injected helper ---

QUnit.test('loop: block-scoped polyfill alias used across nested function scopes', assert => {
  const { from } = Array;
  function build() {
    const inner = from('ab');
    function tail() {
      return from(inner).at(-1);
    }
    return tail();
  }
  assert.same(build(), 'b');
});

QUnit.test('loop: hoisted function declaration calls a polyfill before its definition', assert => {
  assert.deepEqual(build(3), [0, 1, 2]);
  function build(n) {
    return Array.from({ length: n }, (_, i) => i);
  }
});

QUnit.test('loop: inner-scope shadow keeps the polyfill on each value', assert => {
  const x = [1, 2, 3];
  function inner() {
    // eslint-disable-next-line no-shadow -- shadowing is the construct under test
    const x = ['a', 'b'];
    return x.at(-1);
  }
  assert.same(inner(), 'b');
  assert.same(x.at(-1), 3);
});

// --- for-of / for-in over polyfill-built collections ---

QUnit.test('loop: for-of with object-destructure head over polyfilled entries', assert => {
  const entries = Object.entries({ a: 1, b: 2 });
  const out = [];
  for (const [key, value] of entries) {
    out.push(`${ key }${ value }`);
  }
  assert.deepEqual(out, ['a1', 'b2']);
});

QUnit.test('loop: for-of over a Set-method result iterates the difference', assert => {
  const a = new Set([1, 2, 3, 4]);
  const b = new Set([2, 4]);
  const out = [];
  for (const value of a.difference(b)) {
    out.push(value);
  }
  assert.deepEqual(out, [1, 3]);
});

QUnit.test('loop: for-in over a polyfill-built object visits its own keys', assert => {
  const obj = Object.fromEntries([['x', 1], ['y', 2]]);
  const keys = [];
  for (const key in obj) {
    keys.push(key);
  }
  assert.deepEqual(keys.sort(), ['x', 'y']);
});

QUnit.test('loop: chained withResolvers-driven steps resolve in order', assert => {
  const async = assert.async();
  const out = [];
  function step(value) {
    const { promise, resolve } = Promise.withResolvers();
    resolve(value);
    return promise;
  }
  step(1).then(a => {
    out.push(a);
    return step(2);
  }).then(b => {
    out.push(b);
    assert.deepEqual(out, [1, 2]);
    async();
  });
});
