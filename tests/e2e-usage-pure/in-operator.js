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
  function mk() {
    log.push('r');
    return globalThis;
  }
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

// a concatenated key whose left operand carries a SE: the fold collapses the `+` whole, so the
// harvest must descend into the BinaryExpression or the embedded effect is lost
QUnit.test('concat key with a side effect in Array -> the effect runs', assert => {
  const log = [];
  // eslint-disable-next-line prefer-template -- the `+` concat IS the folded key under test
  const r = (log.push(1), 'fr') + 'om' in Array;
  assert.true(r);
  assert.deepEqual(log, [1]);
});

// same for a template-literal key: the fold discards the template whole, so the harvest must reach
// its interpolated expressions
QUnit.test('template key with a side effect in Array -> the effect runs', assert => {
  const log = [];
  // eslint-disable-next-line no-sequences -- the interpolation sequence IS the case under test
  const r = `${ log.push(1), 'fr' }om` in Array;
  assert.true(r);
  assert.deepEqual(log, [1]);
});

// the RHS object carries BOTH a chain-root receiver call AND a computed-key SE: each must run at its
// true source position - the receiver (object) before the bracket key, not at a fixed harvest slot
QUnit.test('receiver call before a computed key on the RHS object -> source order', assert => {
  const log = [];
  const r = 'fromEntries' in (() => {
    log.push('r');
    return globalThis;
    // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  })()[log.push('k'), 'Object'];
  assert.true(r);
  assert.deepEqual(log, ['r', 'k']);
});

// the in-fold discards the LHS whole, folding to the constant `true`: a side-effect-free proxy-global
// buried in the discarded LHS prefix is dropped (its orphaned rewrite crashed the unplugin compose),
// while a real side-effect prefix still runs in source order before the object
QUnit.test("(globalThis, 'from') in Array -> proxy-global prefix drops, folds true", assert => {
  const log = [];
  function eff() {
    return log.push('e');
  }
  assert.true((globalThis, 'from') in Array);
  assert.true((eff(), 'from') in Array);
  assert.deepEqual(log, ['e']);
});

// a Symbol.iterator membership rewrites to a get-iterator call; a sequence prefix on its receiver
// lexically PRECEDES the chain-root receiver call, so it must run first - source order [p, r], not
// the reverse. gated off sham Symbol (the get-iterator path is unreliable there)
if (typeof Symbol == 'function' && !Symbol.sham) {
  QUnit.test('(eff(), IIFE()).Symbol.iterator in [] -> prefix before receiver call', assert => {
    const log = [];
    const r = (log.push('p'), (() => {
      log.push('r');
      return globalThis;
    })()).Symbol.iterator in [];
    assert.true(r);
    assert.deepEqual(log, ['p', 'r']);
  });

  // a NESTED SequenceExpression in the symbol receiver tail: the rewrite replaces the LHS, so the
  // inner tail's effect must be harvested too, not just the outer prefix - a prefix-only walk dropped
  // the inner `h()`, losing it at runtime. is-iterable path (Symbol.iterator -> a call)
  QUnit.test('(g(), (h(), Symbol)).iterator in [] -> nested-tail SE runs in source order', assert => {
    const log = [];
    // eslint-disable-next-line @stylistic/no-extra-parens -- the inner parens ARE the nested SequenceExpression under test
    const r = (log.push('g'), (log.push('h'), Symbol)).iterator in [];
    assert.true(r);
    assert.deepEqual(log, ['g', 'h']);
  });

  // same nesting on the symbol/X path (Symbol.asyncIterator -> binding swap, not a call)
  QUnit.test('(g(), (h(), Symbol)).asyncIterator in {} -> nested-tail SE runs in source order', assert => {
    const log = [];
    // eslint-disable-next-line @stylistic/no-extra-parens -- the inner parens ARE the nested SequenceExpression under test
    const r = (log.push('g'), (log.push('h'), Symbol)).asyncIterator in {};
    assert.false(r);
    assert.deepEqual(log, ['g', 'h']);
  });

  // arbitrarily deep nesting: every level's effect must surface, in source order
  QUnit.test('deep-nested sequence in symbol receiver -> all effects run in order', assert => {
    const log = [];
    // eslint-disable-next-line @stylistic/no-extra-parens -- the nested parens ARE the deep SequenceExpression under test
    const r = (log.push('a'), (log.push('b'), (log.push('c'), Symbol))).asyncIterator in {};
    assert.false(r);
    assert.deepEqual(log, ['a', 'b', 'c']);
  });

  // an assignment receiver: the rewrite discards the receiver value but the assignment must still run
  QUnit.test('(m = Symbol).asyncIterator in {} -> assignment receiver preserved', assert => {
    let m;
    const r = (m = Symbol).asyncIterator in {};
    assert.false(r);
    assert.same(typeof m, 'function');
  });

  // a NESTED sequence prefix AND a chain-root receiver call together: the nested prefixes harvest
  // structurally while the call threads in at its true source position, so all three run in order
  QUnit.test('nested prefix + chain-root call in symbol receiver -> source order', assert => {
    const log = [];
    // eslint-disable-next-line @stylistic/no-extra-parens -- the inner parens ARE the nested SequenceExpression under test
    const r = (log.push('p'), (log.push('q'), (() => {
      log.push('r');
      return globalThis;
    })())).Symbol.asyncIterator in {};
    assert.false(r);
    assert.deepEqual(log, ['p', 'q', 'r']);
  });

  // the symbol-in rewrite discards the LHS whole; a side-effect-free proxy-global buried in the LHS
  // sequence prefix is dropped (its orphaned rewrite crashed the unplugin compose), while a real SE
  // prefix still runs once. the RHS object survives and its membership result is preserved
  QUnit.test('(globalThis, Symbol.iterator) in obj -> proxy-global prefix drops, SE runs', assert => {
    const arr = [1, 2];
    assert.true((globalThis, Symbol.iterator) in arr);
    const log = [];
    function eff() {
      return log.push('e');
    }
    const has = (eff(), Symbol.iterator) in arr;
    assert.true(has);
    assert.deepEqual(log, ['e']);
  });
}
