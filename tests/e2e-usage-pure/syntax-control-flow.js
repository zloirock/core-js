// Control flow around polyfill injection. Every test is DISTINGUISHING: the polyfill sits in a
// controlling expression (switch discriminant, loop condition, ternary arm, short-circuit operand)
// whose side effect must run a precise number of times, or in a finally/catch arm whose value must
// win. A double-evaluated receiver, a non-short-circuited operand, or a dropped finally override
// would change an asserted count or value. Generic "polyfill in a switch" tests are absent.

// --- Discriminant / condition: the polyfilled receiver is evaluated once ---

QUnit.test('control-flow: switch discriminant receiver evaluated once', assert => {
  let calls = 0;
  const pick = () => {
    calls += 1;
    return [1, 2, 3];
  };
  let hit;
  switch (pick().at(-1)) {
    case 1: hit = 'one'; break;
    case 2: hit = 'two'; break;
    case 3: hit = 'three'; break;
    default: hit = 'other';
  }
  assert.same(hit, 'three');
  assert.same(calls, 1);
});

QUnit.test('control-flow: if-condition polyfill receiver evaluated once', assert => {
  let calls = 0;
  const get = () => {
    calls += 1;
    return [4, 5, 6];
  };
  let branch;
  if (get().includes(5)) branch = 'yes'; else branch = 'no';
  assert.same(branch, 'yes');
  assert.same(calls, 1);
});

QUnit.test('control-flow: while condition polyfill evaluated once per iteration', assert => {
  let probes = 0;
  const queue = [1, 2, 3];
  let drained = 0;
  while (Array.of(...queue).at(0) !== undefined && (probes += 1, true)) {
    queue.shift();
    drained += 1;
  }
  assert.same(drained, 3);
  assert.same(probes, 3);
});

QUnit.test('control-flow: do-while accumulates with one polyfill call per pass', assert => {
  let calls = 0;
  const out = [];
  let i = 0;
  do {
    calls += 1;
    out.push(Array.of(i).at(0));
    i += 1;
  } while (i < 3);
  assert.deepEqual(out, [0, 1, 2]);
  assert.same(calls, 3);
});

// --- Short-circuit operands skip the polyfill entirely ---

QUnit.test('control-flow: short-circuit guard skips the polyfill operand', assert => {
  let calls = 0;
  const risky = () => {
    calls += 1;
    return [1, 2, 3].at(-1);
  };
  const safe = false;
  const result = safe && risky();
  assert.false(result);
  assert.same(calls, 0);
});

QUnit.test('control-flow: guard-then-polyfill chains evaluate left to right', assert => {
  const order = [];
  const guard = () => {
    order.push('guard');
    return true;
  };
  const value = () => {
    order.push('value');
    return Array.of(8, 9).at(-1);
  };
  const out = guard() && value();
  assert.same(out, 9);
  assert.deepEqual(order, ['guard', 'value']);
});

// --- Ternary / nested ternary: only the taken arm's polyfill runs ---

QUnit.test('control-flow: ternary runs only the selected arm receiver', assert => {
  let a = 0;
  let b = 0;
  const left = () => {
    a += 1;
    return [1, 2].at(-1);
  };
  const right = () => {
    b += 1;
    return [3, 4].at(-1);
  };
  const choose = cond => cond ? left() : right();
  assert.same(choose(false), 4);
  assert.same(a, 0);
  assert.same(b, 1);
});

QUnit.test('control-flow: nested ternary picks one polyfill branch', assert => {
  const hits = { lo: 0, mid: 0, hi: 0 };
  const arm = key => {
    hits[key] += 1;
    return Array.of(key).at(0);
  };
  const select = n => n < 0 ? arm('lo') : n === 0 ? arm('mid') : arm('hi');
  assert.same(select(5), 'hi');
  assert.deepEqual(hits, { lo: 0, mid: 0, hi: 1 });
});

// --- try / catch / finally: arm values and ordering ---

QUnit.test('control-flow: finally return overrides a try return carrying a polyfill', assert => {
  const fn = () => {
    try {
      return Array.of('try').at(0);
    } finally {
      // eslint-disable-next-line no-unsafe-finally -- testing finally override
      return Array.of('finally').at(0);
    }
  };
  assert.same(fn(), 'finally');
});

QUnit.test('control-flow: finally runs after a polyfilled try value is computed', assert => {
  const order = [];
  const fn = () => {
    try {
      const v = Array.of(1, 2, 3).at(-1);
      order.push('try');
      return v;
    } finally {
      order.push('finally');
    }
  };
  assert.same(fn(), 3);
  assert.deepEqual(order, ['try', 'finally']);
});

QUnit.test('control-flow: optional catch binding handles a throw from polyfill input', assert => {
  let caught = false;
  try {
    Array.from(null);
  } catch {
    caught = true;
  }
  assert.true(caught);
});

QUnit.test('control-flow: thrown value built from a polyfill is inspected in catch', assert => {
  let message;
  try {
    throw new Error(`last:${ Array.of(7, 8, 9).at(-1) }`);
  } catch (error) {
    message = error.message;
  }
  assert.same(message, 'last:9');
});

QUnit.test('control-flow: catch arm computes a polyfilled fallback once', assert => {
  let calls = 0;
  const fallback = () => {
    calls += 1;
    return Array.of('fallback').at(0);
  };
  let value;
  try {
    throw new Error('boom');
  } catch {
    value = fallback();
  }
  assert.same(value, 'fallback');
  assert.same(calls, 1);
});

// --- Labeled loops: break/continue after a polyfill, evaluated the expected number of times ---

QUnit.test('control-flow: nested-loop search stops after the matching polyfill result', assert => {
  let probes = 0;
  const find = grid => {
    for (const row of grid) {
      for (const cell of row) {
        probes += 1;
        if (Array.of(cell).at(0) === 4) return cell;
      }
    }
    return null;
  };
  assert.same(find([[1, 2], [3, 4], [5, 6]]), 4);
  assert.same(probes, 4);
});

QUnit.test('control-flow: skip-row guard keeps only fully-valid rows', assert => {
  const kept = [];
  for (const row of [[1, -1], [2, -2], [3, 3]]) {
    if (row.some(cell => cell < 0)) continue;
    for (const cell of row) {
      kept.push(Array.of(cell).at(0));
    }
  }
  assert.deepEqual(kept, [3, 3]);
});

// --- Sequence in unusual positions ---

QUnit.test('control-flow: switch arms each compute a distinct polyfill result', assert => {
  const label = n => {
    switch (n) {
      case 1: return Array.of('one').at(0);
      case 2: return Array.of('two').at(0);
      case 3: return Array.of('three').at(0);
      default: return 'none';
    }
  };
  assert.same(label(2), 'two');
  assert.same(label(3), 'three');
  assert.same(label(9), 'none');
});

QUnit.test('control-flow: for-in breaks early after a polyfill match', assert => {
  const obj = Object.fromEntries([['a', 1], ['b', 2], ['c', 3]]);
  let seen = 0;
  let stop = '';
  for (const key in obj) {
    seen += 1;
    if (Array.of(obj[key]).at(0) === 2) {
      stop = key;
      break;
    }
  }
  assert.same(stop, 'b');
  assert.same(seen, 2);
});

// --- Conditional receiver selection (per-branch destructure inside control flow) ---

QUnit.test('control-flow: conditional receiver destructure picks the right polyfill', assert => {
  const choose = cond => {
    const { from } = cond ? Array : { from: () => 'fallback' };
    return from('ab');
  };
  assert.deepEqual(choose(true), ['a', 'b']);
  assert.same(choose(false), 'fallback');
});

QUnit.test('control-flow: early return in one branch carries a polyfill, other branch differs', assert => {
  const classify = arr => {
    if (arr.length === 0) return Array.of('empty').at(0);
    return arr.at(-1);
  };
  assert.same(classify([]), 'empty');
  assert.same(classify([1, 2, 3]), 3);
});

QUnit.test('control-flow: rejection caught around a polyfilled combinator', assert => {
  const async = assert.async();
  Promise.any([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])
    .catch(error => {
      assert.deepEqual(error.errors.map(e => e.message), ['a', 'b']);
      async();
    });
});

QUnit.test('control-flow: while draining a polyfilled iterator runs once per element', assert => {
  let pulls = 0;
  const iter = Iterator.from([1, 2, 3]).map(x => {
    pulls += 1;
    return x * 10;
  });
  const out = [];
  let step = iter.next();
  while (!step.done) {
    out.push(step.value);
    step = iter.next();
  }
  assert.deepEqual(out, [10, 20, 30]);
  assert.same(pulls, 3);
});
