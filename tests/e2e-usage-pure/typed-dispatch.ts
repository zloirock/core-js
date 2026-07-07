// Runtime oracle for TS-TYPE-DRIVEN dispatch: these forms were covered only by compile-time
// fixtures before - a narrowing regression that emits a wrong-type Maybe (throwing on a
// mismatched receiver in a stripped realm) or drops a typed rewrite never surfaced at runtime.
// The plugin runs against the typed AST; types are stripped afterwards.

QUnit.test('typed dispatch: class-field array narrowing drives the instance method', assert => {
  class Box {
    xs: number[] = [10, 20, 30];
    last() {
      return this.xs.at(-1);
    }
  }
  assert.same(new Box().last(), 30);
});

QUnit.test('typed dispatch: parameter annotation narrows the receiver', assert => {
  function lastChar(s: string) {
    return s.at(-1);
  }
  assert.same(lastChar('abc'), 'c');
});

QUnit.test('typed dispatch: annotation union receiver keeps multi-type dispatch', assert => {
  function pick(): string | string[] {
    return (globalThis as any).neverSetFlag ? 'ab' : ['a', 'b'];
  }
  const v = pick();
  assert.true(v.includes('a'));
});

QUnit.test('typed dispatch: generic element passthrough', assert => {
  function first<T>(xs: T[]): T | undefined {
    return xs.at(0);
  }
  assert.same(first([7, 8]), 7);
});

QUnit.test('typed dispatch: assertion guard with own-arg reassignment stays generic', assert => {
  function assertString(v: unknown): asserts v is string { /* type-level only */ }
  function probe(x: unknown) {
    assertString((x = 5, x));
    return (x as any).at(0);
  }
  // end-to-end lock of the transpiled assertion-guard path: it bundles, runs, and stays
  // native-like (numbers have no `.at` - TypeError; the clean path returns the value). on
  // modern Node the Maybe-String and generic helpers both fall back to the same native
  // method, so the runtime here CANNOT separate a stale narrow from a generic dispatch -
  // that discrimination lives in the fixture import-sets and the stripped-realm
  // differential family, where the native method is gone
  assert.throws(() => probe('ignored'));
  function clean(x: unknown) {
    assertString(x);
    return (x as any).at(0);
  }
  assert.same(clean('abc'), 'a');
});

QUnit.test('typed dispatch: as-cast receiver stays callable with correct this', assert => {
  const counters = { hits: [1, 2, 3] } as { hits: number[] };
  assert.same(counters.hits.at(-1), 3);
  assert.deepEqual(counters.hits.flatMap(n => [n, n]), [1, 1, 2, 2, 3, 3]);
});
