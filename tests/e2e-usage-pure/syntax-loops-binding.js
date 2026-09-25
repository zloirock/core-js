// Loops, binding and scope around polyfill injection. Every test is DISTINGUISHING: a lazy
// iterator-helper must map exactly one element per pull, a per-iteration `let` capture must see its
// own loop value through a polyfill (a hoisting bug would share one), a side-effecting receiver in
// a loop body runs once per pass, and a binding whose TYPE changes still resolves its instance
// polyfill on the live value (the narrowed helper must keep its generic fallback). Generic
// "polyfill in a loop" tests are absent.

// --- A head element built by a call reads THAT call's argument on its own pass ---

QUnit.test('loop: relocated array slots retain a static beside an instance claim', assert => {
  const seen = [];
  for (const [{ values }, { at }] of [[Object, [1]]]) {
    seen.push(values({ x: 7 }), at.call([2, 3], -1));
  }
  for (const { w: { entries }, y: { at } } of [{ w: Object, y: [1] }]) {
    seen.push(entries({ x: 8 }), at.call([4, 5], -1));
  }
  assert.deepEqual(seen, [[7], 3, [['x', 8]], 5]);
});

QUnit.test('loop: a call-built head element keeps each pass its own receiver', assert => {
  function pick(value) { return value; }
  const custom = { from: () => 'CUSTOM' };
  const seen = [];
  for (const { w: { from } } of [{ w: pick(Array) }, { w: pick(custom) }]) seen.push(from([7]));
  assert.deepEqual(seen, [[7], 'CUSTOM']);
});

QUnit.test('loop: one callee under primitive arguments answers for every pass', assert => {
  // the body reads no parameter, so every call hands back the same value and the leaf extracts once
  // eslint-disable-next-line no-unused-vars -- the IGNORED parameter is what the row is about
  function constant(tag) { return Array; }
  const seen = [];
  for (const { w: { of } } of [{ w: constant('a') }, { w: constant('b') }]) seen.push(of(9));
  assert.deepEqual(seen, [[9], [9]]);
});

QUnit.test('loop: an effectful head element runs once per pass and still binds the polyfill', assert => {
  const log = [];
  function make(tag) {
    log.push(tag);
    return Array;
  }
  for (let round = 0; round < 3; round += 1) {
    for (const { from } of [make(round)]) log.push(from([round]));
  }
  // the element keeps its position ahead of what replaces it: one call per pass, in source order
  assert.deepEqual(log, [0, [0], 1, [1], 2, [2]]);
});

QUnit.test('loop: a head element built through an invoker keeps the polyfill', assert => {
  function make() { return Array; }
  const seen = [];
  for (const { from } of [make.call(null)]) seen.push(from([1]));
  for (const { of } of [Reflect.apply(make, null, [])]) seen.push(of(2));
  for (const { from } of [make.bind(null)()]) seen.push(from([3]));
  assert.deepEqual(seen, [[1], [2], [3]]);
});

QUnit.test('loop: a branching head element resolves the arm the runtime takes', assert => {
  const seen = [];
  const absent = null;
  const takesLeft = true;
  for (const { from } of [takesLeft ? Array : Object]) seen.push(from([1]));
  for (const { from } of [absent || Array]) seen.push(from([2]));
  for (const { from } of [takesLeft ? Object : Array]) seen.push(typeof from);
  assert.deepEqual(seen, [[1], [2], 'undefined']);
});

QUnit.test('loop: a head element read off a container written in place binds the polyfill', assert => {
  const seen = [];
  for (const { from } of [{ w: Array }.w]) seen.push(from([1]));
  for (const { of } of [[Array][0]]) seen.push(of(2));
  const alias = Array;
  for (const { from } of [alias]) seen.push(from([3]));
  assert.deepEqual(seen, [[1], [2], [3]]);
});

QUnit.test('loop: a head slot holding a PATTERN still binds the ponyfill', assert => {
  const log = [];
  function realm() {
    log.push('r');
    return globalThis;
  }
  const seen = [];
  // the head hosts no statement for an extraction and no slot for a value swap, so the static is
  // served by the MIRROR of the iterated element or by nothing: read raw, it is undefined on a
  // realm without it and the pattern under it throws
  for (const { Array: { of: { length: arity } } } of [realm(), realm()]) seen.push(arity);
  assert.deepEqual(seen, [0, 0]);
  assert.deepEqual(log, ['r', 'r'], 'the element call runs once per pass, ahead of what replaces it');
});

QUnit.test('loop: a pattern-valued head slot mirrors through a wrapper and beside a claim', assert => {
  const seen = [];
  for (const [{ Array: { of: { length: arity } } }] of [[globalThis]]) seen.push(arity);
  for (const { Array: { of: { length: arity }, from } } of [globalThis]) seen.push(arity, from([5]));
  assert.deepEqual(seen, [0, 0, [5]]);
});

QUnit.test('loop: a head reads its iterable once per entry, so a write in the body misses it', assert => {
  const seen = [];
  const box = { w: Array };
  for (const { from } of [box.w]) {
    box.w = Map;
    seen.push(from([1]));
  }
  // the write landed after the iterable was read, so the pass still binds what the element spelled
  assert.deepEqual(seen, [[1]]);
});

QUnit.test('loop: an OUTER loop re-enters the head, and the second entry reads the replaced slot', assert => {
  const seen = [];
  const replacement = { from() { return 'REPLACED'; } };
  replacement.from.replaced = true;
  const box = { w: Array };
  for (let round = 0; round < 2; round += 1) {
    for (const { from } of [box.w]) {
      box.w = replacement;
      // identity, not a call: what the first entry binds is absent in a realm without the static,
      // and the claim here is WHICH slot each entry read, which holds in every realm
      seen.push(from && from.replaced ? 'replacement' : 'entry value');
    }
  }
  assert.deepEqual(seen, ['entry value', 'replacement']);
});

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

// --- Loop clause slots: once-per-entry slots resolve, re-run slots bail ---
// a loop back-edge re-runs the test / update / for-x left slots, so an alias-keyed static
// dispatch there BAILS to native dispatch (its emission is locked by transform fixtures; the
// wrong-value pin is observable in the Node differential, and its native runtime is the
// engine's own semantics - not asserted here). the ONCE-PER-ENTRY slots below must keep
// resolving instead: the substituted pure static runs on every engine, and an over-widening
// of the re-run detection would surface here as a raw native read on engines without it

QUnit.test('loop: for-init computed static resolves and runs the polyfill', assert => {
  let key = 'from';
  const first = [];
  for (let seeded = Array[key]([3, 4]); first.length < 2; key = 'of') first.push(seeded.length);
  assert.deepEqual(first, [2, 2]);
  assert.same(key, 'of');
});

QUnit.test('loop: for-of iterable slot resolves and runs the polyfill once', assert => {
  let key = 'of';
  const seen = [];
  for (const x of Array[key](7, 8)) {
    seen.push(x);
    key = 'from';
  }
  assert.deepEqual(seen, [7, 8]);
  assert.same(key, 'from');
});

// a for-of head member write rebinds the slot each iteration - the body read must call the
// user's assigned function, not a polyfill dispatch that would answer with the array element
QUnit.test('loop: for-of member write target aliases the body read to the assigned value', assert => {
  const o = [5, 6];
  for (o.flat of [function () { return 'assigned'; }]) {
    assert.same(o.flat(), 'assigned');
  }
});

// a write textually AFTER the read proves nothing once the function holding both is called
// again: the previous call's write runs before the next call's read. regression: the read
// resolved the declarator init, so the second call answered with the FIRST value
QUnit.test('binding: re-invoked function sees its own later write on the next call', assert => {
  // only the SECOND call is asserted, and deliberately: the first reads the engine's own
  // `Number.parseFloat`, which the oldest targets do not ship - and a target that DOES lack it is
  // exactly one where the plugin would have substituted, so no static can be both natively present
  // and substituted. the invariant that holds everywhere is the one under test: the second call
  // must not still see the first call's value
  let N = Number;
  const seen = [];
  function f() {
    const { parseFloat: p } = N;
    seen.push(typeof p);
    N = Math;
  }
  f();
  f();
  assert.same(N, Math);
  assert.same(seen[1], 'undefined');
});

// same exposure through a destructure read, and with the write buried in a nested block -
// the reach test must not treat "later in this activation" as "never before the read"
QUnit.test('binding: re-invoked function sees a nested later write on the next call', assert => {
  let R = Reflect;
  const seen = [];
  function f() {
    const { ownKeys } = R;
    seen.push(typeof ownKeys);
    if (seen.length) { R = Math; }
  }
  f();
  f();
  assert.deepEqual(seen, ['function', 'undefined']);
});

/* eslint-disable no-var, no-redeclare, block-scoped-var, no-lone-blocks, no-useless-assignment
   -- the subject of this section IS the `var` re-declaration: a bare same-name `var` binds the one
   hoisted slot and writes no value. every rule listed here forbids the exact shape under test */

// --- A valueless `var` re-declaration writes nothing, and the value must survive it ---
// These assert the VALUE the read produces, in every host the form has: the phantom beside the
// use, inside a block around it, next to a real write, and against a for-x head that does rebind.
// What they deliberately do NOT claim is family-level discrimination: probed by seeding an
// over-strip that swallows the for-x head, the wrong-family `at` helper still returns the right
// element in both the full and the stripped realm, so no runtime oracle separates the families
// here. That separation lives in the import-set comparison - the differential's `valueless-redecl`
// family - which is also what caught the emitter desync this form exposed.

QUnit.test('binding: bare `var` re-declaration leaves the array value in place', assert => {
  var arr = [10, 20, 30];
  var arr;
  assert.same(arr.at(-1), 30);
  assert.same(arr.at(0), 10);
});

QUnit.test('binding: bare `var` re-declaration leaves the string value in place', assert => {
  var str = 'abc';
  var str;
  assert.same(str.at(-1), 'c');
  assert.same(str.at(0), 'a');
});

QUnit.test('binding: a nested-block re-declaration is the same binding, not a shadow', assert => {
  var val = [1, 2, 3];
  {
    var val;
    assert.same(val.at(-1), 3);
  }
  assert.same(val.at(0), 1);
});

QUnit.test('binding: a real write next to the phantom still decides the value', assert => {
  var mixed = [1, 2, 3];
  var mixed;
  mixed = 'xyz';
  assert.same(mixed.at(-1), 'z');
});

QUnit.test('binding: a for-of head re-declaration rebinds and the last value is read', assert => {
  var looped = [1, 2, 3];
  for (var looped of [['p'], 'qr']) { /* rebinds per iteration */ }
  assert.same(looped.at(-1), 'r');
});

/* eslint-enable no-var, no-redeclare, block-scoped-var, no-lone-blocks, no-useless-assignment
   -- back to the suite's modern-syntax default; the `var` shapes above are the tested form */

/* eslint-disable no-unreachable-loop -- one-pass loop heads are the forms under test */

// Loop-head wrappers keep initializer effects ahead of method extraction.
function nestedTrailing(receiver, effect) {
  for (let [{ w: { values }, y: { at } }] = [receiver, effect()]; ;) return [values, at];
}

function nestedLeading(receiver, effect) {
  for (let [, { w: { values }, y: { at } }] = [effect(), receiver]; ;) return [values, at];
}

function flatTrailing(receiver, effect) {
  for (let [{ values, at }] = [receiver, effect()]; ;) return [values, at];
}

QUnit.test('destructuring: loop-head wrapper evaluates neighbours before nested methods', assert => {
  const rows = [3, 4];
  for (const extract of [nestedTrailing, nestedLeading]) {
    const events = [];
    const receiver = {
      get w() { events.push('w'); return rows; },
      get y() { events.push('y'); return rows; },
    };
    const [values, at] = extract(receiver, () => { events.push('effect'); });
    assert.deepEqual(events, ['effect', 'w', 'y']);
    assert.same(values.call(rows).next().value, 3);
    assert.same(at.call(rows, -1), 4);
  }
});

QUnit.test('destructuring: loop-head dispatch reads its element rather than its array wrapper', assert => {
  const events = [];
  function ownValues() { return 'values'; }
  function ownAt() { return 'at'; }
  const receiver = {
    get values() { events.push('values'); return ownValues; },
    get at() { events.push('at'); return ownAt; },
  };
  const [values, at] = flatTrailing(receiver, () => { events.push('effect'); });
  assert.deepEqual(events, ['effect', 'values', 'at']);
  assert.same(values, ownValues);
  assert.same(at, ownAt);
});

function nestedArrays(receiver, effect) {
  for (let [[{ w: { values }, y: { at } }]] = [[receiver], effect()]; ;) return [values, at];
}

function patternSibling(receiver, effect) {
  for (let [{ w: { values }, y: { at } }, { z }] = [receiver, effect()]; ;) return [values, at, z];
}

QUnit.test('destructuring: loop-head wrapper preserves property order across pattern elements', assert => {
  const events = [];
  const rows = [3, 4];
  const receiver = {
    get w() { events.push('w'); return rows; },
    get y() { events.push('y'); return rows; },
  };
  const [values, at, z] = patternSibling(receiver, () => {
    events.push('effect');
    return {
      get z() { events.push('z'); return 7; },
    };
  });
  assert.deepEqual(events, ['effect', 'w', 'y', 'z']);
  assert.same(values.call(rows).next().value, 3);
  assert.same(at.call(rows, -1), 4);
  assert.same(z, 7);
  events.length = 0;
  const [nestedValues, nestedAt] = nestedArrays(receiver, () => { events.push('effect'); });
  assert.deepEqual(events, ['effect', 'w', 'y']);
  assert.same(nestedValues.call(rows).next().value, 3);
  assert.same(nestedAt.call(rows, -1), 4);
});

QUnit.test('destructuring: loop-head wrapper captures a receiver before its neighbour replaces the binding', assert => {
  const events = [];
  const rows = [3, 4];
  let receiver = {
    get w() { events.push('original w'); return rows; },
    get y() { events.push('original y'); return rows; },
  };
  function replace() {
    events.push('replace');
    receiver = { w: [], y: [] };
    return receiver;
  }
  for (let [{ w: { values }, y: { at } }] = [receiver, replace()]; ;) {
    assert.deepEqual(events, ['replace', 'original w', 'original y']);
    assert.same(values.call(rows).next().value, 3);
    assert.same(at.call(rows, -1), 4);
    break;
  }
});
/* eslint-enable no-unreachable-loop -- end of the source forms above */

// Each iterated receiver keeps its own static value and the head keeps its source binding.

/* eslint-disable no-var -- var is the loop-head form under test */
QUnit.test('for-of var: mixed constructor and custom static', assert => {
  const seen = [];
  for (var { from } of [Array, { from: 'mine' }]) seen.push(typeof from);
  assert.deepEqual(seen, ['function', 'string']);
});
/* eslint-enable no-var -- end of var loop-head case */

QUnit.test('for-of let: mixed constructor and custom static', assert => {
  const seen = [];
  // eslint-disable-next-line prefer-const -- let is the loop-head form under test
  for (let { from } of [Array, { from: 'mine' }]) seen.push(typeof from);
  assert.deepEqual(seen, ['function', 'string']);
});

QUnit.test('for-of const: mixed constructor and custom static', assert => {
  const seen = [];
  for (const { from } of [Array, { from: 'mine' }]) seen.push(typeof from);
  assert.deepEqual(seen, ['function', 'string']);
});

QUnit.test('for-of: custom getter, default and per-iteration capture retain order', assert => {
  const log = [];
  const reads = [];
  for (const { from = (log.push('default'), 'fallback') } of [
    Array,
    { get from() { log.push('get'); return undefined; } },
  ]) {
    log.push(typeof from);
    reads.push(() => typeof from);
  }
  assert.deepEqual(log, ['function', 'get', 'default', 'string']);
  assert.deepEqual(reads.map(read => read()), ['function', 'string']);
});

QUnit.test('for-of: a custom first element does not choose the later static', assert => {
  const seen = [];
  for (const { from } of [{ from: 'first' }, Array]) seen.push(typeof from);
  assert.deepEqual(seen, ['string', 'function']);
  function shadow(Array) {
    const values = [];
    for (const { from } of [Array, { from: 'last' }]) values.push(from);
    return values;
  }
  assert.deepEqual(shadow({ from: 'local' }), ['local', 'last']);
});

QUnit.test('for-of: a null element still throws after the earlier body', assert => {
  const seen = [];
  assert.throws(() => {
    for (const { from } of [Array, null]) seen.push(typeof from);
  }, TypeError);
  assert.deepEqual(seen, ['function']);
});

QUnit.test('loop: returned static receivers keep calls, custom properties and var closures', assert => {
  const events = [];
  const values = [];
  const reads = [];
  function receiver(label, value) {
    events.push(label);
    return value;
  }
  // eslint-disable-next-line no-var -- shared binding is the regression under test
  for (var { w: { from } } of [{ w: receiver('first', Array) }, { w: receiver('second', { from: () => ['custom'] }) }]) {
    values.push(from([7])[0]);
    reads.push(() => from([8])[0]);
  }
  assert.deepEqual(events, ['first', 'second']);
  assert.deepEqual(values, [7, 'custom']);
  assert.deepEqual(reads.map(read => read()), ['custom', 'custom']);
});

QUnit.test('loop: mixed nested static receivers keep lexical closures and null throws', assert => {
  const values = [];
  const reads = [];
  assert.throws(() => {
    // eslint-disable-next-line prefer-const -- retain the let loop-head form under test
    for (let { w: { from } } of [{ w: Array }, { w: { from: () => ['custom'] } }, { w: null }]) {
      values.push(from([7])[0]);
      reads.push(() => from([8])[0]);
    }
  }, TypeError);
  assert.deepEqual(values, [7, 'custom']);
  assert.deepEqual(reads.map(read => read()), [8, 'custom']);
});

// --- A for-x head that DECLARES nothing: the iterated element is the pattern's only slot ---

QUnit.test('loop: a symbol slot keeps its static neighbours in an assignment head', assert => {
  let tag, from, of;
  const seen = [];
  for ({ [Symbol.toStringTag]: tag, from, of } of [Array, Array]) {
    seen.push(from([1]), of(2), typeof tag);
  }
  assert.deepEqual(seen, [[1], [2], 'undefined', [1], [2], 'undefined']);
});

QUnit.test('loop: a declaration-less head reads a nested level under a static through the polyfill', assert => {
  const seen = [];
  let via;
  for ({ of: { name: via } } of [Array, Array]) seen.push(typeof via);
  assert.deepEqual(seen, ['string', 'string']);
});

QUnit.test('loop: a declaration-less head runs its element effect once, ahead of the pass', assert => {
  const log = [];
  let via;
  for ({ of: { name: via } } of [(log.push('element'), Array)]) log.push(typeof via);
  assert.deepEqual(log, ['element', 'string']);
});

QUnit.test('loop: a branching head element serves the arm the runtime takes', assert => {
  const custom = { of: { name: 'CUSTOM' } };
  const takesLeft = Date.now() > 0;
  const seen = [];
  let via;
  for ({ of: { name: via } } of [takesLeft ? Array : custom]) seen.push(typeof via);
  for ({ of: { name: via } } of [takesLeft ? custom : Array]) seen.push(via);
  assert.deepEqual(seen, ['string', 'CUSTOM']);
});

QUnit.test('loop: a declaration-less head reaches the static through every level it spells', assert => {
  const seen = [];
  let span;
  for ({ of: { name: { length: span } } } of [Array]) seen.push(typeof span);
  assert.deepEqual(seen, ['number']);
});

/* eslint-disable no-labels, no-extra-label -- relocation must preserve the labeled continue target */
QUnit.test('loop: assignment heads retain instance methods and call effects', assert => {
  const seen = [];
  let at, name;
  const target = {};
  outer: for ({ at: target.method } of [[1, 2], [3, 4]]) {
    seen.push(target.method.call([5, 6], -1));
    continue outer;
  }
  for ({ at } of [[7, 8]]) { /* read outside the body */ }
  seen.push(at.call([9, 10], 0));
  function make() {
    seen.push('make');
    return Array;
  }
  for ({ of: { name } } of [make()]) seen.push(typeof name);
  assert.deepEqual(seen, [6, 6, 9, 'make', 'string']);
});

// a for-of head pattern reads its element behind no identity guard: a reassigned name iterated there
// keeps the whole entry of what it may hold
QUnit.test('for-of: a head pattern reads the statics of a reassigned element', assert => {
  const pick = [].length === 0;
  let source = Set;
  if (pick) source = URL;
  const seen = [];
  for (const { canParse } of [source]) seen.push(typeof canParse);
  assert.deepEqual(seen, ['function']);
});

// a `var` a for-of head binds holds the element after the loop, even where it hoists out of a nested
// block, on both parsers
QUnit.test('for-of: a var head hoisted out of a nested block holds its element', assert => {
  function read(run) {
    if (run) {
      // eslint-disable-next-line no-var -- the hoisted head binding is the case under test
      for (var M of [Map]) { /* the head binds the element */ }
    }
    // eslint-disable-next-line block-scoped-var -- read after the loop, through the hoisted binding
    return typeof M.groupBy;
  }
  assert.same(read(true), 'function');
});

// a for-of head destructuring INTO a member target reads each element's key like its binding twin:
// the target is the write the loop performs, the KEY is a read that asks for its polyfill
QUnit.test('syntax loops: a member target in a for-of head reads the element key', assert => {
  const seen = [];
  const target = {};
  for ({ groupBy: target.fn } of [Map, { groupBy: 7 }]) seen.push(typeof target.fn);
  assert.deepEqual(seen, ['function', 'number']);
});
