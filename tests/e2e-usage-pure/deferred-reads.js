// Reads whose EXECUTION TIME is not their source position: an instance field initializer runs at
// `new`-time, a generator body at the first `.next()`, an async body after its `await`, an IIFE inside
// a loop once per iteration - each observes a reassignment that textually follows it. The observable
// is the value in the stripped realms: a helper picked for the wrong family throws there, the generic
// dispatcher answers. Every test pairs the deferred read with a straight-line control.

/* eslint-disable es/no-async-functions -- transpiled by babel */

QUnit.test('deferred read: instance field initializer observes the write after the class', assert => {
  let source = 'abc';
  source = 'def';
  class Widget {
    first = source.at(0);
    static tag = source.at(1);
  }
  source = ['x', 'y'];
  assert.same(new Widget().first, 'x');
  assert.same(Widget.tag, 'e');
});

QUnit.test('deferred read: typeof-guarded instance field initializer observes the write after the class', assert => {
  function build(v) {
    let x = v;
    if (typeof x === 'string') {
      class K { p = x.at(0); }
      x = [7, 8];
      return new K().p;
    }
    return null;
  }
  assert.same(build('str'), 7);
});

QUnit.test('deferred read: early-exit-guarded instance field initializer observes the write after the class', assert => {
  function build(v) {
    let x = v;
    if (typeof x !== 'string') return null;
    class K { p = x.includes(9); }
    x = [9];
    return new K().p;
  }
  assert.true(build('s'));
});

QUnit.test('deferred read: generator IIFE body runs at the first next(), after the write', assert => {
  let O = 'str';
  const it = (function * () { yield O.at(0); })();
  O = [4, 5];
  assert.same(it.next().value, 4);
});

QUnit.test('deferred read: synchronous IIFE body runs at the call, before the write', assert => {
  let P = 'str';
  const r = (function () { return P.at(0); })();
  P = [4, 5];
  assert.same(r, 's');
});

QUnit.test('deferred read: tagged-template IIFE body runs at the template', assert => {
  let x = 'ab';
  (function () { x = [1, 2]; })`tpl`;
  assert.same(x.at(0), 1);
});

QUnit.test('deferred read: async IIFE body after await observes the write', assert => {
  let O = 'str';
  const p = (async () => {
    await Promise.resolve();
    return O.at(0);
  })();
  O = [6, 7];
  return p.then(value => assert.same(value, 6));
});

QUnit.test('deferred read: IIFE inside a loop observes the previous iteration\'s write', assert => {
  let O = 'str';
  const seen = [];
  for (let i = 0; i < 2; i++) {
    seen.push((function () { return O.at(0); })());
    O = [1, 2];
  }
  assert.deepEqual(seen, ['s', 1]);
});

QUnit.test('deferred read: IIFE inside a for-of observes the previous iteration\'s write', assert => {
  let P = 'str';
  const seen = [];
  for (const step of [0, 1]) {
    seen.push((() => P.at(step))());
    P = [1, 2];
  }
  assert.deepEqual(seen, ['s', 2]);
});

QUnit.test('guard staleness: a guard above an await does not outlive the write its caller makes', assert => {
  let x = 'ab';
  let out = 'z';
  async function read() {
    if (typeof x === 'string') {
      await Promise.resolve();
      out = String(x.includes('a,b'));
    }
  }
  const done = read();
  x = ['a', 'b'];
  // the string helper would coerce the array to 'a,b' and answer true; the array's own answer is false
  return done.then(() => assert.same(out, 'false'));
});

QUnit.test('guard staleness: a guard above a yield does not outlive the write its driver makes', assert => {
  let x = 'ab';
  let out = 'z';
  function * read() {
    if (typeof x === 'string') {
      yield 0;
      out = String(x.includes('a,b'));
    }
  }
  const steps = read();
  steps.next();
  x = ['a', 'b'];
  steps.next();
  assert.same(out, 'false');
});

QUnit.test('guard staleness: a read inside a call made on the spot below an await is still read after it', assert => {
  let x = 'ab';
  let out = 'z';
  async function read() {
    if (typeof x === 'string') {
      await Promise.resolve();
      out = (() => String(x.includes('a,b')))();
    }
  }
  const done = read();
  x = ['a', 'b'];
  return done.then(() => assert.same(out, 'false'));
});

QUnit.test('guard staleness: an outer typeof guard does not outlive a loop with a weaker inner guard', assert => {
  function f(value, steps) {
    const seen = [];
    if (typeof value === 'string') {
      for (const step of steps) {
        if (typeof value !== 'number') seen.push(value.at(0));
        value = step(value);
      }
    }
    return seen;
  }
  assert.deepEqual(f('str', [() => [3, 4], () => 'x']), ['s', 3]);
});

QUnit.test('guard staleness: a write inside a preceding case test reaches the matching case', assert => {
  function f(v) {
    let x = v;
    switch (typeof x) {
      // eslint-disable-next-line @stylistic/no-extra-parens, sonarjs/comma-or-logical-or-case -- the write inside a case TEST is the case under test
      case (x = [1, 2], 'number'): break;
      case 'string': return x.at(0);
    }
    return null;
  }
  assert.same(f('str'), 1);
});

QUnit.test('guard identification: a shadowed Number inside a typeof-or group narrows nothing', assert => {
  const Number = { isFinite: () => true };
  function f(x) {
    if (typeof x === 'string' || Number.isFinite(x)) return x.at(0);
    return null;
  }
  assert.same(f([1, 2]), 1);
  assert.same(f('ab'), 'a');
});

QUnit.test('preceding assignment: a shadow assigned inside the fall-through branch is not the outer binding', assert => {
  const seen = [];
  function probe(ok) {
    let data = [];
    data = [...data, 'x'];
    if (ok) {
      // eslint-disable-next-line no-shadow -- the shadow assigned inside the fall-through branch is the case under test
      let data = 'fallback';
      data = data.toUpperCase();
      seen.push(data);
    } else {
      throw new Error('failed');
    }
    return data.includes('x');
  }
  assert.true(probe(true));
  assert.deepEqual(seen, ['FALLBACK']);
});

QUnit.test('early slot: a computed key reading an alias the static block writes runs ahead of that write', assert => {
  let M;
  // every computed key is evaluated when the class is DEFINED, before any static block runs, so the
  // key reads `M` while it is still undefined however far below the write the source places it
  assert.throws(() => class {
    static { ({ Map: M } = globalThis); }
    static [(M.groupBy([1], x => x), 'k')] = 1;
  }, TypeError);
  assert.same(M, undefined);
});
