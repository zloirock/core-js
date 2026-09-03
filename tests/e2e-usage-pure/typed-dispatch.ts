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

// --- Optionality markers surviving the type-layer peels ---
// an optional member admits `undefined` on a present receiver, so `?? fallback` really can yield
// the fallback at runtime. a peel that drops the `?` makes the union look always-truthy, folds it
// to the annotated branch and emits that branch's specific helper - which throws on the fallback
// in a realm without the native method. every form below spells the same optionality through a
// different peel, and each asserts the FALLBACK value: a wrong narrow cannot survive it

QUnit.test('typed dispatch: `Partial<>` makes its members admit undefined', assert => {
  interface Source { items: number[] }
  const partial: Partial<Source> = {};
  assert.same((partial.items ?? 'fallback').at(0), 'f');
  type Aliased = Partial<Source>;
  const aliased: Aliased = {};
  assert.same((aliased.items ?? 'fallback').at(-1), 'k');
});

QUnit.test('typed dispatch: a hand-written mapped `?` matches the utility wrapper', assert => {
  interface Source { items: number[] }
  type Optionalized = { [K in keyof Source]?: Source[K] };
  const mapped: Optionalized = {};
  assert.same((mapped.items ?? 'fallback').at(0), 'f');
  // `-?` is the mirror: it REMOVES the optionality its source declares, so the read below is
  // genuinely always-present and narrowing to the array is correct
  interface OptionalSource { items?: number[] }
  type Requiredized = { [K in keyof OptionalSource]-?: OptionalSource[K] };
  const required: Requiredized = { items: [4, 5] };
  assert.same(required.items.at(-1), 5);
});

QUnit.test('typed dispatch: an optional parameter admits undefined on every omitting call', assert => {
  function firstOf(items?: number[]) {
    return (items ?? 'fallback').at(0);
  }
  assert.same(firstOf(), 'f');
  assert.same(firstOf([9]), 9);
});

declare function parametersTarget(items?: number[]): void;

QUnit.test('typed dispatch: `Parameters<>` carries the parameter optionality into the tuple', assert => {
  const slot = undefined as any as Parameters<typeof parametersTarget>[0];
  assert.same((slot ?? 'fallback').at(-1), 'k');
});

QUnit.test('typed dispatch: a keyof-self value union includes the optional member undefined', assert => {
  interface Source { items?: number[] }
  const viaAnnotation = undefined as any as Source[keyof Source];
  assert.same((viaAnnotation ?? 'fallback').at(0), 'f');
  function read<T extends Source>(source: T, key: keyof T) {
    return (source[key] ?? 'fallback').at(-1);
  }
  assert.same(read({} as Source, 'items'), 'k');
});

QUnit.test('typed dispatch: `Required<>` and `NonNullable<>` strip the optionality back off', assert => {
  interface Source { items?: number[] }
  const required: Required<Source> = { items: [1, 2, 3] };
  assert.same(required.items.at(-1), 3);
  const nonNullable = [4, 5] as NonNullable<Source['items']>;
  assert.same(nonNullable.at(0), 4);
});

// --- Markers and shadowing that decide which FAMILY is served ---
// each case below picks a conditional branch on a type-level marker, so a lost marker does not
// merely widen the answer - it serves the other family's helper to the value the source declares.
// the assertions are on real values, and the stripped realm has no native to fall back on

QUnit.test('typed dispatch: an intrinsic string transformer keeps its literal type', assert => {
  type UpperMatched = Uppercase<'a'> extends 'A' ? number[] : string;
  const matched = [7, 8] as UpperMatched;
  assert.same(matched.at(-1), 8);
  type UpperMissed = Uppercase<'a'> extends 'zz' ? number[] : string;
  const missed = 'abc' as UpperMissed;
  assert.same(missed.at(-1), 'c');
});

QUnit.test('typed dispatch: a readonly view is not its mutable form', assert => {
  type IsMutable<T> = T extends number[] ? number[] : string;
  type MyReadonly<T> = { readonly [K in keyof T]: T[K] };
  type Mutable<T> = { -readonly [K in keyof T]: T[K] };
  const viaMapped = 'abc' as IsMutable<MyReadonly<number[]>>;
  assert.same(viaMapped.at(-1), 'c');
  const viaMutable = [1, 2] as IsMutable<Mutable<Readonly<number[]>>>;
  assert.same(viaMutable.at(-1), 2);
  const viaUtility = 'xyz' as IsMutable<ReadonlyArray<number>>;
  assert.same(viaUtility.at(0), 'x');
});

QUnit.test('typed dispatch: a user declaration outranks the utility of the same name', assert => {
  type Record<K, V> = V[];
  const shadowedAlias: Record<string, number> = [3, 4];
  assert.same(shadowedAlias.at(-1), 4);
  function pick<Awaited extends number[]>(x: Awaited): Awaited {
    return x;
  }
  assert.same(pick([5, 6]).at(-1), 6);
});

declare function ambientMake(): number[];

QUnit.test('typed dispatch: a value binding outranks the ambient declaration it shadows', assert => {
  // the parameter has no initializer to walk, so resolution fell through to the ambient
  // declaration of the same name and served the array helper to the string this really returns
  function viaParam(ambientMake: () => string) {
    return ambientMake().at(-1);
  }
  assert.same(viaParam(() => 'abc'), 'c');
});

QUnit.test('typed dispatch: an identity static passes its argument type through', assert => {
  const frozen = Object.freeze([1, 2, 3]);
  assert.same(frozen.at(-1), 3);
  // an argument whose type is genuinely unknown - a parameter with no annotation and no
  // initializer - makes the call unknown too, so the generic dispatch has to serve whatever
  // really arrives. answering with the registry's `Object` hint injected nothing at all
  function frozenLast(value) {
    return Object.freeze(value).at(-1);
  }
  assert.same(frozenLast('abc'), 'c');
  assert.same(frozenLast([4, 5]), 5);
});

QUnit.test('typed dispatch: a deferred read folds every reachable arm, whatever their order', assert => {
  // the arms disagree in the MIDDLE of the write sequence: a bare reduce over the fold let the
  // arm AFTER the disagreement re-seed the accumulator, so the union answered Array and the
  // string arm got the array helper
  let mixed = [1, 2];
  function read() {
    return mixed.at(-1);
  }
  mixed = 'abc';
  mixed = [3, 4];
  assert.same(read(), 4);
  mixed = 'xyz';
  assert.same(read(), 'z');
});

QUnit.test('typed dispatch: a declaration inside a namespace body serves the reference in it', assert => {
  // a namespace body is a lexical container for one parser and a scope level for the other, so
  // the walk that looks a declaration up could step straight past it to an outer namesake - the
  // wrong family, which throws in a stripped realm - or miss it entirely and drop the rewrite
  interface Items { items: string; }
  const outerItems: Items = { items: 'abc' };

  namespace Local {
    interface Items { items: number[]; }
    export function readParam(v: Items) {
      return v.items.at(-1);
    }
    export function readIncludes(v: Items) {
      return v.items.includes(20);
    }
    // read in the namespace BODY, with no function in between: there the nearest scope is
    // already the one OUTSIDE the namespace, so reaching the local declaration is only possible
    // by anchoring the lookup on the declaration the annotation sits on. the source is opaque on
    // purpose - a literal answers for the annotation and the declaration is never consulted
    const held: Items = JSON.parse('{"items":[40,50]}');
    export const localLast = held.items.at(-1);
  }

  assert.same(Local.readParam({ items: [10, 20, 30] }), 30);
  assert.true(Local.readIncludes({ items: [10, 20] }));
  // the same shadowing reached through a LOCAL annotation rather than a parameter: the member
  // walk re-resolves the type name after the annotation is read, so it has to answer in the
  // namespace the annotation was written in. the source is opaque on purpose - a literal would
  // answer for it and the declaration would never be consulted
  assert.same(Local.localLast, 50);
  // the negative: an annotation written OUTSIDE keeps its own declaration, so this receiver has
  // to stay on the string helper - the array one would throw here in a stripped realm
  assert.same(outerItems.items.at(-1), 'c');
});

QUnit.test('typed dispatch: an unbraced switch case declares into the whole statement', assert => {
  // a switch statement is ONE block scope spanning every case, and its declarations hang off
  // `cases` rather than a plain body - a walk reading only `.body` sees none of them and answers
  // with the outer namesake instead
  interface Row { items: string; }
  const outerRow: Row = { items: 'xyz' };
  const k = 1;
  let seen: number | undefined;
  switch (k) {
    case 1:
      interface Row { items: number[]; }
      // the initializer has to be opaque to the type layer AND live at runtime: a literal - even
      // behind an `any` annotation - answers by itself and the case-local declaration is never
      // consulted, so the lock passes whether or not the walk reaches it
      const row: Row = JSON.parse('{"items":[70,80,90]}');
      seen = row.items.at(-1);
  }

  assert.same(seen, 90);
  assert.same(outerRow.items.at(-1), 'z');
});

QUnit.test('typed dispatch: a destructured method keeps the return type of its signature', assert => {
  // NOT a fail-before lock: before the fix this resolved to the GENERIC helper, which runs fine in
  // a stripped realm too - the difference is only visible in the chosen helper, which the fixtures
  // pin. this guards the other direction: a future regression that picks the wrong FAMILY here
  // hands a string helper an array and throws where the generic one merely degraded
  interface Api {
    list(): number[];
    text: () => string;
  }
  const api: Api = {
    list: () => [1, 2, 3],
    text: () => 'ab',
  };
  const { list, text } = api;

  assert.same(list().at(-1), 3);
  assert.same(text().padStart(3, '-'), '-ab');
});

QUnit.test('typed dispatch: an overloaded member read through a destructure stays generic', assert => {
  // the head this lane would have picked is the WRONG one for the call that follows, and in pure a
  // wrong head is a throw rather than a degrade - the stripped realm is where that difference shows.
  // the direct call keeps its discrimination, so both halves are asserted side by side
  interface Api {
    pick(x: number): number[];
    pick(x: string): string;
  }
  const api: Api = { pick: ((x: any) => (typeof x === 'number' ? [10, 20, 30] : 'abc')) as Api['pick'] };

  assert.same(api.pick(1).at(-1), 30);
  const { pick } = api;
  assert.same(pick(1).at(-1), 30);
  assert.same(pick('s').at(-1), 'c');
});

QUnit.test('typed dispatch: an enum-member key names its method like every other spelling', assert => {
  // the key spells a method name through a TS enum, which only the type layer can fold. in a stripped
  // realm the read has to be the POLYFILL - a missed claim leaves the native the realm does not have,
  // so this asserts the injection itself, not just the value
  enum Keys { AT = 'at', FLAT = 'flat' }
  const arr = [1, [2, 3]];

  assert.same(arr[Keys.FLAT]().at(-1), 3, 'the enum-keyed call and the dotted read after it');
  assert.same([4, 5, 6][Keys.AT](-1), 6, 'and an enum-keyed instance method on a literal receiver');
  // the negative that a STRIPPED realm can also answer: a member the enum does not declare names
  // nothing, so the read is undefined and the call throws in either environment. the look-alike
  // object key is a structural negative - it reads a NATIVE slot this realm may not have, so the
  // fixture owns it and this lane stays on what the runtime can decide
  assert.throws(() => ([7] as any)[(Keys as any).MISSING](0), TypeError, 'an undeclared member is undefined');
});

QUnit.test('typed dispatch: a PATCHED enum member keeps the call the source makes', assert => {
  // the declared member says one method, the program rewrites the slot to another, and the runtime
  // key is the rewritten one. a claim on the declared value would call a DIFFERENT method, so the
  // read has to stay ordinary. both names here are ES3 members no realm strips, which is what lets
  // this lane assert the difference in a stripped realm as well as a full one
  enum Keys { M = 'at' }
  (Keys as any).M = 'join';
  const arr = [1, 2, 3];

  // the DECLARED member names a polyfilled method and the rewritten one an ES3 method: a claim on
  // the declared value would run the ponyfill (present in every realm) and answer 1, while the call
  // the source makes joins. that keeps the discrimination realm-independent - the correct path
  // touches nothing a stripped realm removes
  assert.same(arr[Keys.M]('-'), '1-2-3', 'the rewritten key names the call that actually runs');
  // ... and the twin whose slot nothing rewrites claims its member as usual
  enum Clean { M = 'at' }
  assert.same(arr[Clean.M](-1), 3, 'while an untouched member still dispatches through the polyfill');
});
