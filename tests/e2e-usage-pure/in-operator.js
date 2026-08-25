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
if (!Symbol.sham) {
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

// 'key' in <typed instance> - the unambiguous receiver type folds like a static host:
// every actual use of the method is substituted, so the polyfilled world's answer is true
QUnit.test("'flat' in [] -> true (typed-array receiver fold)", assert => {
  assert.true('flat' in []);
});

QUnit.test("'at' in string receiver -> true (typed-string fold)", assert => {
  const s = 'abc';
  assert.true('at' in s);
});

QUnit.test('typed fold keeps both operand side effects in source order', assert => {
  const log = [];
  const r = (log.push('k'), 'flat') in (log.push('r'), [1, 2]);
  assert.true(r);
  assert.deepEqual(log, ['k', 'r']);
});

QUnit.test('non-table key on a typed receiver stays a live probe', assert => {
  assert.false('foo' in [1, 2]);
});

// the fold REPLAYS the receiver call it discards, and only a callee it can reach and prove
// effect-free folds away. an unreachable callee is unknown, not pure
QUnit.test('a folded receiver call still runs', assert => {
  let calls = 0;
  function impureMk() {
    calls += 1;
    return [1];
  }
  const box = {
    make() {
      calls += 1;
      return [1];
    },
  };
  function tag() {
    calls += 1;
    return [1];
  }
  assert.true('flat' in impureMk(), 'the membership answers for the polyfilled world');
  assert.strictEqual(calls, 1, 'a resolvable impure callee runs');
  assert.true('flat' in box.make());
  assert.strictEqual(calls, 2, 'a method callee no resolution reaches runs too');
  assert.true('flat' in tag`x`);
  assert.strictEqual(calls, 3, 'a tagged template invokes its tag');
});

// a BRANCHING operand the fold discards runs exactly as the source wrote it: its effects are
// conditional, so the constant answer must carry the whole selection ahead of it. erasing the
// operand ran neither branch
QUnit.test('a folded logical operand still runs its taken branch', assert => {
  const log = [];
  const absent = null;
  assert.true('flat' in (absent || (log.push('right'), [1])));
  assert.deepEqual(log, ['right'], 'the falsy left hands the test its right operand, effects included');
  const present = [2];
  assert.true('flat' in (present || (log.push('never'), [1])));
  assert.deepEqual(log, ['right'], 'a truthy left short-circuits the operand exactly as native does');
});

QUnit.test('a folded conditional operand runs only the taken branch', assert => {
  const log = [];
  assert.true('flat' in (log.length ? (log.push('then'), [1]) : (log.push('else'), [2])));
  assert.deepEqual(log, ['else'], 'the test runs, the taken branch runs, the other does not');
});

// the RHS of a Symbol.iterator membership is handed to the is-iterable helper as an OPERAND, so a
// `?.` inside it short-circuits only that operand - the helper still runs and throws on the nullish
// value, exactly as `in` does. a guard hoisted around the helper would answer undefined instead, and
// only a COLLAPSIBLE proxy nav reaches that hoist (its `?.` is rendered by the collapse itself)
if (!Symbol.sham) {
  QUnit.test('Symbol.iterator in <short-circuited proxy nav> -> the helper still runs', assert => {
    /* eslint-disable no-unsafe-optional-chaining -- the short-circuited operand IS the form under test */
    if (typeof window == 'undefined') {
      assert.throws(() => Symbol.iterator in globalThis.window?.self, TypeError,
        'the collapsible nav short-circuits and the membership test throws on it');
      assert.throws(() => Symbol.iterator in globalThis.window?.self.missingBox, TypeError,
        'a deeper hop off the same nav throws the same way');
    } else {
      assert.false(Symbol.iterator in globalThis.window?.self, 'a present host answers the real test');
    }
    const host = {};
    assert.throws(() => Symbol.iterator in host.missing?.self, TypeError,
      'control: a non-proxy short-circuited operand throws in every host');
    assert.true(Symbol.iterator in [], 'control: a defined operand answers the test');
    /* eslint-enable no-unsafe-optional-chaining -- end of the short-circuited operands */
  });
}

// a live `?.` on the LHS chain TO the symbol: the value the source hands `in` is undefined
// exactly off-host, so the membership answers for the key `"undefined"` - swapping the LHS for
// an always-defined symbol binding would silently flip that answer. chains that cannot
// short-circuit keep the rewrite
if (!Symbol.sham) {
  QUnit.test('a short-circuiting LHS symbol chain keeps its membership answer', assert => {
    if (typeof window == 'undefined') {
      assert.false(globalThis.window?.Symbol.iterator in [], 'the guarded LHS is undefined off-host');
      assert.false(globalThis.window?.Symbol.asyncIterator in {}, 'every well-known symbol spelling guards');
    } else {
      assert.true(globalThis.window?.Symbol.iterator in [], 'a present host answers the real test');
      assert.false(globalThis.window?.Symbol.asyncIterator in {}, 'a plain object holds no async iterator');
    }
    assert.true(globalThis.Symbol.iterator in [], 'control: a plain chain keeps the rewrite');
    assert.true(globalThis.self?.Symbol.iterator in [], 'control: a resolvable hop keeps the rewrite');
  });
}
