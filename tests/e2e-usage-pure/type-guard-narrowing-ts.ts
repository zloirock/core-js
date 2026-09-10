// Type-guard narrowing decided by the DECLARED program: overload selection of a predicate call, the
// parameter slot a predicate binds, a guard whose call may not have run, a union arm the resolver
// cannot see, a shadow the guard test never read. The observable is the value in the stripped realms:
// a helper picked for the wrong family throws there, the generic dispatcher answers.

QUnit.test('type-guard-ts: two early-exit guards with a reassignment between them', assert => {
  function decode(v: string | number[]): string | number[] {
    return typeof v === 'string' ? [v.length] : v;
  }
  function assertPresent<T>(v: T): asserts v is NonNullable<T> {
    if (v == null) throw new TypeError('absent');
  }
  function handle(raw: string | number[]) {
    if (typeof raw !== 'string') return null;
    raw = decode(raw);
    assertPresent(raw);
    return raw.at(0);
  }
  assert.same(handle('abc'), 3);
});

QUnit.test('type-guard-ts: a predicate call resolves to the overload its literal argument selects', assert => {
  function isType(v: unknown, kind: 'string'): v is string;
  function isType(v: unknown, kind: 'array'): v is unknown[];
  function isType(v: unknown, kind: string): boolean {
    return kind === 'string' ? typeof v === 'string' : Array.isArray(v);
  }
  function probe(v: unknown) {
    if (isType(v, 'array')) return v.at(0);
    return null;
  }
  assert.same(probe([7]), 7);
  assert.same(probe('s'), null);
});

QUnit.test('type-guard-ts: a predicate call resolves to the overload its arity selects', assert => {
  function isX(v: unknown): v is string;
  function isX(v: unknown, deep: true): v is unknown[];
  function isX(v: unknown, deep?: boolean): boolean {
    return deep ? Array.isArray(v) : typeof v === 'string';
  }
  function probe(v: unknown) {
    if (isX(v, true)) return v.at(1);
    return null;
  }
  assert.same(probe([7, 8]), 8);
});

QUnit.test('type-guard-ts: a class-method predicate binds its parameter on both parsers', assert => {
  class Checker {
    isStr(x: unknown): x is string {
      return typeof x === 'string';
    }
  }
  const c = new Checker();
  function take(input: unknown) {
    if (c.isStr(input)) return input.at(0);
    return null;
  }
  assert.same(take('ab'), 'a');
  assert.same(take([1]), null);
});

QUnit.test('type-guard-ts: an optional-chained predicate compared to false trusts neither side', assert => {
  const obj: { isStr?(x: unknown): x is string } = {};
  function f(input: string | number[]) {
    if (obj.isStr?.(input) !== false) return input.at(0);
    return null;
  }
  assert.same(f([5]), 5);
  assert.same(f('ab'), 'a');
});

QUnit.test('type-guard-ts: the complement branch of an optional call on an absent predicate keeps the union', assert => {
  // the predicate is ABSENT, so the optional call short-circuits and the complement is reached by
  // both arms - which is the whole point: a falsy result may mean the call never ran, so the
  // complement proves nothing and the receiver must keep its union. narrowing it to `string` there
  // would aim the string helper at the array this test passes in
  const isArray = (Array as { absent?(v: unknown): v is unknown[] }).absent;
  function f(value: number[] | string) {
    if (isArray?.(value)) return null;
    return value.at(0);
  }
  assert.same(f([5, 6]), 5);
  assert.same(f('ab'), 'a');
});

QUnit.test('type-guard-ts: an optional call on a static no build can be without still tests its argument', assert => {
  // ... and the same shape over `Array.isArray`, which core-js installs nothing for and calls
  // natively itself: the `?.` cannot short-circuit, so the complement branch really is reached only
  // by the string arm and takes the string helper. the array argument never gets there
  function f(value: number[] | string) {
    if (Array.isArray?.(value)) return null;
    return value.at(0);
  }
  assert.same(f([5, 6]), null);
  assert.same(f('ab'), 'a');
});

QUnit.test('type-guard-ts: a negated structural predicate still narrows after the early exit', assert => {
  interface Box { items: string[] }
  function isBox(x: unknown): x is Box {
    return typeof x === 'object' && x !== null && 'items' in x;
  }
  function probe(x: unknown) {
    if (!isBox(x)) return null;
    return x.items.at(0);
  }
  assert.same(probe({ items: ['q'] }), 'q');
});

QUnit.test('type-guard-ts: a union arm the resolver cannot see keeps the generic dispatch under a neutral guard', assert => {
  type Opaque = ReturnType<typeof makeOpaque>;
  function makeOpaque() {
    return 'opaque';
  }
  function assertPresent<T>(v: T): asserts v is NonNullable<T> {
    if (v == null) throw new TypeError('absent');
  }
  function read(x: number[] | Opaque | null) {
    assertPresent(x);
    return x.at(0);
  }
  assert.same(read([3]), 3);
  assert.same(read('opaque'), 'o');
});

QUnit.test('type-guard-ts: a discriminant-narrowed instance field initializer observes the writes after the class', assert => {
  type A = { kind: 'a'; v: string };
  type B = { kind: 'b'; v: number[] };
  function f(o: A | B) {
    if (o.kind === 'a') {
      class K { p = o.v.at(0); }
      (o as B).kind = 'b';
      (o as B).v = [1, 2];
      return new K().p;
    }
    return null;
  }
  assert.same(f({ kind: 'a', v: 'str' }), 1);
});

QUnit.test('type-guard-ts: a discriminant-narrowed generator IIFE observes the field write after the call', assert => {
  type A = { kind: 'a'; v: string };
  type B = { kind: 'b'; v: number[] };
  function f(o: A | B) {
    if (o.kind === 'a') {
      const it = (function* () { yield o.v.at(0); })();
      (o as B).kind = 'b';
      (o as B).v = [1, 2];
      return it.next().value;
    }
    return null;
  }
  assert.same(f({ kind: 'a', v: 'str' }), 1);
});

QUnit.test('type-guard-ts: a predicate shadowed inside the braced branch is not what the test called', assert => {
  function check(v: unknown): boolean {
    return Array.isArray(v);
  }
  function braced(v: unknown) {
    if (check(v)) {
      const check = (x: unknown): x is string => typeof x === 'string';
      return v.at(0) && check;
    }
    return null;
  }
  assert.same(braced([9]).length, 1);
});
