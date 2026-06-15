// 'key' in Constructor - static/global property checks in usage-pure mode
QUnit.test("'from' in Array -> true", assert => {
  assert.true('from' in Array);
});

QUnit.test("'resolve' in Promise -> true", assert => {
  assert.true('resolve' in Promise);
});

QUnit.test("'keys' in Object -> true", assert => {
  assert.true('keys' in Object);
});

QUnit.test("'Promise' in globalThis -> true", assert => {
  assert.true('Promise' in globalThis);
});

QUnit.test("'Map' in globalThis -> true", assert => {
  assert.true('Map' in globalThis);
});

QUnit.test('feature detection guard pattern', assert => {
  if ('from' in Array) {
    assert.deepEqual(Array.from([1, 2, 3]), [1, 2, 3]);
  } else {
    assert.true(false, 'should not reach here');
  }
});

QUnit.test("'from' in Array && 'resolve' in Promise", assert => {
  assert.true('from' in Array);
  assert.true('resolve' in Promise);
});

// the fold to `true` must still run the obj's side effect (a sequence prefix) exactly once
QUnit.test("'from' in (eff(), Array) -> SE runs once", assert => {
  const log = [];
  const r = 'from' in (log.push('e'), Array);
  assert.true(r);
  assert.deepEqual(log, ['e']);
});

// an assignment-expression obj: the fold keeps the whole assignment, so the binding still updates
QUnit.test("'groupBy' in (m = Map) -> assignment preserved", assert => {
  let m;
  const r = 'groupBy' in (m = Map);
  assert.true(r);
  assert.same(typeof m.groupBy, 'function');
});

// an IIFE-rooted RHS chain: the fold discards the chain but must re-run the IIFE setup once
QUnit.test("'from' in IIFE-proxy chain -> side effect runs once", assert => {
  let calls = 0;
  const r = 'from' in (() => {
    calls++;
    return globalThis;
  })().Array;
  assert.true(r);
  assert.same(calls, 1);
});

QUnit.test("'resolve' in inline call -> side effect runs once", assert => {
  let calls = 0;
  const r = 'resolve' in (() => {
    calls++;
    return Promise;
  })();
  assert.true(r);
  assert.same(calls, 1);
});

// a chain-assignment buried under the RHS member chain is rescued whole: the binding captures
// the IIFE result and the setup runs once
QUnit.test("'from' in chain over assignment -> assignment and side effect preserved", assert => {
  let calls = 0;
  let captured;
  const r = 'from' in (captured = (() => {
    calls++;
    return globalThis;
  })()).Array;
  assert.true(r);
  assert.same(calls, 1);
  assert.same(captured, globalThis);
});

// RHS sequence prefix + chain-root IIFE: both run, in source order
QUnit.test("'from' in (eff(), IIFE-chain) -> SE order preserved", assert => {
  const log = [];
  const r = 'from' in (log.push('s'), (() => {
    log.push('r');
    return globalThis;
  })().Array);
  assert.true(r);
  assert.deepEqual(log, ['s', 'r']);
});

// a SequenceExpression RHS whose TAIL is an assignment: the fold discards the tail's value but must
// still run its effect, so the binding updates even though the membership test collapses to true
QUnit.test("'groupBy' in (eff(), (m = Map)) -> sequence-tail assignment runs", assert => {
  const log = [];
  let m;
  const r = 'groupBy' in (log.push('e'), m = Map);
  assert.true(r);
  assert.deepEqual(log, ['e']);
  assert.same(typeof m.groupBy, 'function');
});

// the chain-root call is buried in a SequenceExpression tail; the sequence wrapper must not hide it
// from the side-effect harvest, so both the prefix and the tail call run in source order
QUnit.test("'from' in (eff(), mk()).Array -> sequence-tail call runs", assert => {
  const log = [];
  const mk = () => {
    log.push('r');
    return globalThis;
  };
  const r = 'from' in (log.push('s'), mk()).Array;
  assert.true(r);
  assert.deepEqual(log, ['s', 'r']);
});

// a side-effecting COMPUTED KEY on the discarded RHS member still runs - the harvest must reach the
// bracket key, not just the object spine
QUnit.test("'fromEntries' in g[(eff(), 'Object')] -> computed-key SE runs", assert => {
  const log = [];
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const r = 'fromEntries' in globalThis[log.push('k'), 'Object'];
  assert.true(r);
  assert.deepEqual(log, ['k']);
});

// the fold discards BOTH operands but each still evaluates, in source order: per ECMA the key (left)
// runs before the object (right)
QUnit.test("(eff(), 'from') in (eff(), Array) -> both operands run, key before object", assert => {
  const log = [];
  const r = (log.push('k'), 'from') in (log.push('o'), Array);
  assert.true(r);
  assert.deepEqual(log, ['k', 'o']);
});
