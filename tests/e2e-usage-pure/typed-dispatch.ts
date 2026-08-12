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

// two references to ONE generic union declaration that DISAGREE on the type argument. the walk
// expands the declaration once and lets each reference apply its own argument, so the arms stay
// distinct types; collapsing them before the arguments land would leave the proven arm looking
// array-only and emit an array-specific helper for a value the source says can be a string - which
// throws on the string this returns. only the generic dispatch is sound here
QUnit.test('typed dispatch: a union arm disagreeing on the type argument is not collapsed away', assert => {
  type Pair<T> = { kind: 'a'; v: T } | { kind: 'b'; v: string };
  function mk(n: number): Pair<string[]> | Pair<string> {
    return n ? { kind: 'a', v: 'oops' } : { kind: 'b', v: 'x' };
  }
  const u = mk(1);
  assert.same(u.kind === 'a' ? u.v.at(0) : '', 'o');
});

// the same declaration reached through a nested union: the flattener expands it once, and each
// reference must still carry its own arguments through. a shared expansion handed out verbatim
// would make the string arm read as an array here too
QUnit.test('typed dispatch: a shared nested union keeps each reference its own arguments', assert => {
  type Arm<T> = { tag: 'x'; val: T } | { tag: 'y'; val: string };
  type Both = Arm<string[]> | Arm<string>;
  function mk(n: number): Both {
    return n ? { tag: 'x', val: 'plain' } : { tag: 'y', val: 'q' };
  }
  const u = mk(1);
  assert.same(u.tag === 'x' ? u.val.at(-1) : '', 'n');
});

// a for-of head member write rebinds the slot each iteration - body reads of the SAME slot
// alias the user's assigned function, not the prototype method. a TS cast around the read
// receiver must not re-route the call into the typed helper (which would dispatch to the
// real Array method and bypass the assigned function)
QUnit.test('typed dispatch: for-of write alias survives a cast on the body read', assert => {
  const o: number[] = [9, 9];
  const fns = [function () { return 'user'; }];
  for (o.at of fns) {
    assert.same((o as any).at(0), 'user');
  }
});

// the same aliasing with the cast on the HEAD write target: the write still claims the slot,
// so the flat body read stays on the assigned function
QUnit.test('typed dispatch: for-of write alias survives a cast on the head object', assert => {
  const p: number[] = [7];
  const fns = [function () { return 'head'; }];
  for ((p as any).includes of fns) {
    assert.same(p.includes(1), 'head');
  }
});

// a parameter property declares its name in the constructor scope. When the name happens to be a
// global, a body read of it is the CALLER'S ARGUMENT, and substituting the ponyfill there silently
// swaps the user's value for core-js's. Both wrapper spellings run, since only the defaulted one
// carries a pattern the scope walk refuses; `Set` is the control that must still be substituted
QUnit.test('typed dispatch: parameter property shadows a global for the constructor body', assert => {
  class WithoutDefault {
    constructor(private Map: any) {}
    make() {
      return new (this as any).Map('own');
    }
    read() {
      const Local = this.Map;
      return new Local('own');
    }
  }
  function Marker(this: any, tag: string) {
    this.tag = tag;
  }
  assert.same(new WithoutDefault(Marker).make().tag, 'own');
  assert.same(new WithoutDefault(Marker).read().tag, 'own');
});

QUnit.test('typed dispatch: defaulted parameter property shadows a global for the body', assert => {
  function Fallback(this: any, tag: string) {
    this.tag = tag;
  }
  class WithDefault {
    constructor(public WeakMap: any = Fallback) {}
    make() {
      const Local = this.WeakMap;
      return new Local('defaulted');
    }
  }
  assert.same(new WithDefault().make().tag, 'defaulted');
  const control = new Set([1, 2]);
  assert.same(control.size, 2);
});

QUnit.test('typed dispatch: a tagged template supplies its tag real arguments', assert => {
  // a tag is called with the strings array and then the interpolations, so a generic parameter
  // binds from the real interpolation rather than its declared default, and a body that reads the
  // strings parameter is reading an ARRAY however the quasi is spelled
  function bindFromInterpolation<T = number[]>(strings: TemplateStringsArray, value: T): T {
    return value;
  }
  assert.same(bindFromInterpolation`x${'abc'}`.at(-1), 'c');
  function readStrings(strings: readonly string[]) {
    return strings.at(0);
  }
  assert.same(readStrings`only`, 'only');
});

QUnit.test('typed dispatch: an overloaded tag is discriminated by the arguments it really gets', assert => {
  // the one-parameter arm cannot accept two interpolations, so only the arm that can survives
  function pick(strings: TemplateStringsArray): string;
  function pick(strings: TemplateStringsArray, a: number, b: number): number[];
  function pick(strings: TemplateStringsArray, a?: number, b?: number) {
    return a === undefined ? strings[0] : [a, b];
  }
  assert.same(pick`x${1}${2}`.at(-1), 2);
  assert.same(pick`solo`.at(-1), 'o');
});

QUnit.test('typed dispatch: a self-referential annotation stays generic and still runs', assert => {
  // the annotation names the very binding it annotates, so nothing about the value is knowable -
  // the read has to stay on the generic dispatch and serve whatever the value really is
  let selfRef: typeof selfRef = 'abc' as any;
  assert.same(selfRef.at(-1), 'c');
  type SelfIndexed = SelfIndexed['k'];
  const selfIndexed = ['x', 'y'] as any as SelfIndexed;
  assert.same(selfIndexed.at(-1), 'y');
});

QUnit.test('typed dispatch: ReturnType over a function alias binds the supplied argument', assert => {
  // the extracted return is a bare parameter ref: resolved outside the caller's instantiation it
  // re-binds by name to the declared default, which is a foreign family
  type Fn<T> = () => T;
  type ThroughAlias<T = number[]> = ReturnType<Fn<T>>;
  const viaAlias = 'abc' as any as ThroughAlias<string>;
  assert.same(viaAlias.at(-1), 'c');
});
