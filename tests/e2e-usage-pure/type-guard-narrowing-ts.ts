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

QUnit.test('type-guard-ts: discriminants keep their property identity and their comparison operator', assert => {
  type State = { kind: 1; data: number[] } | { kind: '1'; data: string };
  function dotted(box: { a: { b: State }; 'a.b': State }) {
    if (box.a.b.kind === 1) return box['a.b'].data.at(0);
  }
  function loose(box: State) {
    if (box.kind == 1) return box.data.at(0);
  }
  const list: State = { kind: 1, data: [7] };
  const text: State = { kind: '1', data: 'ab' };
  assert.same(dotted({ a: { b: list }, 'a.b': text }), 'a');
  assert.same(loose(text), 'a');
  assert.same(loose(list), 7);
});

QUnit.test('type-guard-ts: the last discriminant write before the read matters', assert => {
  type State = { kind: 'list'; data: number[] } | { kind: 'text'; data: string };
  function read(state: State) {
    if (state.kind !== 'list') return;
    const alias = state;
    Object.assign(alias, { kind: 'text', data: 'ab' });
    return state.data.at(0);
  }
  function computed(tag: string, data: string) {
    let state: State;
    state = { kind: 'list', data: [7], [tag]: 'text', [data]: 'ab' };
    return state.data.at(0);
  }
  assert.same(read({ kind: 'list', data: [7] }), 'a');
  assert.same(computed('kind', 'data'), 'a');
  assert.same(computed('unused', 'other'), 7);
});

QUnit.test('type-guard-ts: a payload write can keep the original discriminant', assert => {
  type State = { kind: 'list'; data: number[] } | { kind: 'text'; data: string };
  function read(state: State, write: boolean) {
    if (state.kind !== 'list') return;
    const alias: { data: string | number[] } = state;
    if (write) alias.data = 'xy';
    return state.data.at(-1);
  }
  function readAssigned(state: State) {
    if (state.kind !== 'list') return;
    let alias: State;
    Reflect.set(Object.assign(alias = state, {}), 'data', 'xy');
    return alias === state && state.data.at(-1);
  }
  assert.same(read({ kind: 'list', data: [7] }, true), 'y');
  assert.same(read({ kind: 'list', data: [7] }, false), 7);
  assert.same(readAssigned({ kind: 'list', data: [7] }), 'y');
});

QUnit.test('type-guard-ts: a failed partial test and a satisfies constraint keep other receivers', assert => {
  function one(v: unknown): v is 'one' {
    return v === 'one';
  }
  function other(v: string | number[]) {
    if (!one(v)) return v.at(0);
  }
  function member(source: string) {
    return (JSON.parse(source) satisfies { data: number[] }).data.at(0);
  }
  function notInstance(v: string | number[]) {
    if (!(v instanceof Array)) return v.at(0);
  }
  assert.same(other('abc'), 'a');
  assert.same(other([7]), 7);
  assert.same(member('{"data":"ab"}'), 'a');
  assert.same(member('{"data":[7]}'), 7);
  assert.same(notInstance(Array.prototype), undefined);
  assert.same(notInstance('ab'), 'a');
});

QUnit.test('type-guard-ts: a jump in finally overrides a return', assert => {
  function read(v: string | number[], keep: boolean) {
    if (typeof v === 'string') {
      outer: {
        try {
          return;
        } finally {
          if (keep) break outer;
        }
      }
    }
    return v.at(0);
  }
  assert.same(read('ab', true), 'a');
  assert.same(read('ab', false), undefined);
  assert.same(read([7], true), 7);
});

QUnit.test('type-guard-ts: a switch write reaches only a falling-through case', assert => {
  const writes: string[] = [];
  function read(x: string | number[], exit: 'break' | 'return' | 'fallthrough') {
    switch (typeof x) {
      case 'object':
        writes.push(exit);
        x = 'abc';
        if (exit === 'break') break;
        if (exit === 'return') return 'returned';
      case 'string': return x.at(0);
    }
    return 'left';
  }
  assert.same(read([7], 'break'), 'left');
  assert.same(read([7], 'return'), 'returned');
  assert.same(read([7], 'fallthrough'), 'a');
  assert.same(read('text', 'break'), 't');
  assert.deepEqual(writes, ['break', 'return', 'fallthrough']);
});

QUnit.test('type-guard-ts: a replaced static predicate does not select a family', assert => {
  const previous = Number.isFinite;
  function read(v: string | number[]) {
    Number.isFinite = () => true;
    if (Number.isFinite(v)) return v.at(0);
  }
  try {
    assert.same(read([4]), 4);
    assert.same(read('ab'), 'a');
  } finally {
    Number.isFinite = previous;
  }
});
