// Destructuring: const { method } = Constructor - ObjectPattern path in usagePure

// standalone-post transform leg: detection ran on the fully-lowered text, where class static
// fields are already `_createClass` + assignments - the last-wins container fold this test
// asserts never fires there, and the extraction keeps its native-faithful behavior (an
// unbound this-sensitive static throws). the fold itself stays locked by the other legs
const testUnlessDetectLowered = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

QUnit.test('destructuring: const { from } = Array', assert => {
  const { from } = Array;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('destructuring: const { assign, keys } = Object', assert => {
  const { assign, keys } = Object;
  assert.deepEqual(assign({}, { a: 1 }), { a: 1 });
  assert.deepEqual(keys({ x: 1, y: 2 }), ['x', 'y']);
});

QUnit.test('destructuring: const { resolve, all } = Promise', assert => {
  const { resolve, all } = Promise;
  const async = assert.async();
  all([resolve(1), resolve(2)]).then(r => {
    assert.deepEqual(r, [1, 2]);
    async();
  });
});

QUnit.test('destructuring: const { isFinite, isNaN } = Number', assert => {
  const { isFinite, isNaN } = Number;
  assert.true(isFinite(42));
  assert.false(isFinite(Infinity));
  assert.true(isNaN(NaN));
  assert.false(isNaN(1));
});

QUnit.test('destructuring: const { sign, trunc } = Math', assert => {
  const { sign, trunc } = Math;
  assert.same(sign(-5), -1);
  assert.same(trunc(1.9), 1);
});

QUnit.test('destructuring: const { ownKeys } = Reflect', assert => {
  const { ownKeys } = Reflect;
  assert.deepEqual(ownKeys({ a: 1 }), ['a']);
});

// multi-word method names exercise the kebab->camel conversion in the polyfill-entry
// resolver: canonical entry path uses kebab segments (`reflect/set-prototype-of`,
// `array/from-async`, `promise/with-resolvers`) but lookup-table keys are camelCase.
// without the conversion these destructures would not be recognised as polyfill aliases

QUnit.test('destructuring: const { setPrototypeOf } = Object', assert => {
  const { setPrototypeOf } = Object;
  const obj = {};
  setPrototypeOf(obj, { tag: 'custom' });
  assert.same(obj.tag, 'custom');
});

QUnit.test('destructuring: const { setPrototypeOf } = Reflect', assert => {
  const { setPrototypeOf } = Reflect;
  const obj = {};
  assert.true(setPrototypeOf(obj, { tag: 'reflect' }));
  assert.same(obj.tag, 'reflect');
});

QUnit.test('destructuring: const { fromAsync } = Array', assert => {
  const { fromAsync } = Array;
  const async = assert.async();
  fromAsync([1, 2, 3], x => x * 10).then(arr => {
    assert.deepEqual(arr, [10, 20, 30]);
    async();
  });
});

QUnit.test('destructuring: const { fromEntries, getOwnPropertyDescriptor } = Object', assert => {
  const { fromEntries, getOwnPropertyDescriptor } = Object;
  assert.deepEqual(fromEntries([['a', 1], ['b', 2]]), { a: 1, b: 2 });
  assert.same(getOwnPropertyDescriptor({ x: 42 }, 'x').value, 42);
});

QUnit.test('destructuring: const { canParse, parse } = URL', assert => {
  const { canParse, parse } = URL;
  assert.true(canParse('https://example.com'));
  assert.same(parse('https://example.com').hostname, 'example.com');
});

QUnit.test('destructuring: const { groupBy } = Map (multi-word renamed)', assert => {
  const { groupBy: mapGroupBy } = Map;
  const result = mapGroupBy([1, 2, 3, 4], x => x % 2 ? 'odd' : 'even');
  assert.deepEqual(result.get('odd'), [1, 3]);
});

// rest element - polyfill extracted, rest semantics preserved (from excluded from rest)
QUnit.test('destructuring: rest element with polyfilled property', assert => {
  const { from, ...rest } = Array;
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.false('from' in rest);
});

QUnit.test('destructuring: rest element with multiple polyfilled properties', assert => {
  const { assign, keys, ...rest } = Object;
  assert.deepEqual(assign({}, { a: 1 }), { a: 1 });
  assert.deepEqual(keys({ x: 1 }), ['x']);
  assert.false('assign' in rest);
  assert.false('keys' in rest);
});

// assignment destructuring (not declaration)
QUnit.test('destructuring: assignment expression', assert => {
  let from;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ from } = Array);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

// a destructure-ASSIGNMENT whose VALUE is CAPTURED yields its RHS, so the captured value must be the
// RECEIVER (globalThis), NOT the synth mirror the leaf polyfill would otherwise swap in. live oracle:
// before the fix `alias` was the mirror `{ Array: { of: <polyfill> } }` and `same(alias, globalThis)` failed
QUnit.test('destructuring: captured assignment value is the receiver, not a synth mirror', assert => {
  let of;
  // eslint-disable-next-line @stylistic/no-extra-parens -- parens force a destructure-assignment; without them `{...}` is an object literal
  const alias = ({ Array: { of } } = globalThis);
  assert.same(alias, globalThis, 'the captured value is globalThis, not the synth mirror');
  assert.deepEqual(of(1, 2, 3), [1, 2, 3], 'the leaf still polyfills Array.of');
});

// renamed binding
QUnit.test('destructuring: renamed binding', assert => {
  const { from: arrayFrom } = Array;
  assert.deepEqual(arrayFrom([1]), [1]);
});

// from globalThis proxy
QUnit.test('destructuring: from globalThis', assert => {
  const { Promise: P } = globalThis;
  const async = assert.async();
  P.resolve(42).then(v => {
    assert.same(v, 42);
    async();
  });
});

// a redundant proxy-global hop (`.self`) off a CONST-ALIASED global must collapse in the retained
// rest receiver: `g.self` is undefined on non-browser hosts (incl. Node), so an uncollapsed
// `g.self.Array` would THROW at runtime here. the fix keeps the alias `g` (already the global-this
// polyfill) and drops only `.self` -> `g.Array`. live runtime oracle (fail-before throws in Node)
QUnit.test('destructuring: const-alias proxy-global `.self` hop collapses (top-level const)', assert => {
  const g = globalThis;
  const { from, ...rest } = g.self.Array;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.same(typeof rest, 'object');
});

// same collapse exercised through the parameter-default receiver path
QUnit.test('destructuring: const-alias proxy-global `.self` hop collapses (param default)', assert => {
  const g = globalThis;
  function withDefault({ from, ...rest } = g.self.Array) {
    return [from([4, 5]), typeof rest];
  }
  assert.deepEqual(withDefault(), [[4, 5], 'object']);
});

QUnit.test('destructuring: const { from } = Array ?? null', assert => {
  const { from } = Array ?? null;
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// a redundant `.self` hop in a LOGICAL-expression destructure receiver must collapse in the live
// operand: `globalThis.self` is undefined on non-browser hosts (incl. Node), so an uncollapsed
// `_globalThis.self.Array` THROWS before the `||` can short-circuit. live runtime oracle (fail-before)
QUnit.test('destructuring: proxy-global `.self` hop collapses in a logical-operand receiver', assert => {
  const { from, ...rest } = globalThis.self.Array || Set;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.same(typeof rest, 'object');
});

// a PURE-CTOR logical operand whole-swaps to the pure ctor (`globalThis.self.Map` -> `_Map`): the
// native `globalThis.self.Map` reads `.self` (undefined in Node) and THROWS. live runtime oracle
QUnit.test('destructuring: pure-ctor `.self` logical operand whole-swaps', assert => {
  const { groupBy, ...rest } = globalThis.self.Map || Set;
  assert.same(typeof groupBy, 'function');
  assert.same(typeof rest, 'object');
  assert.same(groupBy([0, 1], n => n % 2).get(0)[0], 0);
});

// an ALIAS proxy root with a `.self` hop in a logical operand collapses the hop (`g.self.Array` ->
// `g.Array`): `g.self` is undefined in Node and would throw. live runtime oracle
QUnit.test('destructuring: alias `.self` logical operand collapses the hop', assert => {
  const g = globalThis;
  const { from, ...rest } = g.self.Array || Set;
  assert.deepEqual(from([4, 5]), [4, 5]);
  assert.same(typeof rest, 'object');
});

// a const-alias chain whose intermediate hop is shadowed by an inner binding must resolve the
// static through the hop's own module-scope declaration, not the inner shadow - else pure bails
// and the static stays raw (undefined on a stripped realm). live runtime oracle
QUnit.test('destructuring: const-alias chain resolves through a shadowed intermediate hop', assert => {
  const arrayRoot = Array;
  const arrayLink = arrayRoot;
  // eslint-disable-next-line no-shadow -- the param shadows the middle hop; that shadow IS the shape under test
  function pick(arrayRoot) {
    const { of } = arrayLink;
    return of(arrayRoot, 2);
  }
  assert.deepEqual(pick(1), [1, 2]);
});

// an IIFE param-default whose winning call-arg is shadowed by an inner var of the same name must
// resolve the arg's static at the call site, not the arrow's inner scope. live runtime oracle
QUnit.test('destructuring: IIFE param-default arg resolves past an inner same-name shadow', assert => {
  const build = (({ of: make } = Array) => {
    // eslint-disable-next-line no-var, no-unused-vars -- the inner var shadows the winning arg name; that shadow IS the shape under test
    var Array;
    return make;
  })(Array);
  assert.deepEqual(build(3, 4), [3, 4]);
});

// a `var` hoists its NAME to the function scope, but its initializer evaluates in the block it is
// written in - an init name shadowed THERE holds, so the receiver is a plain object and the static
// must stay untouched. substituting it would silently un-throw the user's TypeError. live runtime
// oracle: fails on ANY engine (not just a stripped realm) if the receiver is over-resolved
QUnit.test('destructuring: `var` init resolves in its own block, not the hoisted scope', assert => {
  const raceRoot = Promise;
  // control: the same receiver with no block-local shadow does resolve the static
  const { race: liveRace } = raceRoot;
  assert.same(typeof liveRace, 'function');
  {
    // eslint-disable-next-line no-shadow -- the block-local shadow of the init name IS the shape under test
    const raceRoot = {};
    // eslint-disable-next-line no-var -- the hoisted var read outside its block IS the shape under test
    var heldRace = raceRoot;
  }
  {
    // eslint-disable-next-line block-scoped-var -- reading the hoisted var outside its declaring block
    const { race } = heldRace;
    assert.same(race, undefined);
    assert.throws(() => race([]), TypeError);
  }
});

// the PARAM-DEFAULT logical receiver path collapses the `.self` hop in each live non-pure operand
// too (`globalThis.self.Array` -> `_globalThis.Array`), mirroring the const-init path: calling with
// no arg evaluates the default, and an uncollapsed `_globalThis.self.Array` would THROW in Node
// before the `||` can short-circuit. pure-ctor operands whole-swap. live runtime oracle (fail-before)
QUnit.test('destructuring: proxy-global `.self` hop collapses in a param-default logical receiver', assert => {
  function withDefault({ from, ...rest } = globalThis.self.Array || globalThis.self.Set || Map) {
    return [from([6, 7]), typeof rest];
  }
  assert.deepEqual(withDefault(), [[6, 7], 'object']);
});

QUnit.test('destructuring: const { from } = Array || Promise', assert => {
  const { from } = Array || Promise;
  assert.deepEqual(from('ab'), ['a', 'b']);
});

QUnit.test('destructuring: sequence expression init', assert => {
  const { from } = (0, Array);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

// a side-effect-FREE sequence prefix that is an UNINVOKED function expression holding a polyfilled
// call (`[1].at(0)`): the binding resolves from the static tail (`Array`), so the dead prefix is
// dropped without injecting the prefix's polyfill or orphaning a transform inside the dropped span.
// (was unplugin-only: the orphaned inner transform crashed at compose time)
QUnit.test('destructuring: uninvoked SE-free prefix with inner polyfill is dropped', assert => {
  const { from } = (function () { return [1].at(0); }, Array);
  assert.deepEqual(from('xy'), ['x', 'y']);
  // arrow prefix shape (also uninvoked, also side-effect-free)
  // eslint-disable-next-line @stylistic/no-extra-parens -- uninvoked-arrow-prefix shape under test
  const { of } = ((() => [9].at(0)), Array);
  assert.deepEqual(of(1, 2), [1, 2]);
});

// nested sequence parens make the SE prefix non-contiguous in source; the lifted
// statement must rebuild a flat comma list, in source order, with the dead tail gone
QUnit.test('destructuring: nested sequence expression init flattens in order', assert => {
  const log = [];
  // eslint-disable-next-line @stylistic/no-extra-parens -- nested sequence shape under test
  const { from } = (log.push('a'), (log.push('b'), Array));
  assert.deepEqual(log, ['a', 'b']);
  assert.deepEqual(from('ab'), ['a', 'b']);
});

// a `var [...r]` redeclared in a block with a STRING right-hand side: the string spreads into a
// fresh Array, so `r` is an Array and `.at` must use the array-specific helper. a slot-narrow that
// inherited the string RHS would dispatch the string `.at`, which coerces the array via String()
// (`['a','b','c']` -> "a,b,c") and reads ',' at index 1 instead of 'b'. live runtime oracle
QUnit.test('destructuring: var rest redecl with string RHS stays an Array', assert => {
  /* eslint-disable no-var, no-redeclare, block-scoped-var, no-lone-blocks, no-useless-assignment -- block-scoped var rest redecl is the resolver path under test */
  var [...r] = [1, 2];
  {
    var [...r] = 'abc';
  }
  assert.same(r.at(1), 'b');
  /* eslint-enable no-var, no-redeclare, block-scoped-var, no-lone-blocks, no-useless-assignment -- end shape-under-test region */
});

QUnit.test('destructuring: triple-nested sequence expression init', assert => {
  const log = [];
  // eslint-disable-next-line @stylistic/no-extra-parens -- nested sequence shape under test
  const { of } = (log.push('a'), (log.push('b'), (log.push('c'), Array)));
  assert.deepEqual(log, ['a', 'b', 'c']);
  assert.deepEqual(of(1, 2), [1, 2]);
});

// an effect buried in a transparent single-element array wrapper must survive the for-init
// flatten: the loop header can't lift statements, so the discarded wrapper's effect re-embeds
// into the discard sink (a top-level-only sequence peel dropped it with the init)
QUnit.test('destructuring: for-init array-buried SE survives full consume', assert => {
  const log = [];
  let out;
  for (const [{ Array: { from } }] = [(log.push('eff'), globalThis)]; !out;) out = from;
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(out('ab'), ['a', 'b']);
});

// both wrapper levels carry an effect: the sink flattens them in source order
QUnit.test('destructuring: for-init two-level SE prefixes flatten in order', assert => {
  const log = [];
  let out;
  for (const [{ Array: { of } }] = (log.push('outer'), [(log.push('inner'), globalThis)]); !out;) out = of;
  assert.deepEqual(log, ['outer', 'inner']);
  assert.deepEqual(out(1, 2), [1, 2]);
});

// partial consume (a rest sibling survives): the buried effect runs exactly once - neither
// dropped with the swapped element nor doubled by the re-embed
QUnit.test('destructuring: for-init array-buried SE with rest runs once', assert => {
  const log = [];
  let out;
  for (const [{ Array: { fromAsync }, ...rest }] = [(log.push('eff'), globalThis)]; !out;) out = rest && fromAsync;
  assert.deepEqual(log, ['eff']);
  assert.same(typeof out, 'function');
});

// assignment-cascade partial consume: the same single-run guarantee on the assignment host
QUnit.test('destructuring: cascade array-buried SE with rest runs once', assert => {
  const log = [];
  /* eslint-disable prefer-const, @stylistic/no-extra-parens -- the assignment-destructure host (not a declaration) is the shape under test */
  let groupBy;
  let rest;
  ([{ Map: { groupBy }, ...rest }] = [(log.push('eff'), globalThis)]);
  /* eslint-enable prefer-const, @stylistic/no-extra-parens -- end shape-under-test region */
  assert.deepEqual(log, ['eff']);
  assert.same(typeof rest, 'object');
  const grouped = groupBy([1, 2], x => x % 2);
  assert.deepEqual(grouped.get(1), [1]);
});

// a polyfilled call INSIDE the lifted array-buried prefix keeps its own substitution
QUnit.test('destructuring: polyfilled call inside array-buried SE prefix', assert => {
  const w = 'abc';
  const log = [];
  const [{ Array: { from } }] = [(log.push(w.at(-1)), globalThis)];
  assert.deepEqual(log, ['c']);
  assert.deepEqual(from('xy'), ['x', 'y']);
});

// under REST the catch pattern stays whole: the kept key's effect runs with the rebuilt
// pattern, the guarded default after it - and rest still excludes the consumed key
QUnit.test('destructuring: catch rest keeps key effect before the guarded default', assert => {
  const log = [];
  try {
    throw { other: 7 };
  } catch ({ [(log.push('k'), 'at')]: a = (log.push('d'), 'DFLT'), ...rest }) {
    assert.same(a, 'DFLT');
    assert.deepEqual(log, ['k', 'd']);
    assert.same(rest.other, 7);
  }
});

// native evaluates a destructure PER PROP - a guarded default fires BEFORE the following
// prop's key effect (the residual splits into segments around the guard)
QUnit.test('destructuring: guarded default interleaves with following key effects', assert => {
  const log = [];
  const recv = {};
  const {
    [(log.push('k1'), 'at')]: a = (log.push('d1'), 'D1'),
    [(log.push('k2'), 'flat')]: f = (log.push('d2'), 'D2'),
  } = recv;
  assert.same(a, 'D1');
  assert.same(f, 'D2');
  assert.deepEqual(log, ['k1', 'd1', 'k2', 'd2']);
});

// an instance dispatcher returns the receiver's own property on a foreign receiver -
// undefined fires the user default AFTER the key's side effect, exactly like native
QUnit.test('destructuring: instance extraction keeps the user default on a foreign receiver', assert => {
  const log = [];
  const recv = {};
  const { [(log.push('k'), 'at')]: a = (log.push('d'), 'DFLT') } = recv;
  assert.same(a, 'DFLT');
  assert.deepEqual(log, ['k', 'd']);
});

// the wrapper-peeled twin: no key effect, the guard alone preserves the default
QUnit.test('destructuring: array-wrapped instance extraction keeps the default', assert => {
  function pick(o) {
    const [{ flat = 'FB' }] = [o];
    return flat;
  }
  assert.same(pick({}), 'FB');
  assert.same(typeof pick([1, [2]]), 'function');
});

// a typed receiver dispatches the polyfill - always defined, the default is dead like native
// (post-polyfill the method exists), and the key effect still runs once
QUnit.test('destructuring: typed receiver keeps polyfill over default', assert => {
  const log = [];
  const { [(log.push('k'), 'includes')]: inc = null } = [1, 2];
  assert.same(typeof inc, 'function');
  assert.deepEqual(log, ['k']);
});

// an SE-bearing TRAILING init element is evaluated-then-discarded natively - it must keep
// running after the transform (consuming the wrapper level silently dropped it)
QUnit.test('destructuring: SE-bearing trailing array element runs', assert => {
  const log = [];
  const [{ Array: { from } }] = [(log.push('a'), globalThis), log.push('b')];
  assert.deepEqual(log, ['a', 'b']);
  assert.deepEqual(from('xy'), ['x', 'y']);
});

// a dereferenced alias wrapper keeps its trailing SE element at the alias declaration -
// the extraction must proceed (the trailing-extra bail is inline-only) with both effects intact
QUnit.test('destructuring: dereferenced alias wrapper with trailing SE element', assert => {
  const log = [];
  const w = [(log.push('a'), globalThis), log.push('b')];
  const [{ Array: { from } }] = w;
  assert.deepEqual(log, ['a', 'b']);
  assert.deepEqual(from('xy'), ['x', 'y']);
});

// nested levels below a dereferenced alias keep their effects at the alias declaration
// (the trailing-extra bail is inline-only, sticky across deeper levels)
QUnit.test('destructuring: nested level below dereferenced alias extracts', assert => {
  const log = [];
  const wrap2 = [[(log.push('j'), globalThis), log.push('k')]];
  const [[{ Array: { of } }]] = wrap2;
  assert.deepEqual(log, ['j', 'k']);
  assert.deepEqual(of(1, 2), [1, 2]);
});

// an inline SE-bearing extra above a dereferenced element declines host-leaving rewrites:
// the leaf gets the inline-default fallback and every effect stays in place
QUnit.test('destructuring: inline SE extra above dereferenced element', assert => {
  const log = [];
  const w3 = [globalThis];
  const [[{ Object: { hasOwn } }]] = [w3, log.push('m')];
  assert.deepEqual(log, ['m']);
  assert.true(hasOwn({ q: 1 }, 'q'));
  assert.same(w3[0], globalThis);
});

// a bodyless control-slot host with an SE-bearing NESTED-proxy init must transform (a stale
// path after the lift's block-wrap crashed the build) and keep the effect conditional
QUnit.test('destructuring: bodyless host nested-proxy SE init stays conditional', assert => {
  const log = [];
  /* eslint-disable no-var -- bodyless host shape under test */
  if (log.length === 0) var { Array: { from } } = (log.push('eff'), globalThis);
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from('ab'), ['a', 'b']);
  if (log.length === 5) var [{ Array: { of } }] = [(log.push('never'), globalThis)];
  assert.deepEqual(log, ['eff']);
  assert.same(typeof of, 'undefined');
  /* eslint-enable no-var -- end shape-under-test region */
});

// a bodyless host can't lift the SE statement, so the init survives whole
QUnit.test('destructuring: bodyless host keeps the sequence init', assert => {
  const log = [];
  // eslint-disable-next-line no-var -- bodyless host shape under test
  if (log.length === 0) var { fromAsync } = (log.push('eff'), Array);
  assert.deepEqual(log, ['eff']);
  assert.same(typeof fromAsync, 'function');
});

// the value of a destructuring assignment is the RHS object, not the hop member - the
// proxy-hop normalization must leave a used value alone
QUnit.test('destructuring: nested-proxy assignment value is the proxy object', assert => {
  let customY;
  // eslint-disable-next-line @stylistic/no-extra-parens -- assignment-in-init shape under test
  const v = ({ Map: { customY } } = globalThis);
  assert.same(v, globalThis);
  assert.same(typeof customY, 'undefined');
});

// inner-level rest beside a consumed [Symbol.iterator] key under a proxy-global hop. the consumed
// key is extracted via the iterator-method polyfill, and the residual rest pattern re-keys through
// the polyfilled Symbol.iterator binding so the kept sentinel stays a valid computed key. (was
// unplugin-only: the inner sentinel leaked the native [Symbol.iterator], a ReferenceError on ie:11)
// NATIVE-SYMBOL ONLY: conflict with Babel `_toPropertyKey` -> `_toPrimitive`
if (!Symbol.sham) QUnit.test('destructuring: nested-proxy inner rest beside consumed Symbol.iterator', assert => {
  const src = { inner: { [Symbol.iterator]: [1, 2, 3][Symbol.iterator], extra: 'kept' } };
  const { inner: { [Symbol.iterator]: it, ...rest } } = src;
  assert.same(typeof it, 'function');
  // the iterator method works when invoked with its array receiver
  assert.same(it.call([7, 8]).next().value, 7);
  // rest gathers OTHER own keys but EXCLUDES the consumed iterator key
  assert.same(rest.extra, 'kept');
  assert.false(Symbol.iterator in rest);
});

// a SINGLE-property destructure off a proxy global whose key folds to a capitalised NON-identifier
// string. the shape looks like the constructor-anchor one (`{ Map: { groupBy } } = globalThis`), but
// the key cannot be spelled after a dot, so the pattern has to keep its own read. transforming this
// file at all is half the oracle - babel aborted the build on the anchor render; the assertions are
// the other half, since unplugin spliced `_globalThis.App-Key` and read the well-known symbol itself
QUnit.test('destructuring: proxy-global single property under a non-identifier key', assert => {
  globalThis['App-Key'] = { token: 'dashed' };
  globalThis['A.b'] = { token: 'dotted' };
  globalThis.A$b = { token: 'dollar' };
  try {
    const { 'App-Key': { token: dashed } } = globalThis;
    assert.same(dashed, 'dashed', 'a dashed string key reads its own property');
    const dotKey = 'A.b';
    const { [dotKey]: { token: dotted } } = globalThis;
    assert.same(dotted, 'dotted', 'a computed key folded from a binding is not a member tail');
    // the identifier-valid neighbour keeps taking the anchored route
    const { A$b: { token: dollar } } = globalThis;
    assert.same(dollar, 'dollar', 'a `$` identifier key still anchors');
  } finally {
    delete globalThis['App-Key'];
    delete globalThis['A.b'];
    delete globalThis.A$b;
  }
});

// same shape with a key folded from a well-known symbol: globalThis carries no such property, so the
// source itself throws reading the nested pattern. reading `Symbol.iterator` off the proxy instead
// (the pre-fix spelling) would bind `undefined` and erase that throw
// NATIVE-SYMBOL ONLY: conflict with Babel `_toPropertyKey` -> `_toPrimitive`
if (!Symbol.sham) QUnit.test('destructuring: proxy-global single property under a folded symbol key', assert => {
  assert.throws(() => {
    const { [Symbol.iterator]: { description } } = globalThis;
    return description;
  }, TypeError, 'an absent well-known-symbol key throws where the source does');
  const withKey = {};
  withKey[Symbol.iterator] = { description: 'present' };
  const { [Symbol.iterator]: { description } } = withKey;
  assert.same(description, 'present', 'the same shape on a plain object still reads the key');
});

// runtime shape of a `[Symbol.iterator]` extraction whose leaf is an instance member of the
// extracted method. the INJECTION itself is not observable here and is locked by the fixture
// instead: a full realm answers the same either way, and the stripped legs cannot separate them
// because `Function.prototype.name` is not in the strip manifest. what these rows do lock is the
// runtime contract around it - the extraction still yields a working iterator method, a user
// default still fires, and a two-leaf pattern still binds both names
// NATIVE-SYMBOL ONLY: conflict with Babel `_toPropertyKey` -> `_toPrimitive`
if (!Symbol.sham) QUnit.test('destructuring: instance member off a symbol-key extraction', assert => {
  const { [Symbol.iterator]: { name } } = [1, 2];
  assert.same(typeof name, 'string', 'a Function instance member resolves off the extracted method');
  // a DEFAULTED leaf keeps its default - binding the dispatcher result directly would drop it
  const { [Symbol.iterator]: { missingMember = 'fallback' } } = [1, 2];
  assert.same(missingMember, 'fallback', 'an absent member still falls to the user default');
  // two leaves keep the destructure, and both still bind
  const { [Symbol.iterator]: { name: twoName, call: twoCall } } = [1, 2];
  assert.same(typeof twoName, 'string', 'the first leaf binds');
  assert.same(typeof twoCall, 'function', 'the second leaf binds');
  // the extracted method still works as one
  const { [Symbol.iterator]: iterMethod } = [7, 8];
  assert.same(iterMethod.call([7, 8]).next().value, 7, 'the extraction itself is the iterator method');
});

// catch-param destructure: a polyfillable key dispatches off the thrown object; a plain
// key flows through untouched (the pattern stays in place - no receiver restructuring)
QUnit.test('destructuring: catch param polyfillable and plain keys', assert => {
  try {
    throw { flatMap: [1, [2]].flatMap(x => [x]), message: 'boom' };
  } catch ({ flatMap, message }) {
    assert.deepEqual(flatMap, [1, [2]]);
    assert.same(message, 'boom');
  }
});

QUnit.test('destructuring: with default value', assert => {
  const { from = null } = Array;
  assert.same(typeof from, 'function');
  assert.deepEqual(from([1]), [1]);
});

// deferred-SE fixed-point loop: when a destructure SE contains a callback whose body
// has another destructure-with-SE, the inner SE must survive the compiler's lift

QUnit.test('destructuring: nested SE inside lifted callback', assert => {
  const log = [];
  let captured;
  function wrap(obj) {
    log.push('outer');
    captured = obj.fn;
  }
  function innerFn() {
    const { of } = (log.push('inner'), Array);
    return of;
  }
  const { from } = (wrap({ fn: innerFn }), Array);
  assert.deepEqual(log, ['outer']);
  assert.same(typeof captured(), 'function');
  assert.deepEqual(log, ['outer', 'inner']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: triple-level nested SE', assert => {
  const log = [];
  let mid, deep;
  function outer(cb) {
    log.push('outer');
    mid = cb;
  }
  function wrap(cb) {
    log.push('mid');
    deep = cb;
  }
  const { from } = (outer(() => {
    const { of } = (wrap(() => {
      const { fromAsync } = (log.push('deep'), Array);
      return fromAsync;
    }), Array);
    return of;
  }), Array);
  assert.deepEqual(log, ['outer']);
  mid();
  assert.deepEqual(log, ['outer', 'mid']);
  assert.same(typeof deep(), 'function');
  assert.deepEqual(log, ['outer', 'mid', 'deep']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: nested SE in assignment form', assert => {
  const log = [];
  let captured;
  function wrap(obj) {
    log.push('outer');
    captured = obj.fn;
  }
  function innerFn() {
    const { of } = (log.push('inner'), Array);
    return of;
  }
  let from;
  // eslint-disable-next-line prefer-const -- testing assignment-form destructure path
  ({ from } = (wrap({ fn: innerFn }), Array));
  captured();
  assert.deepEqual(log, ['outer', 'inner']);
  assert.same(typeof from, 'function');
});

QUnit.test('destructuring: deeply nested with Array.from / array defaults', assert => {
  const { a: { b = Array.from('xyz'), c: [first = 'none'] = [] } = {} } = { a: { c: [] } };
  assert.deepEqual(b, ['x', 'y', 'z']);
  assert.same(first, 'none');
});

// IIFE-invoked param destructure with a member-expression default + a classifiable caller-arg:
// the caller passes the receiver, so the member default never fires; the polyfill must be wired
// onto the live caller-arg, not the dead default (else the destructured method is undefined)
QUnit.test('destructuring: IIFE member-default overridden by caller-arg', assert => {
  // eslint-disable-next-line es/no-nonstandard-iterator-properties -- testing
  const result = (function ({ of } = globalThis.Iterator) {
    return of(1);
  })(Array);
  assert.deepEqual(result, [1]);
});

// a NESTED spread inside the inline-array spread argument makes the destructured param's runtime
// position variadic, so the synth-swap can't statically locate the live arg and bails to native. a
// mis-counted lift treats `...tail` as one position: with tail length 2 the runtime arg at param 2 is
// the USER object, so a synth / default keyed on the static slot would read the polyfill on its
// legitimate undefined - native keeps the real per-call argument. probing the user object (not a
// proxy) keeps the assertion engine-independent: the bail injects NO polyfill, so a `from` assertion
// would otherwise just read the host's native Array.from (present here, absent on the ie:11 target)
QUnit.test('destructuring: IIFE param-default with nested-spread arg bails to native', assert => {
  const userArg = { other: 1 };
  function pick(tail) {
    // eslint-disable-next-line es/no-nonstandard-array-prototype-properties, unicorn/no-useless-spread -- testing nested-spread bail
    return ((a, b, { from } = []) => from)(...[0, ...tail, Array]);
  }
  assert.same(typeof pick([1, userArg]), 'undefined');
});

// IIFE-identity peel: `(arg => arg)(X)` lifts the call arg X as the receiver. the lift is sound ONLY
// when the param flows unchanged to `return arg` - a rebind before the return makes the runtime
// receiver the reassigned value, so the destructured static reads off the wrong object. an
// over-resolve would substitute the polyfill and wrongly succeed where native throws; these run the
// transformed output to prove the peel resolves the clean case and BAILS every rebind (the native
// throw is preserved). the never-invoked closure is the boundary - it does not run, native resolves,
// and the conservative bail keeps the native receiver
QUnit.test('IIFE-identity peel: clean identity resolves the receiver', assert => {
  const { from } = (arg => arg)(Array);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

QUnit.test('IIFE-identity peel: direct param rebind bails, native throws', assert => {
  assert.throws(() => {
    const { from } = (arg => {
      arg = 'reassigned';
      return arg;
    })(Array);
    from([1, 2]);
  }, TypeError);
});

QUnit.test('IIFE-identity peel: immediately-invoked closure rebind bails, native throws', assert => {
  assert.throws(() => {
    const { of } = (arg => {
      // eslint-disable-next-line unicorn/prefer-block-statement-over-iife -- testing
      (() => { arg = 'reassigned'; })();
      return arg;
    })(Array);
    of(1, 2);
  }, TypeError);
});

QUnit.test('IIFE-identity peel: rebind inside an LHS pattern default bails, native throws', assert => {
  assert.throws(() => {
    let x;
    const { from } = (arg => {
      ({ x = arg = 'rebound' } = {});
      return arg;
    })(Array);
    from([1, 2]);
    return x;
  }, TypeError);
});

QUnit.test('IIFE-identity peel: rebind inside an LHS computed member key bails, native throws', assert => {
  assert.throws(() => {
    const sink = {};
    const { of } = (arg => {
      sink[arg = Promise] = 1;
      return arg;
    })(Array);
    of(1);
  }, TypeError);
});

QUnit.test('IIFE-identity peel: rebind inside an update-target computed key bails, native throws', assert => {
  assert.throws(() => {
    const counts = {};
    const { from } = (arg => {
      counts[arg = Promise]++;
      return arg;
    })(Array);
    from([3]);
  }, TypeError);
});

QUnit.test('IIFE-identity peel: never-invoked closure still resolves the receiver', assert => {
  // the closure writing `arg` is created but NEVER called, so `Result === Array` at runtime - the
  // peel must RESOLVE (inject the polyfill), not bail. bailing would leave native `Array.from`,
  // absent on old engines (this ran green only because a modern host has it). only a closure that
  // actually RUNS reassigns the param and forces the bail
  const { from } = (arg => {
    () => { arg = 'never'; };
    return arg;
  })(Array);
  assert.deepEqual(from([4, 5]), [4, 5]);
});

// --- Computed-key destructuring ---
// a const-Identifier computed key `[k]` is recognised as a polyfill alias just like a plain key:
// declaration form body-extracts (`const m = _polyfill`), param-default form mirrors the key into
// a synth default (`{ [k]: m } = { [k]: _polyfill }`). these run the transformed output to prove
// the binding resolves, a caller-passed receiver still wins, and mutable / sibling-reading keys
// stay on the single-read fallback path

QUnit.test('computed-key: const { [k]: from } = Array', assert => {
  const k = 'from';
  const { [k]: from } = Array;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('computed-key: param-default no-arg uses the polyfilled default', assert => {
  const k = 'of';
  function fn({ [k]: of } = Array) {
    return of(7, 8);
  }
  assert.deepEqual(fn(), [7, 8]);
});

// the synth default scopes the polyfill to the no-arg case; a caller-passed receiver must still
// win. were the computed key body-extracted ("polyfill always wins") both calls would return [1]
QUnit.test('computed-key: param-default preserves a caller-passed receiver', assert => {
  const k = 'of';
  function fn({ [k]: of } = Array) {
    return of(1);
  }
  assert.deepEqual(fn(), [1]);
  const custom = { of: (...args) => ['custom', ...args] };
  assert.deepEqual(fn(custom), ['custom', 1]);
});

// plain key `k` and computed key `[k]` share the Identifier name 'k' but address different slots;
// the per-receiver polyfill map must key them apart, else plain `k` picks up the computed polyfill
QUnit.test('computed-key: plain `k` and computed `[k]` do not collide', assert => {
  const k = 'of';
  // eslint-disable-next-line es/no-nonstandard-array-properties -- plain key 'k' is an intentionally absent property
  function fn({ k: plainK, [k]: ofMethod } = Array) {
    return [plainK, ofMethod(9)];
  }
  const [plainK, ofResult] = fn();
  assert.same(plainK, undefined);
  assert.deepEqual(ofResult, [9]);
});

QUnit.test('computed-key: interior position { from, [k]: build, of }', assert => {
  // computed key is itself a polyfilled static, so it resolves on every target (not just native)
  const k = 'fromAsync';
  function fn({ from, [k]: build, of } = Array) {
    return [from([3]), typeof build, of(4)];
  }
  const [fromResult, buildType, ofResult] = fn();
  assert.deepEqual(fromResult, [3]);
  assert.same(buildType, 'function');
  assert.deepEqual(ofResult, [4]);
});

QUnit.test('computed-key: per-branch synth { from, [k]: len } = cond ? Array : Object', assert => {
  const k = 'length';
  function pick(cond) {
    return (function ({ from, [k]: len } = cond ? Array : Object) {
      return typeof from === 'function' ? [from([5]), typeof len] : null;
    })();
  }
  assert.deepEqual(pick(true), [[5], 'number']);
  assert.same(pick(false), null);
});

// `[of]` reads the SIBLING binding `of`, so the synth default (evaluated before the pattern binds)
// would read the wrong value - the scope-gate keeps this on the single-read inline-default path
QUnit.test('computed-key: sibling-binding read stays single-read', assert => {
  function fn({ of, [of]: picked } = Array) {
    return [typeof of, picked];
  }
  const [ofType, picked] = fn();
  assert.same(ofType, 'function');
  assert.same(picked, undefined);
});

// computed destructure key with a side-effecting prefix `[(eff(), 'from')]` resolving to a
// polyfillable static: the prefix effect runs exactly once AND the static is polyfilled, so `from`
// is a working Array.from even on engines without the native (the polyfill wins instead of leaving
// `from` undefined). regression: the effect was once dropped, then the static was bailed (left
// native -> undefined on ie:11)
QUnit.test('computed-key: side-effecting prefix preserved, run once', assert => {
  const log = [];
  const { [(log.push('eff'), 'from')]: from } = Array;
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

// same bail across other destructure shapes - the side effect must survive in each
QUnit.test('computed-key: side-effecting prefix in nested destructure', assert => {
  const log = [];
  const { x: { [(log.push('eff'), 'from')]: from } } = { x: Array };
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([4, 5]), [4, 5]);
});

QUnit.test('computed-key: side-effecting prefix in param-default destructure', assert => {
  const log = [];
  function pick({ [(log.push('eff'), 'from')]: from } = Array) {
    return from;
  }
  const from = pick();
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([6, 7]), [6, 7]);
});

// the polyfilled key flanked by SIBLING computed keys with their own side-effecting prefixes, on both
// sides. the middle effect can't be lifted out (it would reorder relative to the siblings), so the key
// stays in the residual pattern (value -> throwaway) and the polyfill is extracted separately. all
// three effects must run in SOURCE ORDER, and the siblings must still bind
QUnit.test('computed-key: side-effecting siblings on both sides run in order', assert => {
  const log = [];
  // sibling keys read standard, non-polyfilled Array statics (`length`, `prototype`) so they survive as
  // residual bindings while the middle `from` is polyfilled - the point is that all three key prefixes
  // run in source order
  const { [(log.push('before'), 'length')]: x, [(log.push('eff'), 'from')]: from, [(log.push('after'), 'prototype')]: y } = Array;
  assert.deepEqual(log, ['before', 'eff', 'after']);
  assert.strictEqual(x, Array.length);
  assert.strictEqual(y, Array.prototype);
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

// two ADJACENT polyfilled side-effecting keys: both stay in the residual (renamed), each polyfill
// extracted to its own binding, effects in order
QUnit.test('computed-key: adjacent polyfilled side-effecting keys', assert => {
  const log = [];
  const { [(log.push('e1'), 'from')]: from, [(log.push('e2'), 'of')]: of } = Array;
  assert.deepEqual(log, ['e1', 'e2']);
  assert.deepEqual(from([4, 5]), [4, 5]);
  assert.deepEqual(of(6, 7), [6, 7]);
});

// a side-effecting computed key resolving to an INSTANCE method (`flat`): the polyfill needs the
// receiver, so the key stays in the residual (it can't lift the effect out) and `const m = _flat(arr)`
// is extracted. regression: the effect was dropped (babel) / nothing emitted (unplugin)
QUnit.test('computed-key: side-effecting prefix on instance-method key kept', assert => {
  const log = [];
  const arr = [3, [4]];
  const { [(log.push('eff'), 'flat')]: m } = arr;
  assert.deepEqual(log, ['eff']);
  assert.strictEqual(typeof m, 'function');
});

// the same instance-method SE-key in a destructuring-ASSIGNMENT (no declaration to extract into): the
// destructure stays in place so the effect runs once, then a post-statement overwrite binds the polyfill.
// regression: the effect was dropped (babel) / nothing polyfilled (unplugin bailed native)
QUnit.test('computed-key: side-effecting prefix on instance-method key in assignment', assert => {
  const log = [];
  const arr = [7, [8]];
  let m;
  // eslint-disable-next-line prefer-const -- the ASSIGNMENT form (not a declaration) is the shape under test
  ({ [(log.push('eff'), 'flat')]: m } = arr);
  assert.deepEqual(log, ['eff']);
  assert.strictEqual(typeof m, 'function');
  assert.deepEqual(m.call(arr), [7, 8]);
});

// the computed key's side effect REASSIGNS the receiver binding (a DECLARATION). the instance extraction is
// emitted BEFORE the residual that runs the key, so the polyfill reads the property off the receiver as it
// was before the reassignment - matching native (which reads off the RHS value evaluated ahead of the key).
// `flat` is array-only, so reading off the reassigned-to-string receiver would yield `undefined` - so this
// asserts the pre-key (array) value is read
QUnit.test('computed-key: SE key reassigning the receiver - declaration reads pre-key value', assert => {
  // eslint-disable-next-line no-useless-assignment -- read as the destructure RHS, which evaluates before the computed-key reassignment
  let arr = [[1], [2]];
  const { [(arr = 'overwritten', 'flat')]: m } = arr;
  assert.strictEqual(arr, 'overwritten');
  assert.strictEqual(typeof m, 'function');
  assert.deepEqual(m.call([[3], [4]]), [3, 4]);
});

// multiple SE-key INSTANCE keys on one receiver: every key effect runs once in order, and each binding gets
// its own polyfilled method (each re-references the receiver). regression: babel dropped the 2nd element of
// an assignment (undefined) / crashed on a multi-declarator
QUnit.test('computed-key: multi-element SE-key assignment - both bindings polyfilled', assert => {
  const log = [];
  const arr = [3, [4]];
  let a, b;
  // eslint-disable-next-line prefer-const -- the ASSIGNMENT form (not a declaration) is the shape under test
  ({ [(log.push('e1'), 'flat')]: a, [(log.push('e2'), 'at')]: b } = arr);
  assert.deepEqual(log, ['e1', 'e2']);
  assert.strictEqual(typeof a, 'function');
  assert.strictEqual(typeof b, 'function');
  assert.deepEqual(a.call(arr), [3, 4]);
  assert.deepEqual(b.call(arr, -1), [4]);
});

QUnit.test('computed-key: multi-element SE-key in a multi-declarator - both bindings polyfilled', assert => {
  const log = [];
  const arr = [3, [4]];
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the multi-declarator is under test
  const z = 7, { [(log.push('e1'), 'flat')]: x, [(log.push('e2'), 'at')]: y } = arr;
  assert.strictEqual(z, 7);
  assert.deepEqual(log, ['e1', 'e2']);
  assert.strictEqual(typeof x, 'function');
  assert.strictEqual(typeof y, 'function');
  assert.deepEqual(x.call(arr), [3, 4]);
  assert.deepEqual(y.call(arr, -1), [4]);
});

// instance-method key with side-effecting siblings on both sides: effects run in source order, every
// binding survives
QUnit.test('computed-key: instance-method key with side-effecting siblings runs in order', assert => {
  const log = [];
  const arr = [5, [6]];
  const { [(log.push('before'), 'length')]: x, [(log.push('eff'), 'flat')]: m, [(log.push('after'), 'concat')]: n } = arr;
  assert.deepEqual(log, ['before', 'eff', 'after']);
  assert.strictEqual(x, arr.length);
  assert.strictEqual(typeof m, 'function');
  assert.strictEqual(typeof n, 'function');
});

// for-init declarator: a loop header can't host a preceding statement, so the polyfill is bound as a
// SIBLING declarator (`for (const { [k]: _unused } = Array, from = _Array$from; ...)`). regression: the
// effect was preserved but the static read the NATIVE via an inline default (broken on ie:11)
QUnit.test('computed-key: side-effecting prefix in for-init declarator', assert => {
  const log = [];
  let ran = 0;
  for (const { [(log.push('eff'), 'from')]: from } = Array; ran < 1; ran++) {
    assert.strictEqual(typeof from, 'function');
    assert.deepEqual(from([1, 2]), [1, 2]);
  }
  assert.deepEqual(log, ['eff']);
});

// multi-declarator: the polyfill is extracted to a preceding `const`, the key stays in the residual
// declarator. same native-via-inline-default regression as for-init
QUnit.test('computed-key: side-effecting prefix in multi-declarator', assert => {
  const log = [];
  const a = 1,
        { [(log.push('eff'), 'from')]: from } = Array;
  assert.strictEqual(a, 1);
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([3, 4]), [3, 4]);
});

// nested destructure mixing a STATIC key (`from`) and an INSTANCE key (`flat`) in sibling branches, each
// with its own effecting prefix. BOTH polyfill: the receiver `[1, [2]]` is a side-effect-free literal, so
// it is safe to re-reference for the instance extract (`m = _flatMaybeArray([1, [2]])`). regression: this
// once crashed unplugin (the static branch's split swallowed the sibling branch), and `flat` was left
// NATIVE (undefined on IE 11) - exercise `m` so a missing polyfill fails. both effects run in source order
QUnit.test('computed-key: nested static + instance sibling branches', assert => {
  const log = [];
  const { x: { [(log.push('s'), 'from')]: f }, y: { [(log.push('i'), 'flat')]: m } } = { x: Array, y: [1, [2]] };
  assert.deepEqual(log, ['s', 'i']);
  assert.deepEqual(f([5, 6]), [5, 6]);
  assert.deepEqual(m.call([3, [4]]), [3, 4]);
});

// a side-effecting computed key two levels deep: key kept in place, polyfill bound separately
QUnit.test('computed-key: side-effecting prefix two levels deep', assert => {
  const log = [];
  const { a: { b: { [(log.push('e'), 'from')]: f } } } = { a: { b: Array } };
  assert.deepEqual(log, ['e']);
  assert.deepEqual(f([7, 8]), [7, 8]);
});

// a `...rest` sibling: the key stays in the residual (rest excludes it) and the effect runs ONCE.
// regression: babel lifted the effect AND kept the key for rest exclusion -> the effect ran twice
QUnit.test('computed-key: side-effecting prefix with a rest sibling runs once', assert => {
  const log = [];
  const { [(log.push('eff'), 'from')]: from, ...rest } = Array;
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.strictEqual(typeof rest, 'object');
});

// nested key with a rest sibling - same once-only guarantee one level down
QUnit.test('computed-key: nested side-effecting prefix with a rest sibling runs once', assert => {
  const log = [];
  const { x: { [(log.push('eff'), 'from')]: from, ...rest } } = { x: Array };
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(from([3, 4]), [3, 4]);
  assert.strictEqual(typeof rest, 'object');
});

// nested key in a for-init declarator. regression: the unplugin flatten's statement-lift is illegal in
// a loop header, so it crashed (inner-transformed effect) / dropped the effect; now it stays in place
QUnit.test('computed-key: nested side-effecting prefix in a for-init declarator', assert => {
  const log = [];
  let bound;
  let once = true;
  for (const { x: { [(log.push('eff'), 'from')]: from } } = { x: Array }; once; once = false) bound = from;
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(bound([5, 6]), [5, 6]);
});

// a polyfilled SE-key (`from`) beside a non-polyfilled one (`isArray`, native for the target): the
// polyfilled key uses the residual, the native key stays in the pattern, and BOTH effects run in order
QUnit.test('computed-key: polyfilled + non-polyfilled side-effecting keys both run', assert => {
  const log = [];
  const { [(log.push('a'), 'from')]: from, [(log.push('b'), 'isArray')]: isArr } = Array;
  assert.deepEqual(log, ['a', 'b']);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.true(isArr([]));
});

// a NESTED instance method with an Identifier receiver now polyfills: the receiver is resolved by
// walking the RHS along the nesting key (`y` -> `arr`), and `_flatMaybeArray(arr)` is extracted. the
// extracted `m` is the (unbound) flat method, used via `m.call(arr)` - exactly as native `arr.flat` is
QUnit.test('computed-key: nested instance method with Identifier receiver polyfills', assert => {
  const log = [];
  const arr = [1, [2]];
  const { y: { [(log.push('eff'), 'flat')]: m } } = { y: arr };
  assert.deepEqual(log, ['eff']);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// static + instance mixed nested branches: BOTH polyfill, both effects run in source order
QUnit.test('computed-key: nested mixed static + instance branches both polyfill', assert => {
  const log = [];
  const arr = [1, [2]];
  const { x: { [(log.push('s'), 'from')]: from }, y: { [(log.push('i'), 'flat')]: flat } } = { x: Array, y: arr };
  assert.deepEqual(log, ['s', 'i']);
  assert.deepEqual(from([3, 4]), [3, 4]);
  assert.deepEqual(flat.call(arr), [1, 2]);
});

// a NESTED instance method WITHOUT a side-effect key now polyfills too when the receiver resolves to a
// bare Identifier: `const m = _flatMaybeArray(arr)`. `m` is the unbound flat method, used via `m.call(arr)`
QUnit.test('destructuring: nested instance method (no SE-key) polyfills with Identifier receiver', assert => {
  const arr = [1, [2]];
  const { y: { flat: m } } = { y: arr };
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a nested instance method in a FOR-INIT declarator: the polyfill binds as a SIBLING declarator in the
// loop header (a preceding statement is impossible there). regression: babel threw "Duplicate declaration"
QUnit.test('destructuring: nested instance method in a for-init declarator polyfills', assert => {
  const arr = [1, [2]];
  let once = true;
  let bound;
  for (const { y: { flat: m } } = { y: arr }; once; once = false) bound = m;
  assert.deepEqual(bound.call(arr), [1, 2]);
});

// a loop header is the one destructure host that cannot lift its init, so the receiver collapse
// re-emits the harvested effect INSIDE the header. regression: that re-emitted copy was taken
// before the effect's own polyfill landed and nothing walked it afterwards, so an instance call
// buried in the receiver key stayed native and threw on an engine without it
QUnit.test('destructuring: for-header receiver effect keeps its own polyfill', assert => {
  const arr = [3, 1, 2];
  let calls = 0;
  let bound;
  let once = true;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence hop key is the form under test
  for (const { any: a } = globalThis[(arr.at(0), calls++, 'Promise')]; once; once = false) bound = a;
  assert.strictEqual(calls, 1);
  assert.strictEqual(typeof bound, 'function');
});

// a nested instance method in a MULTI-declarator: the polyfill binds as a TRAILING sibling declarator
// (`..., m = _flatMaybeArray(arr)`), safe even when the receiver is bound earlier in the same declaration
QUnit.test('destructuring: nested instance method in a multi-declarator polyfills', assert => {
  const arr = [1, [2]];
  const z = 1,
        { y: { flat: m } } = { y: arr };
  assert.strictEqual(z, 1);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// two separate destructure declarators in one declaration - a static (`from`) and a nested instance
// (`flat`): both polyfill, the instance binds via its own trailing sibling declarator
QUnit.test('destructuring: two destructure declarators (static + nested instance) both polyfill', assert => {
  const arr = [1, [2]];
  const { a: { from: f } } = { a: Array },
        { y: { flat: m } } = { y: arr };
  assert.deepEqual(f([3, 4]), [3, 4]);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a parenthesized RHS object literal: parens are transparent, so the nested instance still resolves its
// receiver through them (the receiver resolver peels parens / TS casts before walking the literal)
QUnit.test('destructuring: nested instance with a parenthesized RHS polyfills', assert => {
  const arr = [1, [2]];
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing the receiver resolver peels a parenthesized RHS
  const { y: { flat: m } } = ({ y: arr });
  assert.deepEqual(m.call(arr), [1, 2]);
});

// an ArrayPattern wrapper around the nested instance: the receiver resolver walks array indices (not just
// object keys), and the host-emission path already handles ArrayPattern - so this polyfills too
QUnit.test('destructuring: nested instance under an array-pattern wrapper polyfills', assert => {
  const arr = [1, [2]];
  const [{ y: { flat: m } }] = [{ y: arr }];
  assert.deepEqual(m.call(arr), [1, 2]);
});

// an ArrayPattern that DIRECTLY wraps the instance pattern (no intervening object key): the wrapper peels
// to the declarator, and the receiver resolves through the array index
QUnit.test('destructuring: nested instance directly under an array-pattern wrapper polyfills', assert => {
  const arr = [1, [2]];
  const [{ flat: m }] = [arr];
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a nested instance method in a destructuring-ASSIGNMENT (no declaration to extract a `const` into): the
// polyfill appends `m = _flatMaybeArray(arr)` after the statement, overwriting the native value
QUnit.test('destructuring: nested instance in a destructuring-assignment polyfills', assert => {
  const arr = [1, [2]];
  let m;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ y: { flat: m } } = { y: arr });
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a destructuring-assignment with a top-level sibling binding alongside the nested instance: the sibling
// survives the destructure, and the appended instance overwrite (`m = _flatMaybeArray(arr)`) does not
// disturb it
QUnit.test('destructuring: destructuring-assignment with a sibling binding polyfills', assert => {
  const arr = [1, [2]];
  let m;
  let z;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ y: { flat: m }, z } = { y: arr, z: 9 });
  assert.strictEqual(z, 9);
  assert.deepEqual(m.call(arr), [1, 2]);
});

// a side-effect-free LITERAL receiver re-references safely, so the nested instance polyfills even without
// a bare-Identifier receiver - here an array literal, exercised on IE 11 where native `flat` is absent
QUnit.test('destructuring: nested instance off an array-literal receiver polyfills', assert => {
  const { y: { flat: m } } = { y: [1, [2]] };
  assert.deepEqual(m.call([3, [4]]), [3, 4]);
});

// a non-array literal receiver type: a string method off a CONSTANT template literal (a string constant,
// so it re-references like a string literal) polyfills
QUnit.test('destructuring: nested instance off a constant template-literal receiver polyfills', assert => {
  const { y: { padStart: m } } = { y: 'ab' };
  assert.strictEqual(m.call('cd', 4, 'x'), 'xxcd');
});

// an ArrayPattern wrapper whose leaf is a const-ALIAS of the constructor (`const A = Array; [A]`): the
// leaf is canonicalized back to Array, so the static `from` polyfills (it once dropped for the alias)
QUnit.test('destructuring: array-wrapper with a const-alias static leaf', assert => {
  const A = Array;
  const [{ from }] = [A];
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.deepEqual(from('xy'), ['x', 'y']);
});

// the same const-alias canonicalization through the OBJECT-nested resolver (no array wrapper) - a sibling
// code path that must resolve the alias too
QUnit.test('destructuring: object-nested const-alias static leaf', assert => {
  const A = Array;
  const { x: { from } } = { x: A };
  assert.deepEqual(from([3, 4]), [3, 4]);
});

// an SE-bearing IIFE init in a flattenable destructure: the flatten harvests the discarded
// init's chain-root call and re-emits it ahead of the extraction - the side effect runs exactly
// once and the binding gets the polyfill
QUnit.test('destructuring: array-wrapper SE-bearing IIFE init flattens, setup runs once', assert => {
  let calls = 0;
  const [{ from }] = [(() => {
    calls++;
    return Array;
  })()];
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// the no-SE twin flattens to the pure import - the IIFE is dropped whole
QUnit.test('destructuring: array-wrapper no-SE IIFE init flattens', assert => {
  const [{ from }] = [(() => Array)()];
  assert.deepEqual(from([5, 6]), [5, 6]);
});

QUnit.test('destructuring: array-wrapper SE IIFE under member hop flattens, setup runs once', assert => {
  let calls = 0;
  const [{ from }] = [(() => {
    calls++;
    return globalThis;
  })().Array];
  assert.same(calls, 1);
  assert.deepEqual(from([7]), [7]);
});

QUnit.test('destructuring: proxy-receiver SE IIFE host flattens, setup runs once', assert => {
  let calls = 0;
  const [{ Array: { from } }] = [(() => {
    calls++;
    return globalThis;
  })()];
  assert.same(calls, 1);
  assert.deepEqual(from([8, 9]), [8, 9]);
});

// the nested-object twin (no array wrapper): same harvest contract, the host IIFE setup survives
QUnit.test('destructuring: nested-object SE IIFE host flattens, setup runs once', assert => {
  let calls = 0;
  const { Array: { from } } = (() => {
    calls++;
    return globalThis;
  })();
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// branchy init with an SE-bearing IIFE branch: per-branch handling keeps the setup intact
QUnit.test('destructuring: conditional init with SE IIFE branch, setup runs once', assert => {
  let calls = 0;
  const cond = true;
  const { from } = cond ? (() => {
    calls++;
    return Array;
  })() : Array;
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// assignment-form destructure from an SE-bearing IIFE: the setup survives the rewrite
QUnit.test('destructuring: assignment form from SE IIFE, setup runs once', assert => {
  let calls = 0;
  let from;
  // eslint-disable-next-line prefer-const -- the ASSIGNMENT form (not a declaration) is under test
  ({ from } = (() => {
    calls++;
    return Array;
  })());
  assert.same(calls, 1);
  assert.deepEqual(from([3, 4]), [3, 4]);
});

// const-alias wrapper: the IIFE setup runs at the ALIAS declaration; the flatten of the alias
// READ must not re-emit it (once double-ran via a deref-escaped harvest)
QUnit.test('destructuring: alias wrapper with SE IIFE runs setup once', assert => {
  let calls = 0;
  const wrapper = [(() => {
    calls++;
    return Array;
  })()];
  const [{ from }] = wrapper;
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// a chain-assignment in the discarded init is rescued whole: the binding captures the value and
// the setup runs exactly once (it was once silently dropped by the flatten)
QUnit.test('destructuring: assignment in discarded init is rescued', assert => {
  let a;
  const [{ from }] = [(a = globalThis).Array];
  assert.same(a, globalThis);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

QUnit.test('destructuring: assignment host of nested destructure is rescued', assert => {
  let a;
  const { Array: { of } } = a = globalThis;
  assert.same(a, globalThis);
  assert.deepEqual(of(3, 4), [3, 4]);
});

QUnit.test('destructuring: array-leaf assignment with SE IIFE is rescued, all preserved', assert => {
  let calls = 0;
  let a;
  const [{ from }] = [a = (() => {
    calls++;
    return Array;
  })()];
  assert.same(calls, 1);
  assert.same(a, Array);
  assert.same(typeof from, 'function');
});

// the rescued assignment may itself wrap an SE-bearing IIFE: one rescue carries both the
// binding update and the setup, each exactly once
QUnit.test('destructuring: rescued assignment wrapping SE IIFE', assert => {
  let calls = 0;
  let a;
  const [{ from }] = [(a = (() => {
    calls++;
    return globalThis;
  })()).Array];
  assert.same(calls, 1);
  assert.same(a, globalThis);
  assert.deepEqual(from([5]), [5]);
});

// the untaken conditional branch's IIFE must NOT run: branch semantics survive the per-branch
// synth (the taken plain branch yields the polyfill, the call branch stays unevaluated)
QUnit.test('destructuring: conditional init, untaken SE IIFE branch does not run', assert => {
  let calls = 0;
  const cond = false;
  const { from } = cond ? (() => {
    calls++;
    return Array;
  })() : Array;
  assert.same(calls, 0);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// logical RHS with an inline-call side: the call branch synths with its setup rescued; the
// gate value short-circuits exactly as written
QUnit.test('destructuring: logical AND with SE IIFE side, setup runs once', assert => {
  let calls = 0;
  const cond = true;
  const { from } = cond && (() => {
    calls++;
    return Array;
  })();
  assert.same(calls, 1);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// assignment-destructure hosts beyond the expression statement: the receiver still resolves and
// the polyfill is wired (for-init / call-arg positions)
QUnit.test('destructuring: assignment form in call-arg position', assert => {
  let from;
  function id(x) {
    return x;
  }
  id({ Array: { from } } = globalThis);
  assert.deepEqual(from([1, 2]), [1, 2]);
});

// nested parameter default body-extracts under polyfill-always-wins: the no-arg call uses the
// polyfill binding
QUnit.test('destructuring: nested param default, no-arg call gets the polyfill', assert => {
  function f({ Array: { from } } = globalThis) {
    return from([3, 4]);
  }
  assert.deepEqual(f(), [3, 4]);
});

// the caller-passed argument keeps winning over the polyfilled leaf default - a body-extract
// once silently ignored it
QUnit.test('destructuring: nested param default, caller argument wins', assert => {
  function f({ Array: { from } } = globalThis) {
    return from;
  }
  assert.same(f({ Array: { from: 'custom' } }), 'custom');
  assert.same(typeof f(), 'function');
});

// multi-leaf nested param default: every leaf gets its own polyfilled default; a rest sibling
// keeps collecting the remaining keys
QUnit.test('destructuring: nested param default with multiple leaves and rest', assert => {
  function f({ Array: { from, of, ...rest } } = globalThis) {
    return [from([1]), of(2), typeof rest];
  }
  const [a, b, c] = f();
  assert.deepEqual(a, [1]);
  assert.deepEqual(b, [2]);
  assert.same(c, 'object');
});

// an absent leaf in a caller-supplied object stays undefined exactly as native: the synthesized
// default fires only for the no-argument call
QUnit.test('destructuring: nested param default, absent caller leaf stays undefined', assert => {
  function f({ Array: { from } } = globalThis) {
    return from;
  }
  assert.same(f({ Array: {} }), undefined);
  assert.same(typeof f(), 'function');
});

// a declared function's rest-bearing param stays verbatim - the caller-supplied value and the
// rest exclusion behave exactly as native (the old body-extract silently ignored the caller)
QUnit.test('destructuring: declared rest param, caller value passes through', assert => {
  function f({ from, ...rest } = Array) {
    return [from, Object.keys(rest).length];
  }
  const [v, restLen] = f({ from: 'custom', x: 1 });
  assert.same(v, 'custom');
  assert.same(restLen, 1);
});

// rest in a nested param default keeps collecting the REAL receiver's extra enumerable keys
// (an app-extended static) - a synthesized default literal would have dropped them
QUnit.test('destructuring: nested param rest collects app-extended statics', assert => {
  // eslint-disable-next-line es/no-nonstandard-array-properties -- deliberate app-extension probe
  Array.testExtendedHelper = 'ext';
  try {
    function f({ Array: { from, ...rest } } = globalThis) {
      return rest.testExtendedHelper;
    }
    assert.same(f(), 'ext');
  } finally {
    // eslint-disable-next-line es/no-nonstandard-array-properties -- cleanup of the probe
    delete Array.testExtendedHelper;
  }
});

// sibling branches in a nested param default both keep working on the no-argument call - a
// one-branch synthesized literal would TypeError the other branch
QUnit.test('destructuring: nested param default with sibling branches', assert => {
  function f({ Array: { of }, JSON: { stringify } } = globalThis) {
    return [of(1), stringify({ a: 1 })];
  }
  const [a, b] = f();
  assert.deepEqual(a, [1]);
  assert.same(b, '{"a":1}');
});

// an effectful parameter default keeps running its effect on the no-argument call - a
// synthesized literal would have silently dropped it
QUnit.test('destructuring: effectful nested param default keeps the effect', assert => {
  const log = [];
  function f({ Array: { from } } = (log.push(1), globalThis)) {
    return from;
  }
  f();
  assert.same(log.length, 1);
  assert.same(typeof f({ Array: { from: 'x' } }), 'string');
  assert.same(log.length, 1);
});

// duplicate destructure keys: with only no-argument calls both bindings get the polyfilled
// leaf default; a caller-supplied object keeps winning through a visible-caller IIFE (an
// argument-passing caller forbids the lossy leaf defaults on a declared function - that
// shape stays verbatim, native parity)
QUnit.test('destructuring: nested param default with duplicate keys', assert => {
  function f({ Array: { from, from: dup } } = globalThis) {
    return [from, dup];
  }
  const [a, b] = f();
  assert.same(a, b);
  assert.deepEqual(a([1, 2]), [1, 2]);
  const [c, d] = (({ Array: { from, from: dup } } = globalThis) => [from, dup])({ Array: { from: 'x' } });
  assert.same(c, 'x');
  assert.same(d, 'x');
});

// an unpolyfilled side-effecting computed key beside a polyfilled one: the key's prefix effect
// runs exactly once and the unpolyfilled value reads the receiver by its static name
QUnit.test('destructuring: unpolyfilled SE computed key runs its effect once', assert => {
  let c = 0;
  // eslint-disable-next-line es/no-nonstandard-array-properties -- deliberate unpolyfilled-key probe
  const r = (({ from, [(c++, 'custom')]: x } = Array) => [from([1]), x, c])();
  assert.deepEqual(r[0], [1]);
  assert.same(r[1], undefined);
  assert.same(r[2], 1);
});

// per-branch synth with an unpolyfilled sibling: the taken branch supplies the polyfill for the
// resolvable key and the branch receiver's own value for the other
QUnit.test('destructuring: per-branch synth keeps unpolyfilled sibling branch-consistent', assert => {
  const cond = true;
  const r = (({ from, custom } = cond ? Array : Iterator) => [from([1, 2]), custom])();
  assert.deepEqual(r[0], [1, 2]);
  assert.same(r[1], undefined);
});

// multi-key destructure from a conditional with an inline-call branch: the call setup runs
// exactly once and every key works - an unresolved key reads the memoized call result
QUnit.test('destructuring: multi-key call branch memoizes the call once', assert => {
  let c = 0;
  const cond = true;
  const { from, custom } = cond ? (() => {
    c++;
    return Array;
  })() : Array;
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.same(custom, undefined);
  assert.same(c, 1);
});

// nested conditional with two call branches: only the taken branch's call runs, exactly once,
// and its branch-specific polyfill binds
QUnit.test('destructuring: nested conditional call branches memoize per leaf', assert => {
  const a = false;
  const b = true;
  let c = 0;
  // eslint-disable-next-line unicorn/no-unnecessary-nested-ternary -- the nested conditional receiver is the subject under test
  const { of, custom } = a ? (() => {
    c++;
    return Array;
  })() : (b ? (() => {
    c++;
    return Array;
  })() : Array);
  assert.deepEqual(of(7), [7]);
  assert.same(custom, undefined);
  assert.same(c, 1);
});

// the call-site scan: a non-exported function whose every call leaves the default in place gets
// the polyfill via body-extract (nothing exists to lose); a caller passing a real argument keeps
// winning in its own function
QUnit.test('destructuring: call-site scan restores the polyfill for default-only calls', assert => {
  function stays({ from, ...rest } = Array) {
    return [from([1]), Object.keys(rest).length];
  }
  const [arr, restLen] = stays();
  assert.deepEqual(arr, [1]);
  assert.same(restLen, 0);
  function overridden({ of } = Array) {
    return of;
  }
  assert.same(overridden({ of: 'custom' }), 'custom');
});

// the full-tree mirror carries every sibling branch of the synthesized default
QUnit.test('destructuring: mirrored default carries sibling branches', assert => {
  function f({ Array: { of }, JSON: { stringify } } = globalThis) {
    return [of(3), stringify(1)];
  }
  const [a, b] = f();
  assert.deepEqual(a, [3]);
  assert.same(b, '1');
  const custom = f({ Array: { of: v => ['custom', v] }, JSON: { stringify: () => 'cs' } });
  assert.deepEqual(custom[0], ['custom', 3]);
  assert.same(custom[1], 'cs');
});

// a logical fallback default collapses left into the literal - caller values still win
QUnit.test('destructuring: logical fallback default collapses left', assert => {
  function f({ from } = Array || Iterator) {
    return from;
  }
  assert.deepEqual(f()([4, 5]), [4, 5]);
  assert.same(f({ from: 'custom' }), 'custom');
});

// logical-root defaults: pure forms collapse into the mirrored literal; an effectful operand
// keeps running exactly once per evaluation
QUnit.test('destructuring: logical-root nested defaults', assert => {
  const alt = {};
  function f({ Array: { from } } = globalThis || alt) {
    return from;
  }
  assert.deepEqual(f()([8]), [8]);
  assert.same(f({ Array: { from: 'w' } }), 'w');
  let c = 0;
  const m = 1;
  function g({ Array: { of } } = (c++, m) && globalThis) {
    return of;
  }
  assert.same(typeof g(), 'function');
  assert.same(c, 1);
  // the default expression evaluates only on the no-argument call - the caller path skips it
  assert.same(g({ Array: { of: 'x' } }), 'x');
  assert.same(c, 1);
});

// mixed logical operators: the mirror lands inside the left operand of the outer fallback;
// the kept selections stay native on both paths
QUnit.test('destructuring: mixed logical param default', assert => {
  function make(m) {
    const alt = { Array: { from: 'alt' } };
    function f({ Array: { from } } = (m && globalThis) || alt) {
      return from;
    }
    return f();
  }
  assert.same(typeof make(1), 'function');
  assert.same(make(0), 'alt');
});

// effectful logical declarator inits: the mirror swaps only the receiver node, every kept
// operand runs (or stays dead) exactly as native
QUnit.test('destructuring: effectful logical declarator inits', assert => {
  let c = 0;
  const m = 1;
  const { Array: { from } } = (c++, m) && globalThis;
  assert.deepEqual(from([3]), [3]);
  assert.same(c, 1);
  let d = 0;
  const { Array: { of } } = (d++, globalThis) || { Array: {} };
  assert.deepEqual(of(4), [4]);
  assert.same(d, 1);
});

// host-shape edges of the precise receiver mirror: a multi-declarator host keeps its sibling
// and the effect; the assignment-form cascade keeps the whole RHS running
QUnit.test('destructuring: multi-declarator and assignment hosts with effectful logical', assert => {
  let c = 0;
  const m = 1;
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the multi-declarator host IS the shape under test
  const a = 5, { Array: { from } } = (c++, m) && globalThis;
  assert.deepEqual(from([a]), [5]);
  assert.same(c, 1);
  let of;
  // eslint-disable-next-line prefer-const -- assignment-form host is the shape under test
  ({ Array: { of } } = (c++, m) && globalThis);
  assert.deepEqual(of(6), [6]);
  assert.same(c, 2);
});

// both reachable leaves of a guarded fallback unfold: the polyfill binds on the truthy AND the
// falsy selection; an unmirrorable local fallback keeps native semantics
QUnit.test('destructuring: guarded fallback unfolds both leaves', assert => {
  function pick(m) {
    function f({ Array: { from } } = (m && globalThis) || globalThis) {
      return from;
    }
    return f();
  }
  assert.deepEqual(pick(1)([1]), [1]);
  assert.deepEqual(pick(0)([2]), [2]);
  const alt = { Array: { from: 'alt' } };
  const falsy = 0;
  function g({ Array: { from } } = (falsy && globalThis) || alt) {
    return from;
  }
  assert.same(g(), 'alt');
});

// the flatten must not discard a guarded init: the falsy selection keeps its native TypeError,
// the truthy one gets the mirrored polyfill
QUnit.test('destructuring: guarded declarator init keeps falsy-path throw', assert => {
  function attempt(m) {
    try {
      const { Array: { from } } = m && globalThis;
      return typeof from;
    } catch {
      return 'throw';
    }
  }
  assert.same(attempt(1), 'function');
  assert.same(attempt(0), 'throw');
});

// ternary inits: the polyfill binds on either selection; an effectful test runs exactly once;
// a guarded branch keeps its native falsy throw
QUnit.test('destructuring: ternary inits over proxy aliases', assert => {
  function pick(c) {
    const { Array: { from } } = c ? globalThis : globalThis;
    return from;
  }
  assert.deepEqual(pick(true)([1]), [1]);
  assert.deepEqual(pick(false)([2]), [2]);
  const log = [];
  const c = true;
  const { Array: { of } } = (log.push(1), c) ? globalThis : globalThis;
  assert.deepEqual(of(3), [3]);
  assert.same(log.length, 1);
});

// a ternary whose branches DIVERGE - the consequent is a global proxy but the alternate is a
// user object carrying its own static. a falsy test selects the alternate at runtime, so the
// flatten must NOT force the polyfill receiver onto that path; both branches have to agree on a
// global proxy or the destructure stays native (else the alternate's own member is lost)
QUnit.test('destructuring: diverging ternary keeps the native alternate member', assert => {
  const userObj = { Array: { from: x => `USER:${ x }` } };
  const useGlobal = false;
  const { Array: { from } } = useGlobal ? globalThis : userObj;
  assert.same(from('a'), 'USER:a');
});

// a diverging ternary mirroring MULTIPLE inner statics must keep BOTH on the native alternate when
// the test is falsy - each leaf is mirrored independently, so forcing the polyfill on either would
// drop the alternate's own method
QUnit.test('destructuring: diverging ternary keeps native alternate for multiple statics', assert => {
  const userObj = { Array: { from: x => `UF:${ x }`, of: x => `UO:${ x }` } };
  const useGlobal = false;
  const { Array: { from, of } } = useGlobal ? globalThis : userObj;
  assert.same(from('a'), 'UF:a');
  assert.same(of('b'), 'UO:b');
});

// an un-mirrorable conditional destructure (rest / computed key) whose selected user-object branch
// lacks the static must NOT bind a per-branch default - the default would fire on that branch's
// legitimate `undefined` and replace it with the polyfill. it bails to native, so `from` stays
// undefined exactly as the untransformed code (a `= _polyfill` default here would read `function`)
QUnit.test('destructuring: un-mirrorable conditional keeps native undefined on a user branch', assert => {
  const userObj = { Array: {} };
  const useGlobal = false;
  const { Array: { from, ...rest } } = useGlobal ? globalThis : userObj;
  assert.same(typeof from, 'undefined');
  assert.deepEqual(rest, {});
});

// the user object can hide one level deeper - inside the inner ternary's alternate. the bail must
// follow the recursion through the nested conditional: with the inner alternate selected, `from`
// stays undefined exactly as native (a default fired by a top-level-only classifier would bind the
// polyfill here instead)
QUnit.test('destructuring: un-mirrorable nested ternary keeps native undefined on a deep user branch', assert => {
  const userObj = { Array: {} };
  const outer = true;
  const inner = false;
  const { Array: { from, ...rest } } = outer ? (inner ? globalThis : userObj) : globalThis;
  assert.same(typeof from, 'undefined');
  assert.deepEqual(rest, {});
});

// a diverging ternary whose inner key is a COMPUTED const reference (`k = 'from'`) is statically
// resolvable, so it mirrors per branch like a static key rather than bailing: the user-object branch
// keeps its legitimate undefined (no corruption), the proxy branch binds the static. the pattern's
// own `[k]` reads the synth's resolved key
QUnit.test('destructuring: diverging ternary with resolvable computed key mirrors per branch', assert => {
  const k = 'from';
  const userObj = { Array: {} };
  function pick(useGlobal) {
    const { Array: { [k]: f } } = useGlobal ? globalThis : userObj;
    return f;
  }
  assert.same(typeof pick(false), 'undefined');
  assert.same(typeof pick(true), 'function');
});

// a SIDE-EFFECTING computed key on a DIVERGING receiver: the proxy branch polyfills via a per-branch
// synth swap, the user branch keeps its native undefined (a `const f = _polyfill` extraction would bind
// the polyfill on BOTH branches, corrupting the user one), and the key effect runs EXACTLY ONCE per
// evaluation - it lives in the residual LHS pattern, never duplicated into the swapped synth literal
QUnit.test('destructuring: diverging receiver with side-effecting computed key mirrors per branch', assert => {
  const userObj = { Array: {} };
  let effs = 0;
  function pick(useGlobal) {
    const { Array: { [(effs++, 'from')]: f } } = useGlobal ? globalThis : userObj;
    return f;
  }
  assert.same(typeof pick(false), 'undefined');
  assert.same(effs, 1);
  assert.same(typeof pick(true), 'function');
  assert.same(effs, 2);
});

// the same diverging SE-key mirror on the PARAMETER-DEFAULT host (a distinct path from the declarator):
// calling with no argument uses the default receiver, so the user branch keeps native undefined and the
// proxy branch polyfills, the key effect running exactly once
QUnit.test('destructuring: param-default diverging receiver with side-effecting computed key mirrors', assert => {
  const userObj = { Array: {} };
  let effs = 0;
  function pick(useGlobal) {
    return (function ({ Array: { [(effs++, 'from')]: from } } = useGlobal ? globalThis : userObj) {
      return from;
    })();
  }
  assert.same(typeof pick(false), 'undefined');
  assert.same(typeof pick(true), 'function');
  assert.same(effs, 2);
});

// a multi-element ARRAY-WRAPPED destructure whose consumed element is a diverging receiver: the
// array-wrapped static extraction must not bind the polyfill unconditionally. on the user branch
// `from` stays the user's own value (undefined here), the proxy branch reads the global. a
// `const from = _polyfill` extraction would read the polyfill on the user branch instead
QUnit.test('destructuring: array-wrapped diverging receiver keeps native undefined on the user branch', assert => {
  const userObj = { Array: {} };
  function pick(useGlobal) {
    const [, { Array: { from } }] = [0, useGlobal ? globalThis : userObj];
    return from;
  }
  assert.same(typeof pick(false), 'undefined');
  assert.same(typeof pick(true), 'function');
});

// the assignment-form cascade respects the same `&&` short-circuit the declarator does: a falsy
// guard makes native destructure off the falsy operand and THROW, so the receiver must not be
// collapsed and bound unconditionally - the per-branch default binds only on the truthy selection
QUnit.test('destructuring: cascade &&-guarded proxy keeps falsy-path throw', assert => {
  function attempt(guard) {
    let from;
    try {
      ({ Array: { from } } = guard && globalThis);
      return typeof from;
    } catch {
      return 'throw';
    }
  }
  assert.same(attempt(1), 'function');
  assert.same(attempt(0), 'throw');
});

// the declarator `&&`+rest form takes a per-branch default (the inner rest is un-mirrorable, but the
// `&&` right is the only value branch and a falsy guard throws on the intermediate hop, so no user
// `undefined` is reachable). the default must bind only behind the preserved guard: the truthy path
// polyfills, the falsy path still throws exactly as native
QUnit.test('destructuring: declarator &&-guarded proxy with rest keeps falsy-path throw', assert => {
  function attempt(guard) {
    try {
      const { Array: { from, ...rest } } = guard && globalThis;
      return [typeof from, Object.keys(rest).length];
    } catch {
      return 'throw';
    }
  }
  assert.deepEqual(attempt(1), ['function', 0]);
  assert.same(attempt(0), 'throw');
});

// transparent IIFE inits: the call keeps running (body effects once per evaluation, selection
// native), the polyfill binds through the mirrored return leaves
QUnit.test('destructuring: transparent IIFE inits', assert => {
  let c = 0;
  const m = 1;
  const { Array: { from } } = (() => {
    c++;
    return m && globalThis;
  })();
  assert.deepEqual(from([1]), [1]);
  assert.same(c, 1);
  function g({ Array: { of } } = (() => globalThis)()) {
    return of;
  }
  assert.deepEqual(g()(2), [2]);
});

// an identity IIFE with an effectful argument keeps the call and the effect; the polyfill
// binds through the mirrored leaf inside the argument
QUnit.test('destructuring: identity IIFE with effectful argument', assert => {
  let c = 0;
  const { Array: { from } } = (g => g)((c++, globalThis));
  assert.deepEqual(from([4]), [4]);
  assert.same(c, 1);
});

// chain-assignment inits: the binding captures the native value; a guarded RHS keeps its
// falsy-path TypeError while the truthy path polyfills
QUnit.test('destructuring: chain assignment inits', assert => {
  let w;
  // eslint-disable-next-line unicorn/no-duplicate-logical-operands -- testing
  const { Array: { from } } = w = globalThis || globalThis;
  assert.deepEqual(from([5]), [5]);
  assert.same(w, globalThis);
  function attempt(m) {
    try {
      let v;
      const { Array: { of } } = v = m && globalThis;
      return [typeof of, v];
    } catch {
      return 'throw';
    }
  }
  assert.same(attempt(1)[0], 'function');
  assert.same(attempt(1)[1], globalThis);
  assert.same(attempt(0), 'throw');
});

// assignment-form hosts with collapsible fallback RHS: the binding gets the polyfill, an
// IIFE RHS runs exactly once
QUnit.test('destructuring: assignment-form fallback RHS', assert => {
  let from;
  // eslint-disable-next-line prefer-const, unicorn/no-duplicate-logical-operands -- assignment-form host is the shape under test
  ({ Array: { from } } = globalThis || globalThis);
  assert.deepEqual(from([6]), [6]);
  let of;
  let c = 0;
  // eslint-disable-next-line prefer-const -- assignment-form host is the shape under test
  ({ Array: { of } } = (() => {
    c++;
    return globalThis;
  })());
  assert.deepEqual(of(7), [7]);
  assert.same(c, 1);
});

// duplicate hop keys bail the synthesized literal - both subtrees still read the same
// receiver property and every leaf binds through the fallback emission
QUnit.test('destructuring: duplicate hop keys keep both subtrees working', assert => {
  function f({ Array: { from }, Array: { of } } = globalThis) {
    return [from, of];
  }
  const [a, b] = f();
  assert.deepEqual(a([8]), [8]);
  assert.deepEqual(b(9), [9]);
});

// a defaulted destructure with an unknown member keeps the generic dispatch: the runtime
// flavor (string here, array via the default) picks the right polyfill either way
QUnit.test('destructuring: defaulted binding generic dispatch', assert => {
  const { v = [] } = JSON.parse('{"v":"hello"}');
  assert.same(v.at(0), 'h');
  const { w = [3, 4] } = JSON.parse('{}');
  assert.same(w.at(-1), 4);
});

// literal-init presence: a plain value kills the default; a getter-supplied value keeps the
// fold's generic dispatch working on the actual runtime flavor
QUnit.test('destructuring: literal presence and accessor fold', assert => {
  const [d = 0] = ['hi'];
  assert.same(d.at(-1), 'i');
  // eslint-disable-next-line es/no-accessor-properties -- the accessor-supplied member IS the shape under test
  const { g = 's' } = { get g() { return [9]; } };
  assert.same(g.at(0), 9);
});

// shared-helper edges: spread-expanded IIFE receiver arg, wrapper-default vs live caller-arg,
// and a const-captured super-class alias surviving an upstream reassignment after the capture
QUnit.test('destructuring: spread args, wrapper defaults, captured super alias', assert => {
  // eslint-disable-next-line prefer-const -- a mutable flag keeps the branch pick a runtime decision
  let c = true;
  // eslint-disable-next-line unicorn/no-useless-spread -- the inline-array spread IS the shape under test
  const viaSpread = ((x, { from }) => from)(...[1, c ? Array : Iterator]);
  assert.same(viaSpread([1, 2]).length, 2);
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the [] is a dead wrapper default, never the receiver
  const viaArg = (({ from } = []) => from([3]))(Array);
  assert.same(viaArg[0], 3);
  let G = globalThis;
  const Base = G.Array;
  // eslint-disable-next-line no-useless-assignment -- the dead store IS the shape under test
  G = null;
  class C extends Base {
    static make() {
      return super.of(9);
    }
  }
  assert.same(C.make()[0], 9);
});

// assignment-form array wrapper + rest: the cascade keeps the wrap (rest reads the matching
// init element, excludes the consumed key) and the polyfill overrides the captured binding
QUnit.test('destructuring: assignment array wrap with rest cascade', assert => {
  let from, rest;
  // eslint-disable-next-line prefer-const -- the ASSIGNMENT-form destructure is the shape under test
  [{ from, ...rest }] = [Array];
  assert.same(from([7])[0], 7);
  // pristine built-in statics are non-enumerable, so rest only proves the consumed-key exclusion
  assert.false('from' in rest);
});

// an unclassifiable IIFE arg keeps native priority (caller value wins) while the wrapper
// default carries the polyfill for the undefined-arg path
QUnit.test('destructuring: wrapper default vs unclassifiable caller arg', assert => {
  function f({ of } = Array) {
    return of;
  }
  const custom = { of: 'caller' };
  assert.same(f(custom), 'caller');
  assert.same(f()(6)[0], 6);
  assert.same(f(undefined)(7)[0], 7);
});

// for-init array wrapper + rest: the polyfill rides a sibling declarator inside the loop
// header (a preceding statement is illegal there) and rest keeps the consumed-key exclusion
QUnit.test('destructuring: for-init array wrap with rest', assert => {
  // eslint-disable-next-line no-unreachable-loop -- the for-init HEADER is the shape under test
  for (const [{ of, ...r }] = [Array]; ;) {
    assert.same(of(3)[0], 3);
    assert.false('of' in r);
    break;
  }
});

// classification edges: an SE-buried proxy root substitutes its static with the prefix
// running exactly once, and a shared static-object wrapper resolves SIBLING statics
QUnit.test('destructuring: se-buried proxy static and sibling wrapper statics', assert => {
  let n = 0;
  const grouped = (n++, globalThis).Map.groupBy(['ab', 'c'], s => s.length);
  assert.same(grouped.get(2)[0], 'ab');
  assert.same(n, 1);
  // uniquely named: the census records are per-file by NAME, and `w` escapes as a call ARGUMENT in
  // another test of this module (an escaped container may be written by the callee), so a shared
  // spelling would bail this container's reads
  const wrapperStatics = { a: Array, b: Promise };
  const { a: { of }, b: { resolve } } = wrapperStatics;
  assert.same(of(5)[0], 5);
  assert.same(typeof resolve, 'function');
});

// SE prefix of a fully-consumed proxy-tail destructure runs exactly once; the dead tail
// read is dropped without affecting the extracted bindings
QUnit.test('destructuring: se prefix lift on proxy tail', assert => {
  let n = 0;
  const { from, of } = (n++, globalThis.Array);
  assert.same(from([5])[0], 5);
  assert.same(of(6)[0], 6);
  assert.same(n, 1);
});

// a partial-consume residual with an SE-buried proxy-hop root keeps the effect across the
// hop collapse (runs exactly once) while the polyfillable key still extracts
QUnit.test('destructuring: se-buried hop collapse keeps effect', assert => {
  let n = 0;
  // eslint-disable-next-line no-unused-vars -- the unpolyfillable sibling forces the partial consume
  const { from, formatRangeToParts } = (n++, globalThis).globalThis.Array;
  assert.same(from([9])[0], 9);
  assert.same(n, 1);
});

// the in-check fold keeps the receiver chain's buried SE prefix evaluating exactly once
QUnit.test('destructuring: in-fold keeps buried receiver effect', assert => {
  let n = 0;
  const has = 'groupBy' in (n++, globalThis).Map;
  assert.true(has);
  assert.same(n, 1);
});

// duplicate container keys read the LAST (live) value: the substitution must target the
// live Iterator, not the dead first Array (a first-match container walk picked the corpse)
QUnit.test('destructuring: duplicate container keys read the live value', assert => {
  // eslint-disable-next-line no-dupe-keys -- the duplicate IS the case under test
  const ND = { M: Array, M: Iterator };
  const { from } = ND.M;
  assert.same(from([7].values()).next().value, 7);
});

// the assignment-destructure's own write registers the alias: receiver narrowing through
// the binding serves the typed dispatch and the value flows end to end
QUnit.test('destructuring: assignment-destructure alias narrows receiver type', assert => {
  let from;
  // eslint-disable-next-line prefer-const -- the `let x; ({ x } = Source)` form IS the case under test
  ({ from } = Array);
  assert.same(from([5, 6]).at(0), 5);
  assert.same(from('ab').at(1), 'b');
});

// a mid-sequence destructure assignment is split by the pre-pass and the alias serves the
// polyfill - the trailing sequence expression still runs
QUnit.test('destructuring: mid-sequence assignment destructure polyfills', assert => {
  let from;
  const calls = [];
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence-slot assignment form IS the case under test
  (({ from } = Array), calls.push('after'));
  assert.same(calls.length, 1);
  assert.same(from([5, 6]).at(-1), 6);
});

// a for-init flatten sibling keeps its polyfill on rest-bearing shapes: the extracted
// entry, the rest exclusion and the flatten all live in one comma-list
QUnit.test('destructuring: for-init flatten sibling rest shape', assert => {
  const arr = [1, 2, 3];
  for (const { Array: { of: of2 } } = globalThis, { at, ...rest } = arr, state = { i: 0 }; state.i < 1; state.i++) {
    assert.same(typeof of2, 'function');
    assert.same(at.call(arr, -1), 3);
    assert.false('at' in rest);
    assert.same(rest[1], 2);
  }
});

// a buried SE on the synth-swap receiver spine runs exactly once when the default fires
// and never when the caller passes a value
QUnit.test('destructuring: synth-swap rescues buried receiver side effects', assert => {
  const calls = [];
  function eff() {
    return calls.push('eff');
  }
  function f({ from } = (eff(), globalThis).Array) { return from; }
  assert.same(typeof f(), 'function');
  assert.same(calls.length, 1);
  f({ from: 'custom' });
  assert.same(calls.length, 1);
});

// an optional proxy chain in a body-extracted param default collapses onto the substituted
// root - no read of the (possibly missing) intermediate hop survives at runtime
QUnit.test('destructuring: optional proxy param default collapses hops', assert => {
  // eslint-disable-next-line no-unsafe-optional-chaining -- the optional proxy-hop default IS the case under test (the transform collapses it)
  function f({ from, ...rest } = globalThis?.self?.Array) { return [from, rest]; }
  const [from, rest] = f();
  assert.same(typeof from, 'function');
  assert.same(from([3, 4]).length, 2);
  assert.false('from' in rest);
  // a COMPUTED leaf collapses the hop too - no `.self` read survives
  // eslint-disable-next-line dot-notation -- the computed-leaf hop collapse IS the case under test
  function k({ entries, ...r4 } = globalThis.self['Object']) { return [entries, r4]; }
  const [entries] = k();
  assert.same(typeof entries, 'function');
  assert.same(entries({ a: 1 })[0][0], 'a');
});

// a rest-bearing destructuring ASSIGNMENT runs in strict module code: the rewrite's
// `_unused` sentinel must be declared, or the assignment throws ReferenceError
QUnit.test('destructuring: assignment rest sentinel is declared in strict code', assert => {
  /* eslint-disable prefer-const -- the assignment-destructure form IS the case under test */
  let resolve, rest;
  ({ resolve, ...rest } = Promise);
  let from, r2;
  ({ Array: { from }, ...r2 } = globalThis);
  /* eslint-enable prefer-const -- end of the assignment-destructure forms */
  assert.same(typeof resolve, 'function');
  assert.false('resolve' in rest);
  assert.same(from([7]).length, 1);
  assert.false('Array' in r2);
});

// a disable directive on a sibling LEAF of a nested-proxy flatten keeps that leaf NATIVE
// while the enabled sibling still extracts its polyfill
QUnit.test('destructuring: disable directive gates per leaf', assert => {
  const {
    Map: { groupBy },
    // core-js-disable-next-line
    Object: { groupBy: og },
  } = globalThis;
  assert.same(typeof groupBy, 'function');
  // the disabled leaf reads the NATIVE static off the real global - absent natives stay
  // absent (that is the point of the opt-out), so compare against an equally-raw read:
  // the directive below keeps the right-hand side untranspiled on every engine
  // core-js-disable-next-line
  assert.same(og, Object.groupBy);
});

// a SOLE constructor hop under the proxy root re-anchors its residual on the ponyfill constructor -
// unless the opt-out sits on the hop line or on a leaf under it: the static the directive kept
// from being imported is missing on the ponyfill, so the residual has to stay the raw read off the
// realm object. both rows compare against an equally-raw read, absent natives staying absent. the
// post-only leg detects on a pattern babel lowered before any pass of ours ran, where an in-pattern
// opt-out is gone before there is an output to carry it - it skips
testUnlessDetectLowered('destructuring: disable directive on a sole constructor hop keeps the raw read', assert => {
  const {
    // core-js-disable-next-line
    Map: { groupBy: hopOptOut },
  } = globalThis;
  const {
    Object: {
      // core-js-disable-next-line
      groupBy: leafOptOut,
    },
  } = globalThis;
  // core-js-disable-next-line
  assert.same(hopOptOut, Map.groupBy);
  // core-js-disable-next-line
  assert.same(leafOptOut, Object.groupBy);
});

// multi-declarator hosts keep sibling evaluation order around the extracted slot:
// pre-sibling effects run first, post-sibling after, receiver SE between
QUnit.test('destructuring: multi-decl extraction keeps sibling slot order', assert => {
  const log = [];
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the multi-declarator host IS the case under test
  const a = (log.push('a'), 1), { Map: { groupBy } } = globalThis, b = (log.push('b'), 2);
  assert.same(typeof groupBy, 'function');
  assert.same(`${ log }`, 'a,b');
  assert.same(a + b, 3);
});

// a for-init receiver side effect evaluates BEFORE the extracted bindings, exactly once
QUnit.test('destructuring: for-init receiver SE runs first and once', assert => {
  const log = [];
  for (const { from, of } = (log.push('se'), Array), state = { i: 0 }; state.i < 1; state.i++) {
    assert.same(typeof from, 'function');
    assert.same(of(1, 2).length, 2);
  }
  assert.same(`${ log }`, 'se');
});

// a side-effect computed key destructuring a GLOBAL constructor: the key SE runs, and member reads
// through the local binding re-polyfill (`P.allSettled` resolves the pure static) rather than landing
// raw on a bare constructor that lacks it (which would throw TypeError)
QUnit.test('destructuring: SE-key global-ctor alias re-polyfills member read', assert => {
  const log = [];
  const { [(log.push('se'), 'Promise')]: P } = globalThis;
  assert.same(`${ log }`, 'se');
  const async = assert.async();
  P.allSettled([Promise.resolve(1), Promise.reject(2)]).then(r => {
    assert.same(r[0].status, 'fulfilled');
    assert.same(r[1].status, 'rejected');
    async();
  });
});

// a nested-instance assignment overwrite in a bodyless control body stays CONDITIONAL: a false
// guard must not run it (the overwrite joins the destructure inside the implied block)
QUnit.test('destructuring: bodyless-control nested-instance overwrite stays conditional', assert => {
  const arr = [1, [2], 3];
  function grab(guard) {
    let m;
    if (guard) [{ flat: m }] = [arr];
    return m;
  }
  // false guard: the overwrite must NOT run, so `m` stays undefined (the bug ran it unconditionally)
  assert.same(grab(false), undefined);
  // true guard: the overwrite runs, binding `m` to the polyfilled `flat` (a function)
  assert.same(typeof grab(true), 'function');
});

// a multi-element pattern whose elements overwrite the SAME nested-instance target must apply the
// overwrites in SOURCE order, so the last element wins - exactly as native destructuring does. emitting
// them in reverse (a per-element insert hazard) would leave the FIRST element's method bound instead
QUnit.test('destructuring: multi-element nested-instance overwrite is last-wins', assert => {
  const a = [1, [2]];
  const b = [7, 8, 9];
  let m;
  // eslint-disable-next-line no-useless-assignment -- the first assignment is intentionally overwritten; last-wins is the behavior under test
  [{ flat: m }, { at: m }] = [a, b];
  // last-wins => `m` is `at` (element 1), not `flat` (element 0). `at` returns the element at an index;
  // `flat` returns a flattened array - call with a receiver to disambiguate which method landed
  assert.same(m.call(b, 1), 8);
});

// a `let`-bound global-ctor alias must re-polyfill member reads exactly like a `const` one: `P.allSettled`
// resolves to the pure static. a const-only shadow gate left `let` aliases raw against the bare pure ctor
// (which lacks the static) -> TypeError. the alias is identified by its init resolving to the global, not
// by declaration kind
QUnit.test('destructuring: let-bound global-ctor alias re-polyfills member read', assert => {
  // eslint-disable-next-line prefer-const -- `let` is the binding kind under test (a const alias already worked)
  let { Promise: P } = globalThis;
  const async = assert.async();
  P.allSettled([Promise.resolve(1), Promise.reject(2)]).then(r => {
    assert.same(r[0].status, 'fulfilled');
    assert.same(r[1].status, 'rejected');
    async();
  });
});

// a side effect buried in a COMPUTED member key on a function-param-default destructure receiver must
// survive the synth swap that discards the receiver and replaces it with `{ from: _Array$from }`. the
// spine-only harvester walked only `.object` and missed the receiver's own computed key, dropping the
// effect entirely - calling with no argument must still run it exactly once
QUnit.test('destructuring: param-default synth preserves a computed-key side effect', assert => {
  let keyReads = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- SE-prefix in computed key under test
  function pick({ from } = globalThis[(keyReads++, 'Array')]) {
    return from;
  }
  const from = pick();
  assert.same(keyReads, 1, 'computed-key side effect runs exactly once when the default is taken');
  assert.deepEqual(from([4, 5, 6]), [4, 5, 6], 'from resolves to the polyfilled Array.from');
});

// a lone-prop destructure whose init is retained only for its side effect (the value is consumed by the
// polyfilled binding, no surviving sibling or rest reads it) must still collapse the proxy hop in that
// retained init. uncollapsed `_globalThis.self.Array` reads an undefined `.self` hop off-browser (Node
// has no `self`), throwing in the lifted statement before the already-consumed value is ever read
QUnit.test('destructuring: SE-lifted init collapses its proxy hop so it stays runtime-safe', assert => {
  let reads = 0;
  const { from: arrayFrom } = (reads += 1, globalThis.self.Array) || Set;
  assert.same(reads, 1, 'the retained init side effect runs exactly once');
  assert.deepEqual(arrayFrom([7, 8]), [7, 8], 'from resolves to the polyfilled Array.from');
});

// a nested param inner-default (`[{ Array: { of } } = {}] = [globalThis]`) must REPLACE the whole proxy
// receiver with the mirrored synth object `[{ Array: { of: _Array$of } }]`, so the polyfill supplies the
// default-call value WITHOUT over-applying. a leaf inline default (`{ of = _Array$of }`) instead hands
// back the polyfill even when the caller passed an Array that genuinely lacks the static
QUnit.test('destructuring: nested param inner-default replaces receiver without over-applying', assert => {
  function ofGlobal([{ Array: { of } } = {}] = [globalThis]) {
    return of;
  }
  // no argument: the param default supplies the polyfilled Array.of, and it works
  assert.deepEqual(ofGlobal()(7, 8), [7, 8]);
  // caller passes an Array WITHOUT `.of` - the caller's (undefined) value wins, polyfill not forced in
  assert.same(ofGlobal([{ Array: {} }]), undefined);
});

QUnit.test('destructuring: multi-ctor declarator anchors a missing-able ctor residual', assert => {
  // a multi-ctor proxy declarator: the poly leaf polyfills, and a missing-able ctor method must read off
  // the pure constructor (`{ union } = _Set`) rather than collapse to a native residual (`_globalThis.Set
  // .union`, undefined and a throw off-engine). reverting the anchor makes `union` native undefined here
  const { Array: { from }, Set: { union } } = globalThis;
  const { Object: { fromEntries }, Map: { groupBy } } = globalThis;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.strictEqual(typeof union, 'function');
  assert.deepEqual(fromEntries([['a', 1]]), { a: 1 });
  assert.strictEqual(typeof groupBy, 'function');
});

// array-wrapper inner default resolves the receiver by the paired slot's definedness: a statically
// `undefined` slot fires the default (the right IS the receiver), a defined slot keeps the element's
// own member. mis-resolving the defined case would polyfill `of` as Array.of and break `carried:5`
QUnit.test('destructuring: array-wrapper inner default resolves by slot definedness', assert => {
  const [{ from } = Array] = [undefined];
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  const carrier = { of: x => `carried:${ x }` };
  const [{ of } = Array] = [carrier];
  assert.same(of(5), 'carried:5');
});

// an SE-bearing chain-root call on a MULTI-hop proxy receiver in a discarded destructure default
// (`{ from } = (() => { c++; return globalThis; })().self.Array`): the receiver value is unused (the
// resolved key is synth-swapped to the polyfill) but the call's effect must run. the drop re-emits ONLY
// the harvested call, NOT the `.self.Array` value - re-emitting the verbatim receiver reads the undefined
// `.self` intermediate hop and throws off-browser (ie:11 / Node), where globalThis.self is undefined
QUnit.test('destructuring: SE chain-root call on a discarded multi-hop proxy default runs once, no hop throw', assert => {
  let c = 0;
  function f({ from } = (() => {
    c++;
    return globalThis;
  })().self.Array) {
    return from([1, 2, 3]);
  }
  assert.deepEqual(f(), [1, 2, 3]);
  assert.same(c, 1);
});

// a call/IIFE-rooted proxy chain with an UNRESOLVED sibling key in a discarded default: the unresolved
// `length` re-reads the receiver, so the proxy hop `.self` must collapse (`_globalThis.Array`) - a verbatim
// hop reads an undefined intermediate off-browser (ie:11 / Node) and throws. the effectful call is
// memoized and runs EXACTLY once (as the memo argument), the resolved `from` is the polyfill
QUnit.test('destructuring: call-rooted proxy + unresolved sibling collapses hop, SE runs once', assert => {
  let c = 0;
  function f({ from, length } = (() => {
    c++;
    return globalThis;
  })().self.Array) {
    return [from([1, 2, 3]), length];
  }
  const [arr, len] = f();
  assert.deepEqual(arr, [1, 2, 3]);
  assert.same(len, 1);
  assert.same(c, 1);
});

// a fully-consumed STATIC destructure whose receiver buries a side effect in a proxy-hop KEY
// (`globalThis[(eff(), 'self')].Array`): the effect must run, so the consumed receiver survives as a
// residual, and its redundant `.self` hop must collapse - `_globalThis.self` is undefined off-browser
// (ie:11 / Node), so a verbatim hop reads it raw and THROWS. live runtime oracle (fail-before throws in Node)
QUnit.test('destructuring: SE-in-hop-key proxy-global static destructure collapses, effect runs once', assert => {
  let c = 0;
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const { from } = globalThis[c++, 'self'].Array;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.same(c, 1);
});

// the same SE-in-hop-key receiver inside a for-init, which keeps the consumed receiver under a synthesized
// sink declarator - the buried effect still runs once and the hop still collapses off the pure root
QUnit.test('destructuring: SE-in-hop-key proxy-global static destructure in for-init collapses', assert => {
  let c = 0;
  let out;
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  for (const { of } = globalThis[c++, 'self'].Array; c < 2;) {
    out = of(7, 8);
    c++;
  }
  assert.deepEqual(out, [7, 8]);
  assert.same(c, 2);
});

// the SE-in-hop-key receiver under a SEQUENCE root (`(eff(), globalThis[(eff(), 'self')].Object)`): the
// collapse must peel through the sequence tail to the receiver member, harvesting BOTH effects in order, and
// still drop the `.self` hop. fail-before throws in Node (raw `_globalThis.self`)
QUnit.test('destructuring: SE-in-hop-key proxy-global static destructure under a sequence root collapses', assert => {
  let d = 0;
  let e = 0;
  // eslint-disable-next-line no-sequences -- the computed-key + sequence-root sequences ARE the case under test
  const { keys } = (d++, globalThis[e++, 'self'].Object);
  assert.deepEqual(keys({ x: 1 }), ['x']);
  assert.same(d, 1);
  assert.same(e, 1);
});

// a STATIC proxy hop (`.self`) AHEAD of the computed-effect hop: both must collapse, and the single-hop
// retained-default collapse must NOT also fire (two overlapping transforms on the residual would compose-crash
// at build time). fail-before throws in Node (raw `_globalThis.self`)
QUnit.test('destructuring: SE-in-hop-key proxy-global static destructure with a leading static hop collapses', assert => {
  let f = 0;
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const { assign } = globalThis.self[f++, 'window'].Object;
  assert.deepEqual(assign({}, { a: 1 }), { a: 1 });
  assert.same(f, 1);
});

// an ASSIGNMENT-destructure (`({from} = globalThis[(eff(), 'self')].Array)`) re-emits its consumed receiver as
// a residual statement just like the const-declaration form, so the SE-in-hop-key proxy receiver must collapse
// the same way. live oracle: fail-before keeps the raw `_globalThis.self` hop (throws in Node) and on engines
// where it does not throw still leaves the dead hop; pass-after collapses to the pure root and runs the effect
QUnit.test('destructuring: SE-in-hop-key proxy receiver in an ASSIGNMENT-destructure collapses', assert => {
  let c = 0;
  let from;
  // eslint-disable-next-line no-sequences, prefer-const -- proxy-hop key seq; assignment target needs a pre-declared let
  ({ from } = globalThis[c++, 'self'].Array);
  assert.deepEqual(from([5, 6]), [5, 6]);
  assert.same(c, 1);
});

// SE-in-hop-key proxy receiver inside a LOGICAL operand (`{from} = (globalThis[(eff(), 'self')].Array) || Array`):
// the residual keeps the whole logical for the effect, so the proxy operand's redundant hop must collapse the
// same way a bare member receiver does. fail-before keeps the raw hop (throws in Node / dead hop off-engine)
QUnit.test('destructuring: SE-in-hop-key proxy receiver in a LOGICAL operand collapses', assert => {
  let c = 0;
  // eslint-disable-next-line no-sequences, @stylistic/no-extra-parens -- proxy-hop key seq + logical-operand parens under test
  const { from } = (globalThis[c++, 'self'].Array) || Array;
  assert.deepEqual(from([7, 8]), [7, 8]);
  assert.same(c, 1);
});

// SE-in-hop-key proxy receiver rooted in an ALIAS of a proxy global (`const g = globalThis; {from} = g[(eff(),
// 'self')].Array`): the visitor fires the hop-collapse only on LITERAL proxy roots, so the alias chain must be
// collapsed by the destructure that consumes it. fail-before keeps `g[(c++,'self')].Array` (throws in Node)
QUnit.test('destructuring: SE-in-hop-key proxy receiver rooted in a proxy-global ALIAS collapses', assert => {
  let c = 0;
  const g = globalThis;
  // eslint-disable-next-line no-sequences -- the computed-key proxy-hop sequence IS the case under test
  const { from } = g[c++, 'self'].Array;
  assert.deepEqual(from([9, 10]), [9, 10]);
  assert.same(c, 1);
});

// a MIXED static+SE proxy hop (`g.self[(eff(), 'window')].Object`) rooted in an ALIAS: collapseProxyHopRoot fully
// owns it (multi-hop drop + SE harvest), so the single-hop static-delete default must stand down - running both
// queues two overlapping transforms and crashes the compose. live oracle: count exactly 1 + the method works
QUnit.test('destructuring: alias + MIXED static+SE proxy hop collapses (no double-transform crash)', assert => {
  let count = 0;
  const al = globalThis;
  // eslint-disable-next-line no-sequences -- the computed-key proxy-hop sequence IS the case under test
  const { fromEntries } = al.self[count++, 'window'].Object;
  assert.deepEqual(fromEntries([['k', 1]]), { k: 1 });
  assert.same(count, 1);
});

// the same MIXED static+SE hop inside a LOGICAL operand - the gate must descend the logical to see the owned operand
QUnit.test('destructuring: MIXED static+SE proxy hop inside a LOGICAL operand collapses', assert => {
  let count = 0;
  // eslint-disable-next-line no-sequences, @stylistic/no-extra-parens -- proxy-hop seq + logical-operand parens under test
  const { getOwnPropertyNames } = (globalThis.self[count++, 'window'].Object) || Object;
  assert.deepEqual(getOwnPropertyNames({ z: 1 }), ['z']);
  assert.same(count, 1);
});

// a CALL / IIFE-rooted proxy receiver consumed by a destructure (`const {resolve} = sf().self.Promise`): the
// receiver value is DISCARDED, so it collapses to its pure ctor enter-time, whole-swapping the leaf and harvesting
// the SE chain-root call exactly once. live oracle: the side-effecting call's counter increments exactly 1 (not
// 0=dropped, not 2=double). fail-before reads `sf().self` (undefined in Node) and throws
QUnit.test('destructuring: SE call-rooted proxy receiver collapses + harvests the call once', assert => {
  let count = 0;
  function sf() {
    count++;
    return globalThis;
  }
  const { resolve } = sf().self.Promise;
  assert.same(typeof resolve, 'function');
  assert.same(count, 1);
});

// the same call-rooted collapse with a side effect buried in a COMPUTED hop key
// (`sf()[(c++, 'self')].Map`): both the chain-root call and the key effect must be harvested in
// source order, each exactly once. fail-before reads `sf()[...(undefined hop)]` and throws in Node
QUnit.test('destructuring: SE-computed hop key on a call-rooted proxy receiver harvests both effects once', assert => {
  let c = 0;
  function sf() {
    c++;
    return globalThis;
  }
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const { groupBy } = sf()[c++, 'self'].Map;
  assert.same(typeof groupBy, 'function');
  assert.same(c, 2);
});

// the side effect buried in the LEAF's own computed key (`sf().self[(k++, 'Array')]`): the leaf key
// folds to its static tail so the swap still happens, and the key effect is harvested after the
// chain-root call's. fail-before strands the raw `.self` hop (undefined in Node) and throws
QUnit.test('destructuring: SE-folded leaf key on a call-rooted proxy receiver swaps + harvests both effects', assert => {
  let k = 0;
  function sf() {
    k++;
    return globalThis;
  }
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const { from } = sf().self[k++, 'Array'];
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.same(k, 2);
});

// a NESTED destructure consuming its receiver whole must still run the effect buried in the
// receiver's computed hop key exactly once - the discard used to fold the key and silently
// drop its effect (counter stayed 0). fail-before: c === 0
QUnit.test('destructuring: nested full consume re-emits the hop-key effect once', assert => {
  let c = 0;
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const { Symbol: { iterator } } = globalThis[c++, 'self'];
  assert.same(iterator, Symbol.iterator);
  assert.same(c, 1);
});

// the partial-consume twin: a surviving residual sibling reads through the swapped receiver,
// and the folded hop-key effect must still run exactly once ahead of it
QUnit.test('destructuring: nested partial consume keeps the hop-key effect once', assert => {
  let c = 0;
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const { Promise: { resolve }, other } = globalThis[c++, 'self'];
  assert.same(typeof resolve, 'function');
  assert.same(typeof other, 'undefined');
  assert.same(c, 1);
});

// an SE-key destructure off a side-effect-free MEMBER receiver with a surviving residual: the
// receiver memoizes, so a getter fires exactly once (like the native single read), the key effect
// runs exactly once after it, and the extracted binding is the polyfill dispatcher
QUnit.test('destructuring: SE-key off a member receiver memoizes - getter and key effect fire once', assert => {
  const eff = [];
  const holder = {
    // eslint-disable-next-line es/no-accessor-properties -- the getter receiver IS the case under test
    get p() {
      eff.push('get');
      return [1, [2]];
    },
  };
  const { [(eff.push('key'), 'flat')]: m, other } = holder.p;
  assert.deepEqual(m.call([1, [2]]), [1, 2]);
  assert.same(typeof other, 'undefined');
  assert.deepEqual(eff, ['get', 'key']);
});

// the multi-declarator twin: the memo joins the declaration at the source slot, so an earlier
// sibling's init effect still runs BEFORE the receiver read
QUnit.test('destructuring: SE-key member memo keeps sibling-init order in a multi-declarator host', assert => {
  const eff = [];
  const holder = {
    // eslint-disable-next-line es/no-accessor-properties -- the getter receiver IS the case under test
    get p() {
      eff.push('get');
      return [1, [2]];
    },
  };
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the multi-declarator host IS the case under test
  const x = (eff.push('first'), 1), { [(eff.push('key'), 'at')]: a2, rest } = holder.p;
  assert.same(typeof a2, 'function');
  assert.same(typeof rest, 'undefined');
  assert.same(x, 1);
  assert.deepEqual(eff, ['first', 'get', 'key']);
});

// a for-init destructure off a call-rooted multi-hop receiver: the loop-header sink must carry
// only the harvested effects (chain-root call + hop-key effect), each exactly once - a verbatim
// sink kept the raw proxy hop and threw off-browser. fail-before throws in Node
QUnit.test('destructuring: for-init sink harvests a call-rooted multi-hop receiver', assert => {
  let c = 0;
  function sf() {
    c++;
    return globalThis;
  }
  let out;
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  for (const { groupBy } = sf()[c++, 'self'].Map; c < 3;) {
    out = typeof groupBy;
    c++;
  }
  assert.same(out, 'function');
  assert.same(c, 3);
});

// an assignment-form ctor alias (`let M; ({ Map: M } = globalThis)`): the registered trusted write
// lets a SEPARATE static narrow (the whole-swap alone would strand it on the bare pure ctor), and a
// user reassignment after the alias write must keep the user's value (last-write-wins, never the hint)
QUnit.test('destructuring: assignment-form ctor alias narrows separate statics, reassignment keeps user value', assert => {
  let M;
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  ({ Map: M } = globalThis);
  const grouped = M.groupBy([1, 2, 3], it => it % 2);
  assert.same(grouped.get(1).length, 2);
  let R;
  // eslint-disable-next-line no-useless-assignment -- the pre-reassignment alias write is the case under test
  ({ Map: R } = globalThis);
  R = { groupBy: () => 'USER' };
  assert.same(R.groupBy(), 'USER');
});

// a REFUSED ctor-alias registration (conditional write) keeps member reads RAW: the untaken
// path throws on the undefined binding exactly like untranspiled code; optional forms
// short-circuit to undefined
QUnit.test('destructuring: conditional ctor alias member stays raw on the untaken path', assert => {
  function taken(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    return M.groupBy;
  }
  assert.throws(() => taken(false), TypeError);
  function probe(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    return typeof M?.groupBy;
  }
  assert.same(probe(false), 'undefined');
});

// a SEQUENCE prefix on that same receiver keeps the guard, and runs exactly ONCE - ahead of the
// test, where the source runs it. carried into the raw branch instead, it fired only on the path
// the guard did not take, and the read answered `undefined` on the taken one
QUnit.test('destructuring: a sequence-prefixed refused alias keeps its guard and runs the prefix once', assert => {
  let n = 0;
  function taken(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    return (n++, M).groupBy;
  }
  const groupBy = taken(true);
  assert.same(typeof groupBy, 'function', 'the taken path reads the pure static');
  assert.same(n, 1, 'and the prefix ran exactly once');
  assert.same(groupBy([1, 2, 3], it => it % 2).get(1).length, 2, 'the static is the working one');
  // the call form binds `this` on the raw branch and needs none on the pure one
  function called(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    return (n++, M).groupBy([4, 5], it => it % 2);
  }
  assert.same(called(true).get(1).length, 1, 'the invoked form answers through the same guard');
  assert.same(n, 2, 'and its prefix ran once too');
});

// the DESTRUCTURED spelling of that read renders the same guard as the declarator's value: the taken
// path answers the pure static, and a receiver that never got the write still THROWS, exactly as
// destructuring `undefined` does. left raw it read off the binding the emit had already swapped to
// the pure ctor, so the static was `undefined` on the very path the alias was written
QUnit.test('destructuring: a refused alias destructure reads the pure static through the same guard', assert => {
  let n = 0;
  function taken(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    const { groupBy } = (n++, M);
    return groupBy;
  }
  const groupBy = taken(true);
  assert.same(typeof groupBy, 'function', 'the taken path reads the pure static');
  assert.same(groupBy([1, 2, 3], it => it % 2).get(1).length, 2, 'and it is the working one');
  assert.same(n, 1, 'the sequence prefix ran once');
  assert.throws(() => taken(false), TypeError, 'the unwritten path throws like the pattern does');
  assert.same(n, 2, 'and its prefix ran too, before the throw');
});

// the TAKEN path of a REFUSED alias reads the pure static through the RUNTIME ctor guard
// (`M === _Map ? _Map$groupBy : M.groupBy`), so the member works instead of `undefined`
QUnit.test('destructuring: refused alias taken path reads the pure static via the runtime guard', assert => {
  function taken(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    return M.groupBy;
  }
  const groupBy = taken(true);
  assert.same(typeof groupBy, 'function');
  assert.same(groupBy([1, 2, 3], it => it % 2).get(1).length, 2);
});

// the same guard through a use textually BEFORE the alias write: called after the write, the
// closure reads the pure static; called before, the guard's raw branch matches untranspiled code
QUnit.test('destructuring: pre-write closure reads the guarded static after the alias write', assert => {
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  let P;
  function reader() {
    return typeof P?.allSettled;
  }
  assert.same(reader(), 'undefined');
  ({ Promise: P } = globalThis);
  assert.same(reader(), 'function');
});

// a SIDE-EFFECTING computed key through a refused alias stays raw entirely: the guard's
// consequent would skip the key effect the native evaluation always runs - so the effect
// fires exactly once and the read keeps native surface semantics
QUnit.test('destructuring: refused alias SE-computed key stays raw with the effect intact', assert => {
  let K;
  let c = 0;
  function cond() {
    return true;
  }
  if (cond()) ({ Map: K } = globalThis);
  // eslint-disable-next-line no-sequences -- the computed-key sequence IS the case under test
  const read = typeof K[c++, 'groupBy'];
  assert.same(c, 1);
  assert.same(typeof read, 'string');
});

// a MIXED dirty binding (conditional hoisted `var` + assignment-form write): the guard keys the
// LAST source write's ctor deterministically, so the matching runtime path reads the pure static
QUnit.test('destructuring: mixed-form dirty alias guards on the last write', assert => {
  function rev(c, d) {
    // eslint-disable-next-line block-scoped-var -- writes the hoisted var below
    if (c) ({ Promise: out } = globalThis);
    if (d) {
      // eslint-disable-next-line no-var -- the conditional hoisted `var` IS the form under test
      var { Map: out } = globalThis;
    }
    try {
      // eslint-disable-next-line block-scoped-var -- reads the hoisted var
      return typeof out.groupBy;
    } catch {
      return 'T';
    }
  }
  assert.same(rev(false, true), 'function');
  assert.same(rev(false, false), 'T');
});

// the guard's raw branch preserves a USER value exactly: when the conditional flow binds the
// user's own object instead of the alias, the ctor comparison fails and the user's member wins
QUnit.test('destructuring: refused alias guard lets a user value win at runtime', assert => {
  function pick(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    else M = { groupBy: () => 'USER' };
    return M.groupBy([1], it => it);
  }
  assert.same(pick(false), 'USER');
  assert.same(typeof pick(true), 'object');
});

// a use textually BEFORE its alias write (an earlier-defined closure body) stays raw: called
// before the write it throws like untranspiled code
QUnit.test('destructuring: closure use before the alias write stays raw', assert => {
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  let P;
  function read() { return P.try(() => 42); }
  assert.throws(() => read(), TypeError);
  ({ Promise: P } = globalThis);
  assert.same(typeof read, 'function');
});

// a write under a conditional EXPRESSION container (ternary branch / logical operand) refuses
// flow-trust like an `if`-guarded one: the member read stays raw and the untaken path throws
QUnit.test('destructuring: ternary/logical-wrapped alias write stays raw', assert => {
  function viaTernary(c) {
    let M;
    // eslint-disable-next-line @stylistic/no-extra-parens -- the ternary-wrapped WRITE is the form under test
    (c ? ({ Map: M } = globalThis) : 0);
    return M.groupBy;
  }
  assert.throws(() => viaTernary(false), TypeError);
  function viaLogical(c) {
    let P;
    c && ({ Promise: P } = globalThis);
    return typeof P.try;
  }
  assert.throws(() => viaLogical(false), TypeError);
});

// destructure FROM a refused ctor alias stays raw: the untaken path throws on the destructure
// exactly like untranspiled code; caller args always win for a param DEFAULT
QUnit.test('destructuring: extraction from a conditional ctor alias stays raw', assert => {
  function taken(c) {
    let M;
    if (c) ({ Map: M } = globalThis);
    const { groupBy } = M;
    return groupBy;
  }
  assert.throws(() => taken(false), TypeError);
  function viaParam(c) {
    let P;
    if (c) ({ Promise: P } = globalThis);
    function f({ try: t } = P) {
      return t;
    }
    return f(c ? undefined : { try: 'CALLER' });
  }
  assert.same(viaParam(false), 'CALLER');
});

// a tagged-template tag is a this-carrying invocation: the ctor guard's raw branch must bind
// the alias exactly like a call callee. `Promise.all` requires a constructor `this` - an
// unbound raw branch would throw TypeError where native tag invocation resolves. on a
// stripped realm the global is absent and BOTH native and transformed code throw reading
// `.all` off undefined - the bind oracle fires on the live-global legs
QUnit.test('destructuring: tagged-template tag on a guarded alias static binds the receiver', assert => {
  // probe the runtime global through the SAME maybe-alias channel viaTag reads (a certain
  // alias would flatten to the always-defined pure binding and misreport a stripped realm)
  function grab(c) {
    let G;
    // eslint-disable-next-line @stylistic/no-extra-parens -- the ternary-wrapped WRITE arms the guard
    (c ? ({ Promise: G } = globalThis) : 0);
    return G;
  }
  const live = grab(true);
  function viaTag(c) {
    let P;
    // eslint-disable-next-line @stylistic/no-extra-parens -- the ternary-wrapped WRITE arms the guard
    (c ? ({ Promise: P } = globalThis) : 0);
    return P.all`x`;
  }
  if (live) {
    const async = assert.async();
    viaTag(true).then(value => {
      assert.deepEqual(value, ['x']);
      async();
    });
  } else {
    assert.throws(() => viaTag(true), TypeError);
  }
  // the untaken path stays native-faithful: reading `.all` off undefined throws
  assert.throws(() => viaTag(false), TypeError);
  // a sequence-detached tag drops `this` natively - the raw branch must stay unbound,
  // preserving the constructor-`this` TypeError an erroneous bind would swallow (with the
  // global stripped the read itself throws the same TypeError, so the assert holds anywhere)
  function viaDetachedTag(c) {
    let Q;
    // eslint-disable-next-line @stylistic/no-extra-parens -- the ternary-wrapped WRITE arms the guard
    (c ? ({ Promise: Q } = globalThis) : 0);
    return (0, Q.withResolvers)`x`;
  }
  assert.throws(() => viaDetachedTag(true), TypeError);
});

// an UNCLAIMED destructure (no polyfillable prop) over a proxy-hop receiver collapses the hop
// like a non-destructure receiver: in Node `self` is undefined, so an uncollapsed
// `_globalThis['self'].Array` would throw before the destructure runs
QUnit.test('destructuring: unclaimed pattern collapses a proxy-hop receiver', assert => {
  // eslint-disable-next-line dot-notation -- the computed literal hop key is the form under test
  const { noSuchArrayProto } = globalThis['self'].Array.prototype;
  assert.same(typeof noSuchArrayProto, 'undefined');
  let viaAssign;
  // eslint-disable-next-line prefer-const -- the init-less `let` + destructuring WRITE is the form under test
  ({ viaAssign } = globalThis.self.Reflect);
  assert.same(typeof viaAssign, 'undefined');
});

// a side-effecting computed hop key is harvested by the collapse: the effect runs exactly once
// and the destructure still reads through the collapsed root
QUnit.test('destructuring: unclaimed collapse harvests the hop key effect once', assert => {
  let keyEffects = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parenthesized sequence hop key is the form under test
  const { noSuchIteratorProto } = globalThis[(keyEffects++, 'self')].Iterator.prototype;
  assert.same(typeof noSuchIteratorProto, 'undefined');
  assert.same(keyEffects, 1);
});

// a side-effect-key destructure off a side-effect-free BRANCHING receiver (ternary / logical)
// memoizes the receiver - the branch selects once, the key effect fires once, the extracted
// binding is the polyfilled method; a diverging user-object branch keeps its own value via the
// runtime dispatch
QUnit.test('destructuring: SE-key off a branching receiver memoizes and extracts', assert => {
  let keyRuns = 0;
  const arr = [7, 8];
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the surviving sibling prop is the form under test
  const { [(keyRuns++, 'at')]: viaTernary, more1 } = arr.length ? arr : [];
  assert.same(viaTernary.call([5, 6], -1), 6);
  assert.same(typeof more1, 'undefined');
  assert.same(keyRuns, 1);
  let orKeyRuns = 0;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the surviving sibling prop is the form under test
  const { [(orKeyRuns++, 'flat')]: viaLogical, more2 } = arr || [];
  assert.deepEqual(viaLogical.call([1, [2]]), [1, 2]);
  assert.same(typeof more2, 'undefined');
  assert.same(orKeyRuns, 1);
});

QUnit.test('destructuring: branching receiver memo keeps a diverging branch value-correct', assert => {
  let keyRuns = 0;
  function pick(c) {
    const { [(keyRuns++, 'flatMap')]: fm } = c ? [5] : { flatMap: undefined };
    return typeof fm;
  }
  assert.same(pick(true), 'function');
  assert.same(pick(false), 'undefined');
  assert.same(keyRuns, 2);
});

// the memoize channel takes the WHOLE INIT of a top-level multi-prop pattern when the receiver
// resolves to no single-read-safe node: the memo evaluates exactly where the init did, so a call
// receiver runs once and every buried effect keeps source order (init before the key effect)
QUnit.test('destructuring: SE-key off an effectful whole-init receiver memoizes once', assert => {
  const eff = [];
  function make() {
    eff.push('call');
    return [7, 8];
  }
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the surviving sibling prop is the form under test
  const { [(eff.push('key'), 'at')]: viaCall, more3 } = make();
  assert.same(viaCall.call([5, 6], -1), 6);
  assert.same(typeof more3, 'undefined');
  assert.deepEqual(eff, ['call', 'key']);
  let seqEff = 0;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the surviving sibling prop is the form under test
  const { [(seqEff++, 'flat')]: viaSeqTernary, more4 } = (seqEff += 10, seqEff > 0 ? [1, [2]] : []);
  assert.deepEqual(viaSeqTernary.call([1, [2]]), [1, 2]);
  assert.same(typeof more4, 'undefined');
  assert.same(seqEff, 11);
});

// a proxy-hop member receiver of a side-effect-key destructure collapses INSIDE the memo: in
// Node `self` is undefined, so an uncollapsed `_globalThis['self'].Array.prototype` memo would
// throw before the extract runs
QUnit.test('destructuring: SE-key memo collapses a proxy-hop receiver', assert => {
  let keyRuns = 0;
  // eslint-disable-next-line dot-notation -- the computed literal hop key is the form under test
  const { [(keyRuns++, 'at')]: viaHop, more5 } = globalThis['self'].Array.prototype;
  assert.same(viaHop.call([5, 6], -1), 6);
  assert.same(typeof more5, 'undefined');
  assert.same(keyRuns, 1);
  let seqRuns = 0;
  const { [(seqRuns++, 'flat')]: viaSeqHop, more6 } = (seqRuns += 10, globalThis.self.Array.prototype);
  assert.deepEqual(viaSeqHop.call([1, [2]]), [1, 2]);
  assert.same(typeof more6, 'undefined');
  assert.same(seqRuns, 11);
});

// a flatten-claimed declaration (nested-proxy flatten declarator sharing it) routes a sibling
// SE-key instance destructure through the flatten's slot render: values bind, the key effect
// runs once, and both declarator orders work
QUnit.test('destructuring: SE-key sibling of a flatten-claimed declaration', assert => {
  let keyRuns = 0;
  // eslint-disable-next-line no-var, @stylistic/one-var-declaration-per-line, es/no-nonstandard-array-prototype-properties -- the form under test
  var { Array: { from: flatFrom } } = globalThis, { [(keyRuns++, 'at')]: atPair, more7 } = Array.prototype;
  assert.same(typeof flatFrom, 'function');
  assert.same(atPair.call([5, 6], -1), 6);
  assert.same(typeof more7, 'undefined');
  assert.same(keyRuns, 1);
  let revRuns = 0;
  // eslint-disable-next-line no-var, @stylistic/one-var-declaration-per-line, es/no-nonstandard-array-prototype-properties -- the form under test
  var { [(revRuns++, 'flat')]: flatPair, more8 } = Array.prototype, { Array: { of: flatOf } } = globalThis;
  assert.deepEqual(flatPair.call([1, [2]]), [1, 2]);
  assert.same(typeof flatOf, 'function');
  assert.same(typeof more8, 'undefined');
  assert.same(revRuns, 1);
});

QUnit.test('array-wrapper flatten preserves wrapper-level side effects in order', assert => {
  // the flatten discards the wrapper levels; the effects buried between them (outer chain +
  // element prefixes) must each run EXACTLY once, outermost first
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  const [{ Array: { from } }] = (eff('outer'), [(eff('inner'), globalThis)]);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.deepEqual(order, ['outer', 'inner']);
  const [[{ Array: { of } }]] = (eff('o2'), [(eff('m2'), [(eff('i2'), globalThis)])]);
  assert.deepEqual(of(3), [3]);
  assert.deepEqual(order, ['outer', 'inner', 'o2', 'm2', 'i2']);
});

QUnit.test('destructuring: shadowed Symbol identifier keeps the user value', assert => {
  const { iterator } = Symbol;
  assert.same(typeof [][iterator], 'function');
  // the inner same-name binding reads a USER object through a shadowed `Symbol` - folding
  // it to the well-known symbol would return an iterator method instead of the element
  function pickShadowed() {
    const Symbol = { iterator: 1 };
    // eslint-disable-next-line no-shadow -- the same-name collision is the case under test
    const { iterator } = Symbol;
    return ['a', 'b'][iterator];
  }
  assert.same(pickShadowed(), 'b');
});

QUnit.test('destructuring: mixed ternary Symbol init keeps the branch value', assert => {
  const { iterator } = Symbol;
  assert.same(typeof [][iterator], 'function');
  function pickMixed() {
    const c = Math.random() > 2;
    // eslint-disable-next-line no-shadow -- the same-name flat-info collision is the case under test
    const { iterator } = c ? Symbol : { iterator: 1 };
    return ['x', 'y'][iterator];
  }
  assert.same(pickMixed(), 'y');
});

QUnit.test('destructuring: assignment-form Symbol alias folds to the well-known symbol', assert => {
  let assigned;
  // eslint-disable-next-line prefer-const -- the assignment FORM (not a declarator init) is the case under test
  ({ iterator: assigned } = Symbol);
  assert.same(typeof [][assigned], 'function');
});

QUnit.test('destructuring: non-defaulted branching alias init keeps the native TypeError', assert => {
  const fake = { Map: null };
  // eslint-disable-next-line no-var -- the hoisted `var` registration shape is under test
  var { Map: M } = fake || globalThis;
  assert.throws(() => M.groupBy(['x'], it => it));
});

QUnit.test('destructuring: computed string-literal ctor alias resolves member reads', assert => {
  function early() {
    return M.groupBy(['x', 'yy'], it => it.length);
  }
  // eslint-disable-next-line no-var, no-useless-computed-key -- the hoisted `var` and the computed string key are the case under test
  var { ['Map']: M } = globalThis;
  const grouped = early();
  assert.true(grouped instanceof Map);
  assert.deepEqual(grouped.get(1), ['x']);
  assert.deepEqual(grouped.get(2), ['yy']);
});

// a symbol-keyed NESTED pattern destructures the get-iterator-method result; a polyfillable
// instance call in the pattern's VALUE position (a binding default) is rewritten inside the
// extracted pattern, not left raw
QUnit.test('symbol-keyed pattern: instance call in a binding default still polyfills', assert => {
  // eslint-disable-next-line unicorn/no-unused-properties -- read via the computed symbol key in the pattern
  const holder = { Array: {}, [Symbol.iterator]: {} };
  const { Array: { from }, [Symbol.iterator]: { next = [1].at(0) } } = holder;
  assert.same(from, undefined);
  assert.same(next, 1);
});

// SOLE symbol-keyed pattern extracts through the helper: the destructured props come off the
// real iterator method. `length` / `call` (not `name`): IE lacks Function#name entirely, and
// no polyfill can backfill it - arity and the inherited call are cross-engine invariants
QUnit.test('symbol-keyed pattern: sole binding destructures the real iterator method', assert => {
  const { [Symbol.iterator]: { length: iterArity, call: iterCall } } = [7];
  assert.same(iterArity, 0);
  assert.same(typeof iterCall, 'function');
});

// prop-level default over a symbol-keyed pattern: a non-iterable receiver takes the user
// default, like a raw undefined read would
QUnit.test('symbol-keyed pattern: prop default fires for a non-iterable receiver', assert => {
  const fb = { done: true };
  const { [Symbol.iterator]: { done } = fb } = {};
  assert.true(done);
});

// rest inside the extracted pattern gathers the method's own keys, excluding the named one -
// same reads a raw destructure of the method performs (`length`, not `name`: IE-safe arity)
QUnit.test('symbol-keyed pattern: inner rest destructures the helper result', assert => {
  const { [Symbol.iterator]: { length: iterArity, ...restOfMethod } } = [3];
  assert.same(iterArity, 0);
  assert.same(typeof restOfMethod, 'object');
});

// a pattern-valued symbol prop in a CATCH param extracts off the relocated ref
// (`length`, not `name`: IE-safe arity)
QUnit.test('symbol-keyed pattern: catch param destructures the helper result', assert => {
  try {
    throw [5];
  } catch ({ [Symbol.iterator]: { length: iterArity } }) {
    assert.same(iterArity, 0);
  }
});

// a for-x head REBINDS a destructured alias: the loop assigns each iteration, so a later
// read holds the loop's value (a string key), not the extracted static - the alias must
// not feed value folds or type trust past the loop
/* eslint-disable no-var, block-scoped-var, no-redeclare, no-void -- the var-hoisted redeclaration through a for-x head IS the shape under test */
QUnit.test('alias rebind: for-in head write poisons the destructured alias', assert => {
  var { from } = Array;
  for (var from in { a: 1 }) { void 0; }
  assert.same(from, 'a');
  assert.throws(() => from([1, 2, 3]), TypeError);
});

QUnit.test('alias rebind: for-of head write poisons the destructured alias', assert => {
  var { of } = Array;
  for (var of of ['x']) { void 0; }
  assert.same(of, 'x');
  assert.throws(() => of(1, 2), TypeError);
});

// control: an un-rebound alias serves the extracted polyfill
QUnit.test('alias rebind: control alias without loop write keeps the static', assert => {
  var { fromAsync } = Array;
  assert.same(typeof fromAsync, 'function');
});
/* eslint-enable no-var, block-scoped-var, no-redeclare, no-void -- end of the for-x rebind shapes */

// --- alias-fold value guards: the fold must resolve the SAME binding the runtime reads ---

// a top-level `{ iterator } = Symbol` folds a computed read to the iterator-method helper; a
// NESTED-pattern binding of the same name reads `Symbol.constructor.iterator` (=== undefined),
// so it must stay a raw read - a name-keyed fold would substitute the well-known key wrongly
QUnit.test('symbol alias: nested-pattern shadow reads the real property, not the well-known key', assert => {
  const { constructor: { iterator } } = Symbol;
  assert.same([1, 2][iterator], undefined);
});

// a binding that holds the well-known-symbol VALUE is not a Symbol source: destructuring
// `iterator` off the VALUE reads `(symbol).iterator` (undefined), so the user default must
// apply - a fold would bind the well-known key and skip it
QUnit.test('symbol alias: value alias is not a Symbol source for its own destructure', assert => {
  const sentinel = { marker: true };
  const { iterator: symbolValue } = globalThis.Symbol;
  const { iterator: viaValue = sentinel } = symbolValue;
  assert.same(viaValue, sentinel);
  assert.notSame([3, 4][symbolValue], undefined);
});

// a plain (non-global-named) destructured slot off globalThis reads an ordinary property -
// treating it as the proxy surface would rescue the native TypeError
QUnit.test('symbol alias: plain destructured slot is not a proxy root', assert => {
  const { nonexistentSlot } = globalThis;
  assert.same(nonexistentSlot, undefined);
  assert.throws(() => nonexistentSlot.Array.from([1]), TypeError);
});

QUnit.test('symbol alias: top-level { iterator } = Symbol folds to the iterator method', assert => {
  const { iterator } = Symbol;
  assert.same([3, 4][iterator]().next().value, 3);
});

// the ctor analog: an outer function-scoped `{ Map } = globalThis` registers a flat name-keyed
// alias, but an inner nested-pattern binding of the SAME name reads `globalThis.constructor.Map`
// (=== undefined) - it must NOT inherit the outer alias's static fold. the same local name is
// what makes the flat registration collide, so the shadow is intrinsic to the shape under test
/* eslint-disable no-shadow -- the same-name inner shadow IS the flat-registration collision under test */
QUnit.test('ctor alias: nested-pattern shadow does not inherit the outer alias fold', assert => {
  const { Map } = globalThis;
  assert.same(typeof Map.groupBy, 'function');
  (function inner() {
    const { constructor: { Map } } = globalThis;
    assert.throws(() => Map.groupBy([1], x => x), TypeError);
  }());
});
/* eslint-enable no-shadow -- end of the flat-registration collision shape */

// a multi-element array-wrap binds each ObjectPattern element to the init element at the SAME
// index: the first alias reads a user object (native, keeps the user method), the second reads
// `globalThis` (folds). Resolving position-blindly rewrote the user alias to a polyfill helper
QUnit.test('array-wrap alias: positional user element keeps its own method', assert => {
  const userObj = { Map: { groupBy() { return 'user-groupBy'; } } };
  const [{ Map: A }, { Set: B }] = [userObj, globalThis];
  assert.same(A.groupBy([1], x => x), 'user-groupBy');
  assert.same(typeof B, 'function');
});

// positional pairing recurses through DEEP array-wrap layers: a user-object slot nested two levels
// deep still reads the user method (must not fold), mirroring the single-level protection
QUnit.test('array-wrap alias: deep-nested user element keeps its own method', assert => {
  const box = { Map: { groupBy() { return 'deep-user'; } } };
  const [[{ Map: M }]] = [[box]];
  assert.same(M.groupBy([1], x => x), 'deep-user');
});

// duplicate static class fields are LAST-wins at runtime, so a destructure off the static must
// resolve through the LAST declaration - the first-wins fold produced the wrong helper (an array
// from `Array.from` instead of an iterator from `Iterator.from`)
/* eslint-disable no-dupe-class-members, unicorn/no-static-only-class, no-useless-computed-key -- the duplicate / computed-key static field IS the runtime shape under test */
QUnit.test('dup static field: destructure resolves the last declaration', assert => {
  class NS {
    static M = Array;
    static M = Iterator;
  }
  const { M: { from } } = NS;
  const result = from([1, 2]);
  assert.same(typeof result.next, 'function');
  assert.false(Array.isArray(result));
});

// a computed static-string key (`static ["N"]`) overrides an earlier plain field at runtime, so
// the last-wins resolution must see through it - resolving the plain field would fold the wrong
// static (Array has no `allSettled`, so the wrong fold would break at runtime)
testUnlessDetectLowered('dup static field: computed static-string key overrides the plain field', assert => {
  class NS {
    static N = Array;
    static ['N'] = Promise;
  }
  const { N: { allSettled } } = NS;
  const result = allSettled([Promise.resolve(1)]);
  assert.same(typeof result.then, 'function');
});

// an unresolvable computed static key could be the target name at runtime, so resolution must bail
// rather than fold the earlier plain field - here the runtime key IS the target, so the value is
// the later `Iterator` and a stale `Array.from` fold would have produced an array, not an iterator
QUnit.test('dup static field: unresolvable computed key forces a native bail', assert => {
  function make(o) {
    class Guard {
      static P = Array;
      static [o.k] = Iterator;
    }
    const { P: { from } } = Guard;
    return from([1, 2]);
  }
  const result = make({ k: 'P' });
  assert.same(typeof result.next, 'function');
  assert.false(Array.isArray(result));
});

// a static block may reassign the field, so its value is unknowable and resolution must bail -
// here the block reassigns the field to `Array` (which has no `groupBy`), so the untransformed
// read throws; a stale `Map.groupBy` fold would wrongly NOT throw
QUnit.test('static block reassign forces a native bail', assert => {
  class NS {
    static T = Map;
    static {
      NS.T = Array;
    }
  }
  const { T: { groupBy } } = NS;
  assert.throws(() => groupBy([1], x => x), TypeError);
});
/* eslint-enable no-dupe-class-members, unicorn/no-static-only-class, no-useless-computed-key -- end of the dup static field shape */

// a spread BEFORE an array-wrap slot shifts every later runtime position: the pattern slot binds
// a spread element, not the literal at the same index. resolving past the spread would substitute
// the pure static / fold the well-known symbol over the USER value that actually lands in the slot
QUnit.test('destructuring: spread-shifted array-wrap ctor alias keeps the user static', assert => {
  const tail = [{}, { Map: { groupBy: () => 'user' } }];
  const [, { Map: M }] = [...tail, globalThis];
  assert.same(M.groupBy([1], x => x), 'user');
});

QUnit.test('destructuring: spread-shifted array-wrap symbol alias keeps the user value', assert => {
  const tail = [{}, { Symbol: { iterator: 'fake' } }];
  const [, { Symbol: S }] = [...tail, globalThis];
  assert.same(S.iterator, 'fake');
  assert.same(typeof [1, 2][S.iterator], 'undefined');
});

QUnit.test('destructuring: spread-shifted DEEP array-wrap keeps the user static', assert => {
  const tail = [{}, { Iterator: { range: () => 'user' } }];
  const [[, { Iterator: I }]] = [[...tail, globalThis]];
  assert.same(I.range(0, 3), 'user');
});

// control: a spread strictly AFTER the slot keeps earlier positions static, the sound
// pairing folds to the working polyfill-backed static
QUnit.test('destructuring: spread-after array-wrap still folds the sound pairing', assert => {
  const tail = [{}, {}];
  const [{ Map: M }] = [globalThis, ...tail];
  const groups = M.groupBy([1, 2], x => x % 2);
  assert.deepEqual(groups.get(1), [1]);
  assert.deepEqual(groups.get(0), [2]);
});

// a receiver-bearing slot default fires only when the paired element IS undefined: a DEFINED
// foreign pair keeps the foreign member (native throw preserved), a spread-shifted pair keeps
// the runtime pairing, and a provably-dead default under a sound pair keeps the working fold
QUnit.test('destructuring: receiver-bearing slot default with foreign pair keeps the native throw', assert => {
  const [{ Map: M } = globalThis] = [{}];
  assert.throws(() => M.groupBy([1], x => x), TypeError);
});

QUnit.test('destructuring: receiver-bearing slot default with spread-shifted pair keeps the pair value', assert => {
  const t = [{}, { Map: { groupBy: () => 'user' } }];
  const [, { Map: M } = globalThis] = [...t];
  assert.same(M.groupBy([1], x => x), 'user');
});

QUnit.test('destructuring: dead slot default under a sound pair keeps the working static', assert => {
  const fb = {};
  const [{ Map: M } = fb] = [globalThis];
  assert.deepEqual(M.groupBy([1, 2], x => x % 2).get(1), [1]);
});

// sibling array-wrap elements resolve independently: the walk's cycle guard is a recursion
// stack, so a completed resolution of one element's init must not poison the SAME init name
// in a later element - the second alias's static keeps its polyfill (raw native would throw)
QUnit.test('destructuring: sibling array-wrap elements resolve independently', assert => {
  const [{ WeakSet: W }, { Math: M }] = [globalThis, globalThis];
  assert.same(typeof new W(), 'object');
  assert.same(M.sumPrecise([1, 2]), 3);
});

// the duplicate-var SPLIT ANCHOR applies the same pattern rejections as the init arm: a
// positionally-MISPAIRED anchor write binds the user element, so the member must read the
// user's own value (the wholesale judge substituted the pure static over it)
/* eslint-disable no-redeclare, no-shadow, no-var -- duplicate-var split anchor under test */
QUnit.test('destructuring: split-anchor mispaired write keeps the user value', assert => {
  const { Map: M } = globalThis;
  assert.same(typeof M.groupBy, 'function');
  const userObj = { Map: { groupBy: () => 'user' } };
  function inner() {
    var M;
    var [, { Map: M }] = [globalThis, userObj];
    return M.groupBy([1], x => x);
  }
  assert.same(inner(), 'user');
});

QUnit.test('destructuring: split-anchor sound write keeps the working fold', assert => {
  const { Map: M } = globalThis;
  assert.same(typeof M.groupBy, 'function');
  function inner() {
    var M;
    var [, { Map: M }] = [{}, globalThis];
    return M.groupBy([1, 2], x => x % 2);
  }
  assert.deepEqual(inner().get(0), [2]);
});
/* eslint-enable no-redeclare, no-shadow, no-var -- end of split-anchor shapes */

// a CONDITIONALLY-written statics-only alias (no whole-ctor pure entry) takes the runtime
// constructor guard: the taken path serves the polyfill-backed static, the untaken path still
// reads the native undefined and throws exactly like untranspiled code (a static narrow here
// would un-throw it)
QUnit.test('destructuring: conditional statics-only alias keeps the untaken-path throw', assert => {
  let A, B;
  function writeA(c) {
    if (c) ({ Array: A } = globalThis);
  }
  function writeB(c) {
    if (c) ({ Object: B } = globalThis);
  }
  writeA(true);
  assert.deepEqual(A.from('ab'), ['a', 'b']);
  writeB(false);
  assert.throws(() => B.groupBy([1], x => x), TypeError);
});

// an instance method destructured off an IIFE ARGUMENT synths the argument itself. the binding is
// a DISPATCHER, not a bound method - exactly like the native extraction, whose bare call throws
// (this=undefined -> ToObject); a receiver-supplied call works through explicit this. the
// argument's own effects run exactly once, and a receiver the gate rejects (a call) stays native
QUnit.test('destructuring: IIFE-argument instance methods extract', assert => {
  const viaLiteral = (({ at }) => at)([1, 2]);
  assert.same(typeof viaLiteral, 'function', 'literal argument: the binding holds the dispatcher');
  assert.same(viaLiteral.call([1, 2], 0), 1, 'the dispatcher reads a supplied receiver');
  assert.throws(() => viaLiteral(0), TypeError, 'a bare call throws exactly like the native extraction');
  const arr = [7, [8]];
  const viaIdent = (({ flat }) => flat)(arr);
  assert.deepEqual(viaIdent.call(arr), [7, 8], 'identifier argument: the generic dispatcher works via this');
  const marks = [];
  const viaSeTail = (({ includes }) => includes)((marks.push('m'), [3, 4]));
  assert.same(viaSeTail.call([3, 4], 3), true, 'SE-tail argument: the dispatcher reads the tail');
  assert.deepEqual(marks, ['m'], 'the argument prefix effect runs exactly once');
});

// a nested proxy-destructure whose inner computed key is an Identifier binding `[K]` must EXTRACT the
// static and import its module (const gb = _Map$groupBy), not keep a residual `{ [K]: gb } = _Map`
// that reads the static off the pure constructor without importing it (undefined -> a bare call throws)
QUnit.test('destructuring: nested identifier computed key extracts the polyfill', assert => {
  const K = 'groupBy';
  const { Map: { [K]: gb } } = globalThis;
  const grouped = gb([1, 2, 3, 4], x => x % 2 === 0 ? 'even' : 'odd');
  assert.deepEqual(grouped.get('odd'), [1, 3], 'const identifier key resolves + imports the static');
  assert.deepEqual(grouped.get('even'), [2, 4]);
  const K2 = 'from';
  const { Array: { [K2]: af } } = globalThis;
  assert.deepEqual(af('ab'), ['a', 'b'], 'a second identifier-keyed static resolves independently');
  const K3 = 'Object';
  const { [K3]: { groupBy: og } } = globalThis;
  const byParity = og([1, 2, 3, 4], x => x % 2 === 0 ? 'even' : 'odd');
  assert.deepEqual(byParity.odd, [1, 3], 'an OUTER identifier ctor key resolves + imports the static too');
  assert.deepEqual(byParity.even, [2, 4]);
});

// a nesting key and the host literal's key may SPELL one slot differently; the language pairs them by
// name, so the walk must too. regression: raw literal values were compared, putting the number 0
// against the string '0', and the polyfill was dropped on a receiver whose value was fully known
QUnit.test('destructure: a nested key pairs across spellings', assert => {
  // eslint-disable-next-line @stylistic/quote-props -- the differing spellings are the shape under test
  const { 0: { flat: numericPattern } } = { '0': [1, [2]] };
  assert.same(typeof numericPattern, 'function');
  assert.deepEqual(numericPattern.call([1, [2]]), [1, 2]);
  // eslint-disable-next-line @stylistic/quote-props -- the differing spellings are the shape under test
  const { '0': { at: stringPattern } } = { 0: [3, 4] };
  assert.same(stringPattern.call([3, 4], 0), 3);
});

// an object-pattern key can name an array SLOT: the language reads property '0' off an array host,
// so the walk to the receiver reads the element and the type behind it stays array-specific.
// regression: only an object literal was walked into, so the polyfill was dropped entirely
QUnit.test('destructure: a nested key reads an array slot', assert => {
  const { 0: { at } } = [[1, 2]];
  assert.same(typeof at, 'function');
  assert.same(at.call([1, 2], -1), 2);
  // eslint-disable-next-line @stylistic/quote-props -- the string spelling of the slot is under test
  const { '1': { flat } } = [[3], [4, [5]]];
  assert.deepEqual(flat.call([4, [5]]), [4, 5]);
  // a hole leaves nothing to read, so the extraction stays native and the binding is undefined
  // eslint-disable-next-line no-sparse-arrays -- the hole is the negative under test
  const { 1: overHole } = [[6], , [7]];
  assert.same(overHole, undefined);
});

// an array literal is a static container: the receiver walk descends its slots, so a constructor in
// one resolves its statics. the patch-wins half of that pairing lives with the other slot writes -
// a write here would patch the real global and leak into every later test in this module
QUnit.test('destructure: an array slot resolves statics', assert => {
  const clean = [Object];
  const { 0: { keys } } = clean;
  assert.deepEqual(keys({ a: 1 }), ['a']);
  // the INLINE literal is what the receiver walk descends; a const-bound one is a different shape
  const { 0: { at } } = [[1, 2]];
  assert.same(at.call([1, 2], -1), 2);
});

// a container slot REPLACED after the literal no longer holds what the literal spells, so resolving
// it would hand back a DIFFERENT constructor's static. regression: the read trusted the initial
// member and returned `Object.groupBy` where the program had put `Map.groupBy` there
QUnit.test('destructure: a replaced container slot is not resolved', assert => {
  const holder = { k: Object };
  holder.k = Map;
  const { k: { groupBy } } = holder;
  assert.same(groupBy, Map.groupBy);
  const box = [Object];
  box[0] = Map;
  const { 0: { groupBy: viaSlot } } = box;
  assert.same(viaSlot, Map.groupBy);
});

// a FLAT destructure whose init is a container MEMBER resolves through the same walk the nested
// spelling uses: the clean slot extracts the pure static (polyfill-always-wins), and a written
// slot bails the flat spelling exactly like the nested one - the read stays native
QUnit.test('destructure: a flat pattern over a container member', assert => {
  const flatWrap = { c: Object };
  const { keys: flatKeys } = flatWrap.c;
  assert.deepEqual(flatKeys({ q: 1 }), ['q']);
  const flatReplaced = { c: Object };
  flatReplaced.c = Map;
  const { groupBy: flatBailed } = flatReplaced.c;
  assert.same(flatBailed, Map.groupBy);
});

// an identity self-assign (`box = box`) is a value NO-OP: the census does not treat it as an
// escape and the walks do not treat it as a reassignment, so the container read still resolves
// and the extracted static stays polyfill-backed. a REAL cross-write keeps the bail - the read
// matches native exactly
QUnit.test('destructure: identity self-assign keeps the container resolving', assert => {
  let selfBox = { c: Object };
  // eslint-disable-next-line no-self-assign -- the identity no-op is the shape under test
  selfBox = selfBox;
  const { c: { values: selfValues } } = selfBox;
  assert.deepEqual(selfValues({ q: 7 }), [7]);
  // eslint-disable-next-line no-useless-assignment -- the dead init IS the shape under test
  let crossA = { c: Object };
  const crossB = { c: Map };
  crossA = crossB;
  const { c: { groupBy: crossRead } } = crossA;
  assert.same(crossRead, Map.groupBy);
});

// a residual binding still READS the receiver off the init's sequence tail, so the tail is not dead
// just because some channel marked its node consumed - dropping it bound the residual off the bare
// prefix instead (`name` came out undefined off `0`).
QUnit.test('destructuring: a sequence tail a residual reads survives the lift', assert => {
  const { of, name } = (0, Array);
  assert.deepEqual(of(1, 2), [1, 2]);
  assert.same(name, 'Array');
});

QUnit.test('destructuring: a sequence tail an instance binding reads survives the lift', assert => {
  const source = [1, 2, 3];
  const { at } = (0, source);
  assert.same(at.call(source, -1), 3);
});

// pattern nesting past the retired 32-hop budget is legal source generated code reaches. the climb
// that classifies a parameter position used to THROW there, so nothing below ran at all. the
// polyfill belongs in the LEAF's own default slot, which fires per-slot: an argument that leaves the
// slot empty gets it, an argument that fills the slot keeps the caller's own value.
QUnit.test('destructuring: a parameter pattern nested past thirty-two levels', assert => {
  function deep([[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[{ from } = Array]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]) {
    return from([1, 2]);
  }
  assert.deepEqual(deep([[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[undefined]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]), [1, 2], 'an empty slot takes the default polyfill');
  const calls = [];
  function callerFrom(x) {
    calls.push(x);
    return 'caller';
  }
  assert.same(deep([[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[{ from: callerFrom }]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]), 'caller', "a filled slot keeps the caller's value");
  assert.deepEqual(calls, [[1, 2]], "the caller's method receives the arguments");
});

// an assignment-destructure occupying an unbraced control slot. the receiver is memoized, so the
// emitted `_ref` and the polyfill assignment reading it must land in the SAME block: an insertion
// that block-wraps the slot a second time leaves the read above the declaration (ReferenceError).
// the braced twin is the control - it needs no wrapping at all
QUnit.test('destructuring: an assignment in an unbraced control slot memoizes in place', assert => {
  const obj = { list: [1, 2, 3] };
  let at, length;
  if (obj.list) ({ at, length } = obj.list);
  assert.same(at.call(obj.list, -1), 3, 'the polyfill reads the memoized receiver');
  assert.same(length, 3, 'the residual binds off the same memo');
  let bracedAt, bracedLength;
  if (obj.list) { ({ at: bracedAt, length: bracedLength } = obj.list); }
  assert.same(bracedAt.call(obj.list, -1), 3);
  assert.same(bracedLength, 3);
});

QUnit.test('destructuring: an unbraced loop body memoizes in place', assert => {
  const obj = { list: [4, 5] };
  let at, length;
  for (let i = 0; i < 1; i++) ({ at, length } = obj.list);
  assert.same(at.call(obj.list, -1), 5);
  assert.same(length, 2);
  let doAt;
  do ({ at: doAt } = obj.list); while (false);
  assert.same(doAt.call(obj.list, 0), 4);
});

// a for-HEAD whose sibling declarator carries a side effect: the extraction re-registers only the
// declarators it introduces. registering the whole declaration re-registers a sibling an earlier
// prop already rewrote, which aborts the build - so this file failing to compile IS the assertion.
// the effect itself still runs exactly once, wherever the sink lands in the header
QUnit.test('destructuring: a for-head sibling declarator keeps its side effect once', assert => {
  let calls = 0;
  function getJSON() {
    calls++;
    return JSON;
  }
  let rounds = 0;
  const seen = [];
  for (const { Array: { from } } = globalThis, { parse } = getJSON(); rounds < 2; rounds++) {
    seen.push(from([1]), parse('2'));
  }
  assert.same(calls, 1, 'the side-effecting sibling init runs once, not once per round');
  assert.deepEqual(seen, [[1], 2, [1], 2], 'both head bindings stay usable across rounds');
});

// the VALUE of a destructuring assignment is its right side, so a receiver replaced by a synth mirror
// literal changes what the capturing binding holds: the site stands down WHOLE instead, and the
// binding then reads the receiver's own slot. the statement-position twin discards that value and
// keeps mirroring - that is where the polyfill still lands.
// the legs whose EMISSION runs on babel-lowered text see the same site as a plain alias-binding read
// (`_ref = shim || Object, assign = _ref.assign`) and polyfill it through an identity dispatch, so
// there the binding IS the pure export. both answers agree on any host that HAS the static, which is
// every local leg for `Object.assign` - the karma floor is the only one that tells them apart
const POST_LOWERED = typeof E2E_POST_LOWERED !== 'undefined';

QUnit.test('destructuring: a captured assignment value stays the receiver', assert => {
  const shim = null;
  let assign;
  const host = { assign } = shim || Object;
  assert.same(host, Object, 'the captured value is the branch object, not a mirror literal');
  // the binding is the captured receiver's OWN slot, so `undefined` where the engine lacks the
  // static; comparing it against `Object.assign` unconditionally would put that slot against the
  // pure module's export, and those agree only where the native exists
  assert.same(assign, POST_LOWERED ? Object.assign : host.assign,
    'the binding reads off the captured receiver, not a mirror');
  let statementAssign;
  // eslint-disable-next-line prefer-const -- a destructuring-assignment target cannot be `const`
  ({ assign: statementAssign } = shim || Object);
  assert.same(typeof statementAssign, 'function', 'the value-discarding twin keeps its own channel');
  assert.deepEqual(statementAssign({}, { a: 1 }), { a: 1 });
});

// a destructure whose init is MEMOIZED keeps resolving statics for the props AFTER the memo. this
// emitter mutates the host in place, so the memo replaces the init and every later prop resolves
// against a bare ref; without the constructor's name riding along, the first INSTANCE prop ended
// static extraction and the rest shipped as native reads (undefined in the stripped realm)
QUnit.test('destructuring: statics after an instance prop off a memoized init', assert => {
  let effects = 0;
  function arrayCtor() {
    effects++;
    return Array;
  }
  const { name, of, from } = arrayCtor();
  assert.same(typeof of, 'function', 'a static AFTER the instance prop is still extracted');
  assert.same(typeof from, 'function', 'and so is the one after that');
  assert.deepEqual(of(1, 2), [1, 2], 'the extracted static works');
  assert.deepEqual(from([3, 4]), [3, 4], 'and so does the second');
  assert.same(typeof name, 'string', 'the instance prop between them still reads');
  assert.same(effects, 1, 'the memoized init evaluated once');
  // the same shape with the statics on BOTH sides of the instance prop
  const seqEffects = [];
  const { of: seqOf, name: seqName, from: seqFrom } = (seqEffects.push('r'), Array);
  assert.deepEqual(seqOf(5), [5], 'a static before the instance prop');
  assert.deepEqual(seqFrom([6]), [6], 'and one after it');
  assert.same(typeof seqName, 'string', 'the instance prop still reads');
  assert.deepEqual(seqEffects, ['r'], 'the sequence prefix ran once');
});

// a destructure prop that IS polyfilled owns the pattern, not the whole init: the claims INSIDE the
// init keep their own rewrites, because the extraction re-emits that init rather than replacing it.
// claiming the whole proxy-rooted chain left the inner claim as a native read the target may lack
QUnit.test('destructuring: an init claim survives a polyfilled pattern prop', assert => {
  const { name } = globalThis.Array.prototype.at;
  assert.same(typeof name, 'string', 'the pattern prop resolves');
  const { name: ctorName } = globalThis.Map.prototype.has;
  assert.same(typeof ctorName, 'string', 'and so does one over a collapsing constructor');
  // an array pattern reaches the same init through a different consumer, and a length read proves
  // the value the pattern destructured is the polyfilled function rather than a stripped native
  const { length } = globalThis.Array.prototype.at;
  assert.same(typeof length, 'number', 'a non-polyfilled pattern prop reads off the polyfilled claim');
});

// a claim under a polyfilled pattern prop keeps its own render on BOTH the shapes the init channels
// decline: a PROBED nav (whose value can short-circuit) and a claim whose side effects the host
// rebuild left position-less. each used to ship the init raw - one deferring to a visitor its own
// skip-mark had suppressed, the other standing down because a clone keeps `loc` but not the span
QUnit.test('destructuring: a declined init still gets its claim rendered', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  /* eslint-disable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- the throw on the
     short-circuit IS the asserted semantics, and the nested sequence IS the form under test */
  function probedCtor() {
    const { name } = globalThis.window?.self.Map;
    return typeof name;
  }
  function probedStatic() {
    const { name } = globalThis.window?.self.Array.of;
    return typeof name;
  }
  let seq = 0;
  function leadingEffect() {
    const { name } = (seq++, (seq++, globalThis.window?.self))?.Array.of;
    return typeof name;
  }
  /* eslint-enable no-unsafe-optional-chaining, @stylistic/no-extra-parens -- end of the forms */
  if (WINDOW_PRESENT) {
    assert.same(probedCtor(), 'string', 'the constructor claim resolves through its guard');
    assert.same(probedStatic(), 'string', 'and so does the static one');
    assert.same(leadingEffect(), 'string', 'a leading effect does not cost the claim');
  } else {
    assert.throws(probedCtor, TypeError, 'an absent host short-circuits and the pattern throws, as the source does');
    assert.throws(probedStatic, TypeError, 'the static claim short-circuits with it');
    assert.throws(leadingEffect, TypeError, 'and so does the leading-effect form');
  }
  assert.same(seq, 2, 'the leading effects ran exactly once each');
});

// a FULL-consume extraction over an undefinable probe nav rides a THROW probe on every
// receiver shape and first-key spelling: the ctor leaf, both property orders, the string /
// symbol first keys. the `??` fallback rescues the nullish path, and the resolvable roots
// keep the collapse. host decides which half runs
QUnit.test('destructuring: a probed init throws for every consuming position', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  /* eslint-disable no-unsafe-optional-chaining -- the throw on the short-circuit IS the
     asserted semantics */
  function ctorLeaf() {
    const { of } = globalThis.window?.Array;
    return typeof of;
  }
  function anchoredFirst() {
    const { Set: { union }, Array: { of } } = globalThis.window?.self;
    return [typeof union, typeof of];
  }
  function consumedFirst() {
    const { Array: { of }, Set: { union } } = globalThis.window?.self;
    return [typeof of, typeof union];
  }
  function stringKeyFirst() {
    // eslint-disable-next-line @stylistic/quote-props -- the string spelling IS the form under test
    const { 'Array': { of }, Set: { union } } = globalThis.window?.self;
    return [typeof of, typeof union];
  }
  function arrayWrapped() {
    const [{ of }] = [globalThis.window?.Array];
    return typeof of;
  }
  function aliasHeld() {
    const w = globalThis.window;
    const { of } = w?.Array;
    return typeof of;
  }
  function fallbackRescued() {
    const { of } = globalThis.window?.Array ?? {};
    return typeof of;
  }
  /* eslint-enable no-unsafe-optional-chaining -- end of the forms */
  if (WINDOW_PRESENT) {
    assert.same(ctorLeaf(), 'function', 'the ctor-leaf extraction resolves on a present host');
    assert.deepEqual(anchoredFirst(), ['function', 'function'], 'the anchored-first order resolves');
    assert.deepEqual(consumedFirst(), ['function', 'function'], 'the consumed-first order resolves');
    assert.deepEqual(stringKeyFirst(), ['function', 'function'], 'the string-key order resolves');
    assert.same(arrayWrapped(), 'function', 'the array-wrapped extraction resolves');
    assert.same(aliasHeld(), 'function', 'the alias-held extraction resolves');
    // the `??` row is a DECLINE (swapping a value-selecting nullish-able left would flip the
    // branch), so the read stays native and answers the host's own slot - absent on the karma
    // floor, where the probe below reads the real constructor rather than a rewritten member
    const hostArrayHasOf = Object.hasOwn(Array, 'of');
    assert.same(fallbackRescued(), hostArrayHasOf ? 'function' : 'undefined',
      'a present host never reads the fallback - the declined row answers the host slot');
  } else {
    assert.throws(ctorLeaf, TypeError, 'the ctor-leaf extraction throws, as the source does');
    assert.throws(anchoredFirst, TypeError, 'the anchored-first order throws');
    assert.throws(consumedFirst, TypeError, 'the consumed-first order throws');
    assert.throws(stringKeyFirst, TypeError, 'the string-key order throws');
    assert.throws(arrayWrapped, TypeError, 'the array-wrapped extraction throws');
    assert.throws(aliasHeld, TypeError, 'the alias-held extraction throws');
    assert.same(fallbackRescued(), 'undefined', 'the `??` fallback rescues the nullish path silently');
  }
  // eslint-disable-next-line no-unsafe-optional-chaining -- the defined-root control mirrors the guarded forms
  const { of: definedOf } = globalThis?.Array;
  assert.same(typeof definedOf, 'function', 'control: a defined root keeps its extraction');
});

// the symbol-first spelling asks the same probe through the synth extraction channel
if (!Symbol.sham) {
  QUnit.test('destructuring: a symbol-first probed init throws like its dotted twin', assert => {
    const WINDOW_PRESENT = typeof window != 'undefined';
    /* eslint-disable no-unsafe-optional-chaining -- the throw on the short-circuit IS the
       asserted semantics */
    function symbolFirst() {
      const { [Symbol.iterator]: it, Array: { of } } = globalThis.window?.self;
      return [typeof it, typeof of];
    }
    function symbolOnly() {
      const { [Symbol.iterator]: it } = globalThis.window?.self.Array.prototype;
      return typeof it;
    }
    /* eslint-enable no-unsafe-optional-chaining -- end of the forms */
    if (WINDOW_PRESENT) {
      // the symbol leaf reads the host's REAL slot (globalThis is not iterable natively, so the
      // extraction answers undefined exactly as the source does); the dotted leaf resolves its ponyfill
      assert.deepEqual(symbolFirst(), ['undefined', 'function'], 'a present host answers the real symbol slot');
      assert.same(symbolOnly(), 'function', 'the single-symbol pattern resolves');
    } else {
      assert.throws(symbolFirst, TypeError, 'the symbol-first pattern throws, as the source does');
      assert.throws(symbolOnly, TypeError, 'the single-symbol pattern throws too');
    }
  });
}

// a value that IS the environment probe: the bare one-hop init, its sealed twin, the
// agreeing-proxy ternary and the alias holding it all throw on a full consume exactly
// where the probe is absent; defined roots keep their extraction. the standalone-post leg
// sees the LOWERED text, where these destructures are already plain member reads with no
// `?.` for the probe rules to reach - there the all-plain collapse legitimately answers
// the ponyfill instead of the throw (the accepted second-pass boundary), so it skips
testUnlessDetectLowered('destructuring: a bare environment-probe init throws on a full consume', assert => {
  const WINDOW_PRESENT = typeof window != 'undefined';
  function bareProbe() {
    const { Array: { of } } = globalThis.window;
    return typeof of;
  }
  function sealedProbe() {
    // eslint-disable-next-line @stylistic/no-extra-parens -- the seal IS the form under test
    const { Array: { of } } = (globalThis.window);
    return typeof of;
  }
  function ternaryProbe() {
    const { Array: { of } } = globalThis.setTimeout ? globalThis.window : globalThis.window;
    return typeof of;
  }
  function aliasProbe() {
    const held = globalThis.window;
    const { Array: { of } } = held;
    return typeof of;
  }
  if (WINDOW_PRESENT) {
    assert.same(bareProbe(), 'function', 'a present host resolves the bare-probe extraction');
    assert.same(sealedProbe(), 'function', 'the sealed twin resolves');
    assert.same(ternaryProbe(), 'function', 'the ternary collapse resolves');
    assert.same(aliasProbe(), 'function', 'the alias-held probe resolves');
  } else {
    assert.throws(bareProbe, TypeError, 'the bare-probe extraction throws, as the source does');
    assert.throws(sealedProbe, TypeError, 'the sealed twin throws');
    assert.throws(ternaryProbe, TypeError, 'the ternary collapse throws');
    assert.throws(aliasProbe, TypeError, 'the alias-held probe throws');
  }
  const { Array: { of: definedOf } } = globalThis;
  assert.same(typeof definedOf, 'function', 'control: the defined root keeps its extraction');
});

// a synth-swap / nested-mirror host over a PLAIN undefinable receiver keeps the always-defined
// literal: the caller-correct fallback slot fires only when nothing was passed, and the ponyfill
// resolves where native would throw on the absent host - the accepted divergence the provider
// AGENTS.md spells (a SEALED receiver read still probes there, by the seal rule; the fixture
// family locks that contrast). the standalone-post leg sees the LOWERED
// text, where the default is already a guarded expression whose reads keep the source throw - the
// accepted second-pass boundary answers differently there, so it skips
testUnlessDetectLowered('destructuring: a param-default synth-swap over an undefinable receiver resolves the ponyfill', assert => {
  /* eslint-disable no-unsafe-optional-chaining -- the undefinable receiver IS the case under
     test (the transform supplants it with the always-defined literal) */
  function paramFlat({ of } = globalThis.window?.Array) { return typeof of; }
  function paramMirror({ Array: { of } } = globalThis.window?.self) { return typeof of; }
  function iifeArg() {
    return (({ of }) => typeof of)(globalThis.window?.Array);
  }
  function innerDefault() {
    const { propQ: { of } = globalThis.window?.Array } = {};
    return typeof of;
  }
  /* eslint-enable no-unsafe-optional-chaining -- end of the forms */
  assert.same(paramFlat(), 'function', 'the flat param default resolves the ponyfill on any host');
  assert.same(paramMirror(), 'function', 'the nested mirror resolves the ponyfill on any host');
  assert.same(iifeArg(), 'function', 'the IIFE argument resolves the ponyfill on any host');
  assert.same(innerDefault(), 'function', 'the inner default resolves the ponyfill on any host');
  assert.same(paramFlat({ of: () => [] }), 'function', 'control: a passed argument destructures natively');
  function definedParam({ of } = globalThis.self.Array) { return typeof of; }
  assert.same(definedParam(), 'function', 'control: the defined receiver keeps its synth');
  // the boundary's one exception: a SEALED receiver read re-emits as a throw probe (seal rule)
  // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed read over the short-circuit IS the form under test
  function sealedParam({ of } = (globalThis.window?.self).Array) { return typeof of; }
  if (typeof window == 'undefined') {
    assert.throws(sealedParam, TypeError, 'the sealed receiver read throws on the absent host, as the source does');
  } else {
    assert.same(sealedParam(), 'function', 'a present host resolves the sealed receiver');
  }
});

// a WELL-KNOWN-SYMBOL key beside a plain one in a PARAM DEFAULT: the default is replaced by the
// synth literal, whose symbol slot carries the method lookup rather than a raw symbol read (that
// read answers undefined on an engine without the native symbol). caller-correct by construction -
// an argument the caller DOES pass destructures natively, so the polyfilled slots must not leak
// into it. NATIVE-SYMBOL ONLY: conflict with Babel `_toPropertyKey` -> `_toPrimitive`
if (!Symbol.sham) QUnit.test('destructuring: wks key beside a plain one in a param default', assert => {
  function read({ at, [Symbol.iterator]: it } = [3, 4, 5]) {
    return [at, it];
  }
  const [at, it] = read();
  assert.same(typeof at, 'function');
  assert.same(at.call([9, 8], 0), 9);
  assert.same(typeof it, 'function');
  assert.same(it.call([7, 8]).next().value, 7);
  // a PASSED argument destructures natively - the synth default never fires for it
  const passed = { at: 'own-at', [Symbol.iterator]: 'own-iterator' };
  assert.deepEqual(read(passed), ['own-at', 'own-iterator']);
});

// ... and a STRING spelling of that symbol's own name is an ordinary property: the slot must keep
// the plain read, since reading it through the symbol would hand back a different value entirely
QUnit.test('destructuring: a string-spelled symbol name stays a plain property', assert => {
  const src = { at: [].at, 'Symbol.iterator': 'plain-own-property' };
  const named$key = 'Symbol.iterator';
  function read({ at, [named$key]: named } = src) {
    return [at, named];
  }
  const [at, named] = read();
  assert.same(typeof at, 'function');
  assert.same(named, 'plain-own-property');
});

// several claims off ONE array-wrapper element: the extractions bind the consumed keys, so the
// residual must not re-read them - native reads each property exactly once, and a kept residual
// would fire their getters a second time. the surviving user binding keeps its own single read
QUnit.test('destructuring: array-wrapper element is read once per key', assert => {
  const reads = [];
  // an ARRAY receiver, so the claims resolve and the residual's own reads are what this counts
  const src = [3, 4];
  for (const key of ['at', 'keys']) {
    Object.defineProperty(src, key, {
      // an OWN method, so the read answers the same value with or without the native one -
      // the assertion here is the read COUNT, not which implementation answers
      get() {
        reads.push(key);
        return function own() { return key; };
      },
      enumerable: true,
    });
  }
  Object.defineProperty(src, 'other', { value: 'kept', enumerable: true });
  const [{ at, keys, other }] = [src];
  assert.same(at(), 'at');
  assert.same(keys(), 'keys');
  assert.same(other, 'kept');
  assert.deepEqual(reads, ['at', 'keys']);
});

// an array-wrapper NEIGHBOUR that runs code pins the evaluation order: native evaluates every
// element of the literal before reading a property off any of them, so a hoisted extraction
// would move the read ahead of the neighbour. the claim stays native there
QUnit.test('destructuring: an effectful array-wrapper neighbour keeps the order', assert => {
  const order = [];
  // an ARRAY receiver, so the claims actually resolve - on a plain object neither `at` nor
  // `keys` is a polyfillable method and the row would observe an untransformed destructure
  const src = [1, 2];
  for (const key of ['at', 'keys']) {
    Object.defineProperty(src, key, {
      get() {
        order.push(key);
        return function own() { return key; };
      },
      enumerable: true,
    });
  }
  function neighbour() {
    order.push('neighbour');
    return 'n';
  }
  const [{ at, keys }, n] = [src, neighbour()];
  assert.same(at(), 'at');
  assert.same(keys(), 'keys');
  assert.same(n, 'n');
  assert.deepEqual(order, ['neighbour', 'at', 'keys']);
  // the read COUNT is the second half of the claim: one per key, like native
  assert.same(order.length, 3);
});

// an ARRAY receiver carrying own getters for the claimed keys: the claims resolve (a plain object
// has no polyfillable `at` / `keys`), the getters record the READ, and the values they return are
// plain functions, so the extracted binding is callable without the receiver native would need
function orderedSource(order, keys) {
  const src = [1, 2];
  for (const key of keys) {
    Object.defineProperty(src, key, {
      get() {
        order.push(key);
        return function own() { return key; };
      },
      enumerable: true,
    });
  }
  return src;
}

// a SOURCE declarator ahead of an array-wrapped one: native runs its initializer first, so a memo
// of the wrapper element hoisted above the whole declaration would invert two observable effects
QUnit.test('destructuring: a declarator before an array wrap keeps the order', assert => {
  const order = [];
  const src = orderedSource(order, ['at', 'keys']);
  function eff() {
    order.push('eff');
    return 'q';
  }
  function pick() {
    order.push('pick');
    return src;
  }
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the shared declaration IS the shape under test
  const q = eff(), [{ at, keys }] = [pick()];
  assert.same(q, 'q');
  assert.same(at(), 'at');
  assert.same(keys(), 'keys');
  assert.deepEqual(order, ['eff', 'pick', 'at', 'keys']);
});

// two array-wrapped declarators in ONE declaration are two independent verdicts: each element is
// selected once and read once, and neither residual survives to read the other's
QUnit.test('destructuring: two array-wrapped declarators in one declaration', assert => {
  const order = [];
  const first = orderedSource(order, ['at']);
  const second = orderedSource(order, ['keys']);
  function pickFirst() {
    order.push('first');
    return first;
  }
  function pickSecond() {
    order.push('second');
    return second;
  }
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the shared declaration IS the shape under test
  const [{ at }] = [pickFirst()], [{ keys }] = [pickSecond()];
  assert.same(at(), 'at');
  assert.same(keys(), 'keys');
  assert.deepEqual(order, ['first', 'at', 'second', 'keys']);
});

// a SURVIVING prop keeps the residual, and the extraction still reads the element before it - one
// selection of the receiver, one read per key, exactly what the flat channel performs
QUnit.test('destructuring: an array wrap with a surviving prop reads once', assert => {
  const reads = [];
  const src = orderedSource(reads, ['at']);
  Object.defineProperty(src, 'other', { value: 'kept', enumerable: true });
  let selections = 0;
  function select() {
    selections++;
    return src;
  }
  const [{ at, other }] = [select()];
  assert.same(at(), 'at');
  assert.same(other, 'kept');
  assert.same(selections, 1);
  assert.deepEqual(reads, ['at']);
});

// an element the claim never touched still COERCES its own value, and no extraction repeats that
// read - a wrapper that dropped it would swallow the TypeError native throws here
QUnit.test('destructuring: an unclaimed wrapper element keeps coercing', assert => {
  assert.throws(() => {
    // eslint-disable-next-line no-empty-pattern -- the empty element IS the coercion under test
    const [{}, { at }] = [null, [1, 2]];
    return at;
  }, TypeError);
});

// a REST element keeps the residual, so the wrapper element has a SECOND reader: re-running the
// selection instead of sharing one evaluation lets a getter fired by the first read pick the
// other branch, and here that branch is nullish
QUnit.test('destructuring: a rest wrapper shares one selection', assert => {
  let flipped = false;
  const first = [1, 2];
  Object.defineProperty(first, 'at', {
    get() {
      flipped = true;
      return function own() { return 'at'; };
    },
    enumerable: true,
  });
  const [{ at }, ...rest] = [flipped ? null : first, 9];
  assert.same(at(), 'at');
  assert.deepEqual(rest, [9]);
  assert.same(flipped, true);
});

// a `for-x` head writes the member slot per iteration, so a body read of that slot must keep
// reading what the head assigned - even from a nested closure, where the write-gate used to lose
// sight of the receiver and let the polyfill win over the assigned value
QUnit.test('destructuring: a for-of head write survives a closure read', assert => {
  const src = [1, 2];
  const seen = [];
  for (src.at of [function assigned() { return 'assigned'; }]) {
    function read() { return src.at(0); }
    seen.push(read());
  }
  assert.deepEqual(seen, ['assigned']);
  // ... and a receiver the closure BINDS itself is a different object, which keeps its polyfill
  const shadowedResults = [];
  for (src.flat of [function assigned() { return 'assigned'; }]) {
    function shadowed(own) { return own.flat(); }
    shadowedResults.push(shadowed([1, [2]]));
  }
  assert.deepEqual(shadowedResults, [[1, 2]]);
});

// an IIFE call-ARG evaluates at the CALL SITE, so the receiver it names is the one visible THERE -
// a same-named parameter of the invoked function shadows nothing on that side. asking inside the
// frame turned a resolvable receiver into an unknown one and dropped the polyfill on a rename
/* eslint-disable default-param-last, es/no-nonstandard-object-properties, no-shadow, no-unused-vars
   -- the SHAPE is the test: a dead `Object` default ahead of a positional parameter whose name
   shadows the receiver the call site passes */
QUnit.test('destructuring: an arg receiver resolves at the call site, not in the callee frame', assert => {
  let calls = 0;
  function mk() {
    calls += 1;
    return Array;
  }
  const cond = true;
  const viaBranch = (function ({ from } = Object, mk) {
    return from;
  })(cond ? mk() : Object);
  assert.deepEqual(viaBranch('ab'), ['a', 'b'], 'the branch receiver keeps its polyfilled static');
  const viaLogical = (function ({ from } = Object, mk) {
    return from;
  })(mk() || Object);
  assert.deepEqual(viaLogical('cd'), ['c', 'd'], 'a fallback-logical arg answers the same way');
  assert.same(calls, 2, 'each receiver call ran exactly once');
  const renamed = (function ({ from } = Object, zz) {
    return from;
  })(cond ? mk() : Object);
  assert.deepEqual(renamed('ef'), ['e', 'f'], 'control: the same shape without the shadowing name');
});
/* eslint-enable default-param-last, es/no-nonstandard-object-properties, no-shadow, no-unused-vars
   -- the shape-under-test block ends here */

// a nested claim dispatches on the hop the SOURCE reads, so that hop must be read exactly as often
// as the source reads it: once. the getter counts it - a route spelling the hop beside a surviving
// residual, or a sibling claim spelling it for itself, shows up here as a second read
QUnit.test('destructuring: a nested claim reads its hop once', assert => {
  function box() {
    const carrier = { reads: 0, keep: 7 };
    Object.defineProperty(carrier, 'y', {
      get() { carrier.reads += 1; return Object.assign([1, [2]], { other: 5 }); },
      enumerable: true,
      configurable: true,
    });
    return carrier;
  }
  const sole = box();
  const { y: { at } } = sole;
  assert.same(typeof at, 'function', 'the sole nested claim resolves');
  assert.same(sole.reads, 1, 'and reads the hop once');
  const withHostSibling = box();
  const { y: { at: at2 }, keep } = withHostSibling;
  assert.same(typeof at2, 'function', 'a host sibling keeps the claim');
  assert.same(keep, 7, 'and binds its own key');
  assert.same(withHostSibling.reads, 1, 'still one read of the hop');
  const withLeafSiblings = box();
  const { y: { at: at3, other } } = withLeafSiblings;
  assert.same(typeof at3, 'function', 'a leaf sibling flattens onto the twin');
  assert.same(other, 5, 'and the sibling binds off the same read');
  assert.same(withLeafSiblings.reads, 1, 'which is one read of the hop');
  const withTwoClaims = box();
  const { y: { at: at4, flat } } = withTwoClaims;
  assert.same(typeof at4, 'function', 'two claims in one leaf both resolve');
  assert.same(typeof flat, 'function', 'the second one too');
  assert.same(withTwoClaims.reads, 1, 'sharing the one read');
});

// the positional element cannot be spelled - the pattern pulls from an iterator - so it takes a
// minted binding, and what the claim dispatches on is whatever the source's own slot received
QUnit.test('destructuring: a positional element claim binds through its slot', assert => {
  const pulls = [];
  const rows = {
    [Symbol.iterator]() {
      let index = 0;
      return {
        next() {
          pulls.push(index);
          return { value: [1, [2]], done: index++ > 0 };
        },
      };
    },
  };
  const [{ at }] = rows;
  assert.same(typeof at, 'function', 'the claim resolves off the pulled element');
  assert.same(pulls.length, 1, 'and the pattern pulled exactly once');
  let caught;
  try {
    throw [[1, [2]]];
  } catch ([{ at: thrown }]) {
    caught = thrown;
  }
  assert.same(typeof caught, 'function', 'the catch parameter relocates and extracts there');
});

// an OPTIONAL nav init is memoized like a plain one: the dispatch and the surviving residual read
// the same ref, so the hop's getter fires once - spelling the nav twice fires it twice
QUnit.test('destructuring: an optional nav init reads its hop once', assert => {
  const carrier = { reads: 0 };
  Object.defineProperty(carrier, 'y', {
    get() { carrier.reads += 1; return Object.assign([1, [2]], { other: 5 }); },
    enumerable: true,
    configurable: true,
  });
  // the SHAPE is the test: an optional nav as a destructure init is what must memoize
  // eslint-disable-next-line no-unsafe-optional-chaining -- `carrier` is provably present here
  const { at, other } = carrier?.y;
  assert.same(typeof at, 'function', 'the claim resolves through the optional nav');
  assert.same(other, 5, 'and the residual binds off the same read');
  assert.same(carrier.reads, 1, 'which is one read of the hop');
});

// a slot DEFAULT folds both arms into the dispatch: the LIVE arm is the one that usually runs, and
// a rewrite that polyfilled only the default would leave it reading whatever the engine happens to
// have. the hop is a getter, so the fold's single read is observable beside the answer
QUnit.test('destructuring: a slot default polyfills the live arm too', assert => {
  const src = { reads: 0 };
  Object.defineProperty(src, 'y', {
    get() { src.reads += 1; return [1, [2]]; },
    enumerable: true,
    configurable: true,
  });
  const spare = [3];
  const { y: { flat } = spare } = src;
  assert.same(typeof flat, 'function', 'the live arm carries the polyfilled method');
  assert.same(src.reads, 1, 'and the nav was read once');
  const absent = {};
  const { y: { flat: fromDefault } = spare } = absent;
  assert.same(typeof fromDefault, 'function', 'the default arm answers the same way');
  // the emptied hop leaves the residual, so a host sibling never reads it a second time
  const beside = { reads: 0, keep: 7 };
  Object.defineProperty(beside, 'inner', {
    get() { beside.reads += 1; return [1, [2]]; },
    enumerable: true,
    configurable: true,
  });
  const { inner: { flatMap } = [], keep } = beside;
  assert.same(typeof flatMap, 'function', 'the claim beside a sibling still resolves');
  assert.same(keep, 7, 'the sibling binds its own key');
  assert.same(beside.reads, 1, 'and the defaulted hop was read once');
});

// a REST sibling keeps the emptied hop in the pattern - it is what excludes that key from rest - so
// the hop's VALUE takes a minted binding instead and the dispatch reads that name: the polyfill lands
// AND the source's single read stands, which is what the two assertions below hold apart
QUnit.test('destructuring: a rest sibling keeps the hop read single', assert => {
  const box = { keep: 7, reads: 0 };
  Object.defineProperty(box, 'inner', {
    get() {
      box.reads += 1;
      return [1, [2]];
    },
    enumerable: true,
    configurable: true,
  });
  const { inner: { flat }, ...rest } = box;
  assert.same(rest.keep, 7, 'rest gathers what the pattern did not name');
  assert.same(box.reads, 1, 'and the hop was read once');
  assert.same(typeof flat, 'function', 'while the claim still resolves to its polyfill');
});

// the claim's own computed KEY is an effect the source runs between the hop read and the bind, so a
// rewrite that discards the prop discards that effect - the order below is the whole test
QUnit.test('destructuring: a side-effect key keeps its place', assert => {
  const log = [];
  const box = {};
  Object.defineProperty(box, 'inner', {
    get() {
      log.push('hop');
      return [1, [2]];
    },
    enumerable: true,
    configurable: true,
  });
  const { inner: { [(log.push('key'), 'flat')]: m } } = box;
  assert.same(typeof m, 'function', 'the claim resolves through the flat twin');
  assert.same(log.join(','), 'hop,key', 'and the key ran once, after the hop read');
});

// the flat twin of a nested claim lives in the literal's ELEMENT under an array wrapper, so the
// normalization writes the nav there - the hop is still read once, and the claim still resolves
// against the receiver's own type rather than degrading to the generic dispatcher
QUnit.test('destructuring: a wrapper element takes the flattened nav', assert => {
  const box = { reads: 0 };
  Object.defineProperty(box, 'y', {
    get() {
      box.reads += 1;
      return [1, [2]];
    },
    enumerable: true,
    configurable: true,
  });
  const [{ y: { flat, length: len } }] = [box];
  assert.same(typeof flat, 'function', 'the claim resolves through the element');
  assert.same(len, 2, 'and the sibling binds off the same read');
  assert.same(box.reads, 1, 'which is one read of the hop');
});

// the wrapper element MEMOIZES when its claims cannot re-read it, and the memo takes the element's
// place - so the receiver's type has to ride across that swap or the second claim degrades to the
// generic dispatcher. `at` is the discriminator: it lives on String too, so only a receiver known
// to be an Array narrows it, and in a realm without the built-in only the narrowed one answers
QUnit.test('destructuring: the element memo carries the receiver type', assert => {
  // the SHAPE is the test: a CALL cannot be re-read, so the element memoizes - and its return type
  // is still known, which is what the claims after the memo need
  function makeRow() {
    return [1, [2]];
  }
  const [{ at, findLast }] = [makeRow()];
  assert.same(typeof at, 'function', 'the claim after the memoizing one still resolves');
  assert.same(typeof findLast, 'function', 'and so does the one that planted the memo');
  assert.same(at.call([4, 5], -1), 5, 'and the dispatcher it got answers for an array');
});

// a WRITE to the slot unseats the narrow for every spelling that reads it - including the nested
// one, whose reference stands in a declarator's init and used to be dropped as an alias. the test
// runs the written value: a dispatcher narrowed to the init's family answers nothing for it
QUnit.test('destructuring: a written slot keeps every spelling generic', assert => {
  const box = { y: [1, [2]] };
  box.y = 'str';
  const { y: { at } } = box;
  assert.same(typeof at, 'function', 'the claim still resolves');
  assert.same(at.call('abc', -1), 'c', 'and the dispatcher it got answers for the written family');
});

// a CATCH parameter has no declaration for a claim to extract into, so the relocation gives it one -
// and a claim sitting BELOW a prop key is what that relocation must recognise, exactly as it already
// recognises one below an array element
QUnit.test('destructuring: a nested claim in a catch parameter extracts', assert => {
  const thrown = { y: [1, [2]] };
  let seen;
  try {
    throw thrown;
  } catch ({ y: { flat } }) {
    seen = flat;
  }
  assert.same(typeof seen, 'function', 'the claim resolves off the relocated parameter');
  assert.same(seen.call([1, [2]]).length, 2, 'and the dispatcher it got answers for the thrown value');
});

// array WRAPPERS nest, and every level is the same pairing: the claim under two of them reads the
// same hop as under one. the order questions read every level too - a neighbour after the slot at
// the INNER level is evaluated after it just like an outer one, so the extraction stays behind it
QUnit.test('destructuring: a claim under nested array wrappers reads its own hop', assert => {
  const nb = { y: [1, [2]] };
  const [[{ y: { flat } }]] = [[nb]];
  assert.same(typeof flat, 'function', 'the claim resolves through both wrapper levels');
  assert.same(flat.call([1, [2]]).length, 2, 'and the dispatcher it got answers for the hop value');
  const log = [];
  const [[{ y: { at } }, zn]] = [[nb, log.push('n')]];
  assert.same(typeof at, 'function', 'the claim beside an inner effect resolves too');
  assert.same(zn, 1, 'the neighbour keeps its own value');
  assert.same(log.join(','), 'n', 'and its effect ran exactly once');
});

// a LOOP HEAD binds per iteration with no declaration a claim could extract into, so the head takes
// a minted name and the pattern moves into the body. the kind travels with it - a `const` head still
// binds per iteration, which a closure made in the body is what proves
QUnit.test('destructuring: a claim in a loop head relocates and keeps its binding', assert => {
  const rows = [[1, [2]], [3]];
  const seen = [];
  for (const { flat } of rows) seen.push(typeof flat);
  assert.same(seen.join(','), 'function,function', 'the claim resolves on every iteration');
  assert.same(rows.map(row => {
    let call;
    for (const { flat } of [row]) call = flat.call(row);
    return call.length;
  }).join(','), '2,1', 'and the dispatcher each round got answers for its own element');
  const held = [];
  for (const { at } of [[1, 2], [3, 4]]) held.push(row => at.call(row, -1));
  assert.same(held.length, 2, 'both iterations made their own closure');
  assert.same(held.map((call, index) => call([[10, 20], [30, 40]][index])).join(','), '20,40',
    'and the relocated const still binds per iteration');
  let value;
  for (const { name } of [{ name: [7, 8] }]) value = name.at(-1);
  assert.same(value, 8, 'a data key keeps its own binding type through the loop');
});

// a DEFAULT on the slot is CARRIED, not mirrored: the twin folds both arms off one read, so the
// claim is polyfilled on the arm that actually runs. the LIVE arm is what a mirror of the default
// alone left raw, and an effectful default proves the call still runs only where the source runs it
QUnit.test('destructuring: a slot default folds instead of mirroring', assert => {
  const src = { y: [1, [2]] };
  const spare = [3];
  const { y: { at, flat } = spare } = src;
  assert.same(at.call([4, 5], -1), 5, 'the live arm answers through the dispatcher');
  assert.same(flat.call([1, [2]]).length, 2, 'and so does its sibling, off the same read');
  const absent = {};
  const { y: { at: at2 } = spare } = absent;
  assert.same(at2.call([6, 7], 0), 6, 'the default arm answers too');
  let calls = 0;
  function raise() {
    calls += 1;
    return [3];
  }
  const { y: { at: at3 } = raise() } = src;
  assert.same(typeof at3, 'function', 'an effectful default still yields its claim');
  assert.same(calls, 0, 'and its call did not run while the slot was defined');
});

// a wrapper standing under a KEY is one descent step further into the init literal, so the claim
// reads the hop the source reads - a descent that dropped a step would read the holder instead.
// the effectful-neighbour row is the order boundary: the literal builds before it destructures
QUnit.test('destructuring: a claim under a keyed wrapper reads its own hop', assert => {
  const nb = { y: [1, [2]] };
  const { pair: [{ y: { flat } }] } = { pair: [nb] };
  assert.same(typeof flat, 'function', 'the claim resolves through the keyed step');
  assert.same(flat.call([1, [2]]).length, 2, 'and its dispatcher answers for the hop value');
  const log = [];
  const { pair: [{ y: { flat: raw } }], zn } = { pair: [nb], zn: log.push('n') };
  assert.same(zn, 1, 'a neighbour key keeps its own value');
  assert.same(log.join(','), 'n', 'its effect ran exactly once');
  assert.same(raw === undefined || typeof raw === 'function', true,
    'and the claim beside it binds whatever the engine holds - that row stays native by design');
});

// an ASSIGNMENT host binds no declaration for a positional claim's minted name, but a hoisted `var`
// is a binding site all the same: the statement keeps its own iteration and the claim's binding takes
// the dispatcher's answer right after it - source order across several claims included
QUnit.test('destructuring: a positional claim on an assignment host extracts', assert => {
  const rows = [[1, 2], [3]];
  let at, inc;
  [{ at }, { includes: inc }] = rows;
  assert.same(at.call([4, 5], -1), 5, 'the first claim answers through its own element');
  assert.same(inc.call([3], 3), true, 'and so does the second');
  const log = [];
  let neighbour;
  [{ at }, neighbour] = (log.push('once'), rows);
  assert.same(at.call([8, 9], 0), 8, 'a re-run binds the element again');
  assert.same(neighbour.length, 1, 'the residual still binds its own neighbour');
  assert.same(log.join(','), 'once', 'and the right ran exactly once');
});

// a claim carrying its OWN default inside a relocated loop head: the guard's test ref folds into the
// relocated declaration, so that declaration cannot be `const` - the head keeps the kind instead
QUnit.test('destructuring: a defaulted claim in a loop head keeps both arms', assert => {
  function fallback() {
    return 'fb';
  }
  const seen = [];
  for (const { at = fallback } of [[1, 2], {}]) seen.push(typeof at === 'function' ? at.name || 'dispatched' : typeof at);
  assert.same(seen.length, 2, 'both iterations bound the claim');
  let last;
  for (const { at = fallback } of [{}]) last = at;
  assert.same(last, fallback, 'the default arm wins where the slot is absent');
  let live;
  for (const { at = fallback } of [[3, 4]]) live = at;
  assert.same(live.call([5, 6], -1), 6, 'and the live arm answers through its dispatcher');
});

// a DEFAULTED leaf in an assignment host: the guard decides off the dispatcher's own answer, and
// a PATTERN default becomes the extraction's target rather than a slot the mirror fills. the last
// row is the composition - a typed outer hop feeds the leaf dispatch, so the source's default
// fires exactly where the source fires it, never on the arm the ponyfill answers
QUnit.test('destructuring: a defaulted leaf on an assignment host keeps both arms', assert => {
  let at, first, rest, sibling, viaHop, viaStatic;
  ({ at = 'fb' } = [1, 2]);
  assert.same(at.call([4, 5], -1), 5, 'the live arm answers through its dispatcher');
  ({ at = 'fb' } = {});
  assert.same(at, 'fb', 'and the default arm wins where the slot is absent');
  ({ at: { length: first } = { length: 'none' } } = [1, 2]);
  assert.same(typeof first, 'number', 'a pattern default destructures the dispatcher result');
  ({ at: { length: first } = { length: 'none' } } = {});
  assert.same(first, 'none', 'and the default itself where the slot is absent');
  ({ at: { 0: sibling, ...rest } = ['none'] } = {});
  assert.same(sibling, 'none', 'a rest in that pattern binds beside its named leaf');
  assert.same(Object.keys(rest).length, 0, 'and collects what the leaf left');
  ({ at: { 0: sibling } = ['none'] } = [1, 2]);
  assert.same(typeof sibling, 'undefined', 'the live arm reads that same slot off the dispatcher result');
  ({ flat: { at: viaHop } = [] } = [[1], [2]]);
  assert.same(typeof viaHop, 'undefined', 'the composed step reads off the hop dispatch, not off a mirror');
  ({ flat: { at: viaHop } = [] } = {});
  assert.same(typeof viaHop, 'function', 'and its default arm still reaches a dispatcher of its own');
  ({ from: { name: viaStatic } = {} } = Array);
  assert.same(typeof viaStatic, 'string', 'and a static outer hop composes the same two steps');
  ({ fromEntries: { name: viaStatic } = {} } = Object);
  assert.same(viaStatic, 'fromEntries', 'and the step carries that static own identity, not the default');
});

// an assignment DISCARDED as a non-tail sequence element: nobody reads what it yields, so the claim
// is served there exactly as in statement position - but the rewrite owns the ELEMENT, not the
// statement, so everything the sequence holds after it must survive, effects and value alike
QUnit.test('destructuring: a claim in a discarded sequence element keeps the tail', assert => {
  const log = [];
  const src = [1, 2];
  let at, from, rest, kept;
  const tail = ({ at } = src, 'tail');
  assert.same(tail, 'tail', 'the sequence still yields its own tail');
  assert.same(at.call([4, 5], -1), 5, 'and the claim binds through its dispatcher');
  const tail2 = ({ from } = Array, log.push('after'), 'second');
  assert.same(tail2, 'second', 'a longer sequence keeps every element after the claim');
  assert.same(log.join(','), 'after', 'including the effects they carry');
  assert.same(typeof from, 'function', 'and the static claim binds beside them');
  const tail3 = ({ at: kept, ...rest } = src, 'third');
  assert.same(tail3, 'third', 'a rest sibling keeps the tail too');
  assert.same(kept.call([7, 8], 0), 7, 'the consumed key binds through its dispatcher');
  assert.same(Object.keys(rest).length, src.length, 'and the rest still collects what it excluded');
});

// a REST sibling on an assignment host re-reads the receiver past the renamed key, so a receiver
// nothing can re-read is memoized: both readers take the one identity, and an observable receiver
// evaluates exactly once
QUnit.test('destructuring: a rest sibling on an assignment host shares one receiver read', assert => {
  const log = [];
  let at, rest;
  ({ at, ...rest } = [1, 2]);
  assert.same(at.call([4, 5], -1), 5, 'the claim binds through its dispatcher');
  assert.same(Object.keys(rest).length, 2, 'and the rest collects what the renamed key excluded');
  function mk() {
    log.push('recv');
    return [7, 8, 9];
  }
  ({ at, ...rest } = mk());
  assert.same(log.join(','), 'recv', 'an observable receiver evaluates exactly once');
  assert.same(at.call([1, 2], 0), 1, 'the claim still binds through its dispatcher');
  assert.same(Object.keys(rest).length, 3, 'and the rest reads the same value the claim did');
});

// a claim INSIDE the receiver of a destructure survives the consume: the receiver is spelled once,
// its own step still dispatches, and the effect it carries runs exactly once
QUnit.test('destructuring: a claim inside the receiver keeps its own step', assert => {
  const log = [];
  function rows() {
    log.push('rows');
    return [1, [2]];
  }
  let at, viaDefault;
  ({ at } = rows().flat());
  assert.same(typeof at, 'function', 'the outer claim binds through its dispatcher');
  assert.same(log.join(','), 'rows', 'and the receiver evaluated exactly once');
  ({ at: { 0: viaDefault } = rows().flat() } = {});
  assert.same(viaDefault, 1, 'a claim inside the slot default answers too');
  assert.same(log.join(','), 'rows,rows', 'and its receiver ran only where the default fired');
  ({ at: { 0: viaDefault } = rows().flat() } = [7, 8]);
  assert.same(typeof viaDefault, 'undefined', 'where the slot is present the default never runs');
  assert.same(log.join(','), 'rows,rows', 'so its receiver did not run a third time');
  ({ at } = [9, 10]);
  assert.same(at.call([4, 5], -1), 5, 'and a re-run binds the claim again');
});

// an EFFECT-bearing slot of a nested receiver: the residual that would have re-read it is dropped,
// so the dispatch is the only read - the effect runs exactly once, as the source runs it
QUnit.test('destructuring: a nested effectful slot is read exactly once', assert => {
  const log = [];
  function rows() {
    log.push('rows');
    return [1, [2]];
  }
  const { y: { at } } = { y: rows().flat() };
  assert.same(typeof at, 'function', 'the leaf binds through its dispatcher');
  assert.same(log.join(','), 'rows', 'and the slot evaluated exactly once');
  const { y: { at: beside } } = { z: 1, y: rows().flat() };
  assert.same(typeof beside, 'function', 'an effect-free neighbour slot changes nothing');
  assert.same(log.join(','), 'rows,rows', 'and it still evaluates once per statement');
});

// the ASSIGNMENT host asks that same question of its OWN residual: the dispatch spells the slot only
// where the host dies with it, and every shape that keeps a reader alive stands down instead
QUnit.test('destructuring: an assigned effectful slot is read exactly once', assert => {
  const log = [];
  function rows() {
    log.push('rows');
    return [1, [2]];
  }
  let at, kept;
  ({ y: { at } } = { y: rows().flat() });
  assert.same(typeof at, 'function', 'the leaf binds through its dispatcher');
  assert.same(log.join(','), 'rows', 'and the slot evaluated exactly once');
  [{ y: { at } }] = [{ y: rows().flat() }];
  assert.same(typeof at, 'function', 'an array wrapper around that host binds too');
  assert.same(log.join(','), 'rows,rows', 'and its element evaluated exactly once');
  if (log) ({ y: { at } } = { y: rows().flat() });
  assert.same(typeof at, 'function', 'a bodyless control slot hosts the dispatch');
  assert.same(log.join(','), 'rows,rows,rows', 'and evaluates its slot exactly once');
  // the shapes that KEEP a reader decline the dispatch, so what their leaf binds is whatever the
  // realm has - asserted by the effect COUNT and the sibling values, never by the method's presence
  ({ y: { at }, o: kept } = { y: rows().flat(), o: 7 });
  const viaSibling = typeof at;
  assert.same(kept, 7, 'a surviving sibling keeps the destructure');
  assert.same(log.join(','), 'rows,rows,rows,rows', 'and its slot still evaluates once');
  ({ y: { at, length: kept } } = { y: rows().flat() });
  const viaKey = typeof at;
  assert.same(kept, 2, 'a sibling KEY off the same receiver keeps it too');
  assert.same(log.join(','), 'rows,rows,rows,rows,rows', 'read exactly once');
  ({ y: { at }, z: kept } = { y: rows().flat(), z: rows().flat() });
  assert.same(kept.length, 2, 'a second effect-bearing part binds natively');
  assert.same(log.join(','), 'rows,rows,rows,rows,rows,rows,rows', 'and both parts ran once each');
  assert.same(viaSibling, viaKey, 'the declined shapes all bind the same raw read');
  assert.same(viaKey, typeof at, 'whatever the realm holds for it');
});

// a DECLARATION host reads its receiver once whatever keeps the declaration alive: a consumed
// declarator splits off beside its siblings, a sole wrapper takes the element whole, and a wrapper
// whose neighbour still binds empties this element while its own read hoists to the source slot
QUnit.test('destructuring: a declared observable receiver is read exactly once', assert => {
  const log = [];
  function rows() {
    log.push('y');
    return [1, [2]];
  }
  const { y: { at: sibling } } = { y: rows() },
        siblingZ = 1;
  assert.same(typeof sibling, 'function', 'a consumed declarator beside a sibling binds');
  assert.same(siblingZ, 1, 'and the sibling keeps its own binding');
  assert.same(log.join(','), 'y', 'off a receiver read exactly once');
  // the ARRAY-WRAPPED hosts read the SLOT, not the element: a sole one takes it whole, and one whose
  // neighbour still binds memoizes it - so both bind through the dispatcher whatever the realm holds
  const [{ y: { at: sole } }] = [{ y: rows() }];
  assert.same(typeof sole, 'function', 'a sole array wrapper binds through its dispatcher');
  assert.same(log.join(','), 'y,y', 'reading its element exactly once');
  const [{ y: { at: neighbour } }, neighbourZ] = [{ y: rows() }, rows()];
  assert.same(typeof neighbour, 'function', 'a bound neighbour changes neither leaf');
  assert.same(neighbourZ.length, 2, 'and binds what the source gives it');
  assert.same(log.join(','), 'y,y,y,y', 'each element read exactly once, in source order');
  const [{ at: shared, ...rest }] = [rows().slice()];
  assert.same(typeof shared, 'function', 'a receiver carrying a claim of its own dispatches');
  assert.same(Object.keys(rest).length, 2, 'and the rest reads the same value the claim did');
  assert.same(log.join(','), 'y,y,y,y,y', 'off one evaluation, not two');
});

// a DECLARATION array wrapper whose element cannot be spelled twice memoizes it: the residual keeps
// the element slot, so without the memo the dispatch beside it evaluated that element a second time
QUnit.test('destructuring: a wrapped opaque element is read exactly once', assert => {
  const log = [];
  function rows() {
    log.push('rows');
    return [1, [2]];
  }
  const [{ at: sole }] = [rows()];
  assert.same(typeof sole, 'function', 'a sole prop binds through its dispatcher');
  assert.same(log.join(','), 'rows', 'off one evaluation of the element');
  const [{ at: defaulted = null }] = [rows()];
  assert.same(typeof defaulted, 'function', 'a defaulted leaf takes the same memo');
  assert.same(log.join(','), 'rows,rows', 'and still reads its element once');
  const [{ at: ahead }] = [rows()],
        pureTail = 1;
  assert.same(typeof ahead, 'function', 'a pure trailing declarator is no obstacle');
  assert.same(pureTail, 1, 'and keeps its own binding');
  assert.same(log.join(','), 'rows,rows,rows', 'the element still read once');
  const order = [];
  function first() {
    order.push('first');
    return [1, [2]];
  }
  function second() {
    order.push('second');
    return [1, [2]];
  }
  const [{ at: a1 }] = [first()],
        [{ at: a2 }] = [second()];
  assert.same(typeof a1, typeof a2, 'two claimed declarators both bind');
  assert.same(order.join(','), 'first,second', 'each element evaluated once, in source order');
});

// the FLAT wrapper of an assignment host is the same question one literal in: its element is spelled
// by the dispatch, so the dead residual must not re-emit the array beside it
QUnit.test('destructuring: a wrapped effectful element is read exactly once', assert => {
  const log = [];
  function rows() {
    log.push('rows');
    return [1, [2]];
  }
  let at, mate;
  [{ at }] = [rows().flat()];
  assert.same(typeof at, 'function', 'the sole element binds through its dispatcher');
  assert.same(log.join(','), 'rows', 'and evaluated exactly once');
  [{ at: mate }] = [rows().flat()];
  assert.same(typeof mate, typeof at, 'a re-run answers the same');
  assert.same(log.join(','), 'rows,rows', 'and evaluates its element once again');
  [{ at }, { at: mate }] = [rows().flat(), rows().flat()];
  assert.same(typeof at, typeof mate, 'a MULTI wrapper answers both elements alike');
  assert.same(log.join(','), 'rows,rows,rows,rows', 'and evaluates each of them exactly once');
});

// a NESTED claim under that wrapper reads its slot once too: where this leaf is the wrapper's only
// binding the residual dies and the dispatch performs the slot's read, and where a reader survives
// it - a rest, a sibling prop, a key carrying an effect - the slot memoizes so both share one read
QUnit.test('destructuring: a nested wrapper slot is read exactly once', assert => {
  const log = [];
  function rows() {
    log.push('rows');
    return [1, [2]];
  }
  const [{ y: { at: sole } }] = [{ y: rows() }];
  assert.same(typeof sole, 'function', 'a sole binding takes the slot whole');
  assert.same(log.join(','), 'rows', 'evaluating it exactly once');
  const [{ y: { at: kept, ...other } }] = [{ y: rows() }];
  assert.same(typeof kept, typeof sole, 'a surviving rest answers the same');
  assert.same(typeof other, 'object', 'and still gathers what the pattern does not name');
  assert.same(log.join(','), 'rows,rows', 'off one evaluation, not two');
  const [{ y: { at: beside }, wz }] = [{ y: rows(), wz: 7 }];
  assert.same(typeof beside, typeof sole, 'a sibling prop keeps the residual');
  assert.same(wz, 7, 'and binds beside the claim');
  assert.same(log.join(','), 'rows,rows,rows', 'the slot still read once');
  const keys = [];
  const [{ y: { [(keys.push('key'), 'at')]: viaKey } }] = [{ y: rows() }];
  assert.same(typeof viaKey, typeof sole, 'an effectful key names the claim all the same');
  assert.same(keys.join(','), 'key', 'and runs where the source wrote it, exactly once');
  assert.same(log.join(','), 'rows,rows,rows,rows', 'off one read of the slot');
});

// a REST above the hop keeps the hop's key in the pattern - the key IS the read - so what leaves is
// the hop's VALUE, renamed to the binding the dispatch reads. the array WRAPPER is that same host
// one literal out, pairing the element this pattern stands on. the read COUNT is held by the fixture
// and the generated corpus: counting it here needs an accessor, which the polyfill baseline forbids
QUnit.test('destructuring: a rest above the hop renames the hop, not the read', assert => {
  const holder = {
    keep: 1,
    y: [1, [2]],
  };
  const { y: { at: flat }, ...flatRest } = holder;
  assert.same(typeof flat, 'function', 'the flat host binds through its dispatcher');
  assert.same(flatRest.keep, 1, 'the rest still gathers what the pattern does not name');
  assert.same('y' in flatRest, false, 'and the renamed hop stays excluded from it');
  const [{ y: { at: wrapped }, ...wrapRest }] = [holder];
  assert.same(typeof wrapped, typeof flat, 'the array wrapper answers the same');
  assert.same(wrapRest.keep, 1, 'gathering the same way');
  assert.same('y' in wrapRest, false, 'and excluding the hop just as surely');
  const [lead, { y: { at: second }, ...secondRest }] = [7, holder];
  assert.same(lead, 7, 'a leading element keeps its own binding');
  assert.same(typeof second, typeof flat, 'and the pattern pairs the element it stands on');
  assert.same(secondRest.keep, 1, 'whose rest gathers off that element');
});

// under a wrapper the flatten writes the hop read INTO the element, which moves it to where the
// literal builds - so where an effect stands between (a neighbour element, a declarator ahead), the
// twin trails the residual instead and the read keeps the place the source gave it
QUnit.test('destructuring: a wrapper twin trails what runs before its read', assert => {
  const log = [];
  const holder = {
    keep: 1,
    y: [1, [2]],
  };
  function mark(name) {
    log.push(name);
    return log.length;
  }
  const [{ y: { at: beside, findLast: besideLast } }, zn] = [holder, mark('neighbour')];
  assert.same(typeof beside, 'function', 'both claims bind through their dispatchers');
  assert.same(typeof besideLast, 'function', 'off the one slot they share');
  assert.same(zn, 1, 'and the neighbour keeps its own binding');
  assert.same(log.join(','), 'neighbour', 'having run where the source runs it');
  const zLead = mark('lead'),
        [{ y: { at: after, findLast: afterLast } }] = [holder];
  assert.same(zLead, 2, 'a declarator ahead runs before the literal');
  assert.same(typeof after, typeof beside, 'and the claims behind it bind the same');
  assert.same(typeof afterLast, typeof besideLast, 'both of them');
  assert.same(log.join(','), 'neighbour,lead', 'with nothing reordered around it');
});

// an emptied element at the END of a wrapper sheds: the position needs no holding there, and an
// array pattern whose last element binds nothing is a shape the downstream destructuring lowering
// miscompiles - it drops an earlier element's binding, which this bundle's own lowering would show
QUnit.test('destructuring: an emptied trailing element sheds from the wrapper', assert => {
  const rows = [1, [2]];
  const holder = { other: 7 };
  const [{ other }, { at: claimed }] = [holder, rows];
  assert.same(other, 7, 'the surviving binding still binds');
  assert.same(typeof claimed, 'function', 'beside the claim that emptied its own element');
  const [{ at: leading }, { keep }] = [rows, { keep: 9 }];
  assert.same(typeof leading, typeof claimed, 'and an emptied LEADING element answers the same');
  assert.same(keep, 9, 'with the element behind it binding as written');
});

// the wrappers a source spells around an init are erased at runtime, so what they hold performs
// exactly the effects they do - a claim inside must read through them. a SEQUENCE is not one of
// those: its prefix is an effect the receiver never spells, so the residual stays to perform it
QUnit.test('destructuring: a carried init reads through its wrappers', assert => {
  const log = [];
  function rows() {
    log.push('rows');
    return [1, [2]];
  }
  function lead() {
    log.push('lead');
    return 0;
  }
  // eslint-disable-next-line @stylistic/no-extra-parens -- the parens ARE what this locks
  const { y: { at: viaParenSlot } } = { y: (rows()) };
  assert.same(typeof viaParenSlot, 'function', 'a parenthesised slot binds through its dispatcher');
  assert.same(log.join(','), 'rows', 'reading it exactly once');
  // eslint-disable-next-line @stylistic/no-extra-parens -- same, one level out
  const { y: { at: viaParenInit } } = ({ y: rows() });
  assert.same(typeof viaParenInit, typeof viaParenSlot, 'and so does a parenthesised init');
  assert.same(log.join(','), 'rows,rows', 'off one read again');
  // eslint-disable-next-line @stylistic/no-extra-parens -- same, on the wrapper's element
  const [{ y: { at: viaParenElement } }] = [({ y: rows() })];
  assert.same(typeof viaParenElement, typeof viaParenSlot, 'the wrapper host answers the same');
  assert.same(log.join(','), 'rows,rows,rows', 'still one read each');
  // ... and a SEQUENCE prefix keeps the claim native on both legs - what this locks is the effect
  // ORDER, which is the invariant the peel must not disturb: the prefix runs first, the slot once
  const { y: { at: viaSeqPrefix } } = (lead(), { y: rows() });
  assert.same(log.join(','), 'rows,rows,rows,lead,rows', 'the prefix runs once, before the slot');
  assert.same(viaSeqPrefix === undefined || typeof viaSeqPrefix === 'function', true,
    'and the leaf binds what the realm holds for it');
});

// a for-x HEAD is not a statement list, so extracting a claim out of it relocates what the pattern
// still binds into the loop body. the record left on the head names the minted iteration variable,
// and a type read off it answers the ITERATED element: an object rest resolved as an Array folds a
// presence test and hands a plain object to the array-specific helper, which throws where the
// polyfill is the only implementation
QUnit.test('destructuring: a for-x head binds what the head no longer holds', assert => {
  const rows = Object.assign([1, [2]], { extra: 7 });
  const nested = [{ y: rows }];
  for (const { at, ...rest } of [rows]) {
    assert.same(typeof at, 'function', 'the claim binds from the iterated element');
    assert.same('at' in rest, false, 'and the rest it left behind is a plain object');
    assert.same(rest.extra, 7, 'holding what the pattern did not name');
    assert.same(rest.at, undefined, 'with no instance method of the element it came from');
  }
  for (const [{ y: { at, ...rest } }] of [nested]) {
    assert.same(typeof at, 'function', 'the same one hop in, through a renamed element');
    assert.same('at' in rest, false, 'the nested rest is a plain object too');
    assert.same(rest.extra, 7, 'holding the same keys');
  }
  for (const { at, ...rest } of [rows]) assert.same('at' in rest, false, 'a bodyless head answers the same');
  const keys = [];
  for (const { at, ...rest } in { a: 1 }) {
    keys.push(typeof at, 'at' in rest);
  }
  assert.same(keys.join(','), 'function,false', 'and a for-in head destructures the KEY it iterates');
});

// an ARRAY-WRAPPED pattern over a BINDING receiver reaches its claim by renaming the element to a
// minted name; what the pattern binds beside the claim rides the residual, which reads that same
// name. the pairing routes have no literal element to walk to here, so this is the only shape that
// reaches the claim at all - and everything the source bound has to survive it
QUnit.test('destructuring: a renamed element keeps what its pattern bound beside the claim', assert => {
  const rows = Object.assign([1, [2]], { extra: 7 });
  const holder = { y: rows, keep: 3 };
  const pair = [holder];
  const [{ y: { at, ...rest } }] = pair;
  assert.same(typeof at, 'function', 'the claim binds off the renamed element');
  assert.same(rest.extra, 7, 'and the rest gathers what the pattern did not name');
  assert.same('at' in rest, false, 'excluding the claim key exactly as the source did');
  const [{ y: { flat, extra } }] = pair;
  assert.same(typeof flat, 'function', 'a NAMED sibling rides the same residual');
  assert.same(extra, 7, 'binding what it bound');
  const [{ y: { concat }, keep }] = pair;
  assert.same(typeof concat, 'function', 'a sibling one level OUT rides it too');
  assert.same(keep, 3, 'with its own value');
  const [{ y: { findLast, extra: extra2, 0: first } }] = pair;
  assert.same(typeof findLast, 'function', 'two siblings, one keyed numerically');
  assert.same(extra2, 7, 'the named one binds');
  assert.same(first, 1, 'and the numeric one reads its slot');
  // a sibling one level OUT reads the value ITS level reads, and stays where the source's nesting
  // put it: before the hop when it stands before it, after the inner level when it stands after
  const order = [];
  const nested = Object.defineProperties({}, {
    lead: { get() {
      order.push('lead');
      return 5;
    }, enumerable: true },
    y: { get() {
      order.push('y');
      return Object.assign([1, [2]], { extra: 7 });
    }, enumerable: true },
    top: { get() {
      order.push('top');
      return 4;
    }, enumerable: true },
  });
  const nestedPair = [nested];
  const [{ lead, y: { flat: viaOuter, extra: extra5 }, top }] = nestedPair;
  assert.same(typeof viaOuter, 'function', 'the claim binds through the hop');
  assert.same([lead, extra5, top].join(','), '5,7,4', 'every sibling binds what it bound');
  assert.same(order.join(','), 'lead,y,top', 'and each level is read where the source reads it');
  // the hop between the element and the claim is read ONCE: the dispatch and the residual take the
  // same memo of it, where re-emitting the element pattern would run this getter a second time
  const log = [];
  const source = {};
  Object.defineProperty(source, 'y', {
    get() {
      log.push('y');
      return Object.assign([1, [2]], { extra: 7 });
    },
  });
  const gettered = [source];
  const [{ y: { flat: viaGetter, extra: extra4 } }] = gettered;
  assert.same(typeof viaGetter, 'function', 'the claim binds through the hop');
  assert.same(extra4, 7, 'the sibling binds off the same read');
  assert.same(log.length, 1, 'and the getter ran exactly once');
});

// a binding that may hold a KNOWN CONSTRUCTOR is clouded: which object it holds decides which
// STATICS exist, so that surface belongs to the guard. an INSTANCE claim asks nothing of it - the
// read lands on whatever the value turned out to be - and both spellings of it must agree
QUnit.test('destructuring: a clouded binding still dispatches its instance claims', assert => {
  const seen = [];
  for (const ctor of [Array]) {
    const { name } = ctor;
    const { at } = ctor;
    const { from } = ctor;
    seen.push(name, typeof at, typeof from, ctor.name);
  }
  assert.same(seen[0], 'Array', 'the instance claim reads the value the binding holds');
  assert.same(seen[1], 'undefined', 'a method the value does not carry stays absent');
  assert.same(seen[2], 'function', 'while the static surface keeps its guarded answer');
  assert.same(seen[3], seen[0], 'and the member spelling of the same read agrees');
  const box = { at: 1, name: 'box' };
  for (const held of [box]) {
    const { name: heldName } = held;
    assert.same(heldName, 'box', 'a value that is NOT the constructor reads its own slot');
  }
});

// the hop normalization replaces the HOST pattern with the leaf, so a sibling beside the hop would
// go with it - the binding the source wrote, gone, and the code reads a name nothing declares. the
// wrapped spelling asks the rule of the ELEMENT that pairs with the literal
QUnit.test('destructuring: a wrapped host keeps what it binds beside the hop', assert => {
  const order = [];
  const nested = Object.defineProperties({}, {
    lead: { get() {
      order.push('lead');
      return 5;
    }, enumerable: true },
    y: { get() {
      order.push('y');
      return Object.assign([1, [2]], { extra: 7 });
    }, enumerable: true },
    top: { get() {
      order.push('top');
      return 4;
    }, enumerable: true },
  });
  // the claim itself is DECLINED here - that is the price of the rule, and what must survive is
  // every binding the source wrote, in the order the source reads them
  const [{ lead, y: { flat, extra }, top }] = [nested];
  assert.same([lead, extra, top].join(','), '5,7,4', 'everything beside the hop still binds');
  assert.same(typeof flat === 'function' || flat === undefined, true, 'the claim binds what the realm holds');
  assert.same(order.join(','), 'lead,y,top', 'each read where the source reads it');
  const [{ y: { flat: flatA }, top: topA }] = [nested];
  assert.same(topA, 4, 'a sibling after the hop alone');
  const [{ lead: leadB, y: { flat: flatB } }] = [nested];
  assert.same(leadB, 5, 'and one before it alone');
  assert.same(typeof flatB, typeof flatA, 'both spellings answer the same for the claim');
});

// a binding that MAY be a constructor takes the identity guard, and a pattern reading several of its
// statics splits into one read per prop - each guarded, all in source order. what the split must not
// disturb is what the pattern bound and when each slot was read
QUnit.test('destructuring: several statics off a guarded binding each take their guard', assert => {
  let M = globalThis.Array;
  if (!M) M = Array;
  const { from, of } = M;
  assert.same([typeof from, typeof of].join(','), 'function,function', 'both statics bind');
  assert.same(from([1, 2]).length, 2, 'and the first one works');
  assert.same(of(7, 8).length, 2, 'and so does the second');
  const { of: of2, from: from2 } = M;
  assert.same([typeof of2, typeof from2].join(','), 'function,function', 'order in the pattern decides nothing');
  // a prop the plan cannot answer keeps the WHOLE pattern - the negative the split is gated on. the
  // claim is then DECLINED, so `from3` holds what the realm holds, exactly as the source's own read
  // would: what the decline owes is the bindings, not the polyfill
  const { from: from3, isArray } = M;
  assert.same(typeof isArray, 'function', 'a mixed pattern still binds its unclaimed props');
  assert.same(from3 === undefined || typeof from3 === 'function', true, 'and the claim binds the raw slot');
  // source order of the reads, where the slots can observe it
  const order = [];
  const probe = Object.defineProperties({}, {
    from: { get() {
      order.push('from');
      return 1;
    }, enumerable: true },
    of: { get() {
      order.push('of');
      return 2;
    }, enumerable: true },
  });
  const { from: p1, of: p2 } = probe;
  assert.same([p1, p2].join(','), '1,2', 'a non-constructor receiver binds its own slots');
  assert.same(order.join(','), 'from,of', 'read in the order the pattern spells');
});

// a for-x HEAD hosts no statement, but the loop it heads has a BODY - and the claim reads its entry
// there rather than riding the slot's own default. the difference is observable: a default fires on
// `undefined` alone, so a native core-js REPLACES would be kept, while the entry is core-js's own
QUnit.test('destructuring: a head-hosted claim reads its entry, not the raw slot', assert => {
  // the invariant that holds in every realm, stripped or not: the head answers exactly as the
  // declarator host does for the same source
  let viaHead;
  for (const { Array: { from } } of [globalThis]) viaHead = from;
  const { Array: { from: viaDeclarator } } = globalThis;
  assert.same(typeof viaHead, 'function', 'the head binds the claim');
  assert.same(viaHead, viaDeclarator, 'and binds exactly what the declarator host binds');
  assert.same(viaHead([1, 2]).length, 2, 'and the binding works');
  // the head goes on reading what the source read, and everything beside the claim still binds
  const seen = [];
  for (const { Array: { of } } of [globalThis]) seen.push(typeof of);
  assert.same(seen.join(','), 'function', 'a bodyless head braces and keeps its claim');
});

// a REST beside a guarded read cannot become a read of its own, so it stays behind them reading the
// same receiver - and what it gathers has to be exactly what the source left it
QUnit.test('destructuring: a guarded read keeps its rest sibling', assert => {
  let M = globalThis.Array;
  if (!M) M = Array;
  const { from, ...rest } = M;
  assert.same(typeof from, 'function', 'the guarded read binds its polyfill');
  assert.same(from([1, 2]).length, 2, 'and the binding works');
  assert.same('from' in rest, false, 'and the rest no longer carries the key the read consumed');
  // ... and every key the read did NOT consume is still there
  let box = { from: 'mine', keep: 7 };
  if (!box) box = Array;
  const { from: viaUser, ...userRest } = box;
  assert.same(viaUser, 'mine', 'a value that is not the constructor keeps its own');
  assert.same(userRest.keep, 7, 'and the rest still gathers the untouched keys');
});

// a FLAT head reads its statics off the element the same way a nested one does, whatever kind the
// head declares - a `var` one hoists its binding out of the loop and still answers there
QUnit.test('destructuring: a flat loop head reads its statics off the element', assert => {
  /* eslint-disable no-var, prefer-const, block-scoped-var -- the head KIND is the axis under test, and
     the hoisted read past the loop is what a `var` head owes */
  const seen = [];
  for (var { from } of [Array]) seen.push(typeof from);
  for (let { from: viaLet } of [Array]) seen.push(typeof viaLet);
  for (const { from: viaConst, of: viaOf } of [Array]) seen.push(typeof viaConst, typeof viaOf);
  assert.same(seen.join(','), 'function,function,function,function', 'every kind binds the claim');
  assert.same(from(['a', 'b']).length, 2, 'and the hoisted binding still works past the loop');
  // an element that is NOT the global keeps its own value - the polyfill answers for the global's
  function mine() { return 'mine'; }
  let ownValue;
  for (var { from: each } of [{ from: mine }]) ownValue = each;
  /* eslint-enable no-var, prefer-const, block-scoped-var -- back to the suite's own rules */
  assert.same(ownValue, mine, 'a user object keeps what it holds');
});

// a head over a MULTI-element literal binds a different element per pass, so the answer has to
// travel with each element rather than with the loop: the passes share nothing but the pattern
QUnit.test('destructuring: a head over several elements answers on every pass', assert => {
  const both = [];
  for (const { Array: { from } } of [globalThis, globalThis]) both.push(typeof from, from([1, 2]).length);
  assert.same(both.join(','), 'function,2,function,2', 'both passes bind the claim');
  // a sibling the polyfill does not own reads through the element it belongs to, on every pass
  const sides = [];
  for (const { Array: { of }, JSON: J } of [globalThis, globalThis]) sides.push(typeof of, typeof J.stringify);
  assert.same(sides.join(','), 'function,function,function,function', 'the sibling rides along on both');
  // an element that is not a global holds a value of its own, and the head goes on reading it -
  // the polyfill would answer for a value that was never the global's
  function marker() { return 'mine'; }
  let ownValue;
  for (const { Array: { fromAsync } } of [globalThis, { Array: { fromAsync: marker } }]) ownValue = fromAsync;
  assert.same(ownValue, marker, 'a non-proxy element keeps its own value');
});

// a pattern-bound name holds a SLOT of its init, never the init itself: `{ f } = maker` binds
// `maker.f` (undefined), and calling it must keep the native TypeError - following the container
// inlined the factory as the callee and substituted a working static where the source throws
QUnit.test('destructuring: a missing key stays undefined, its call still throws', assert => {
  // eslint-disable-next-line unicorn/consistent-function-style -- the arrow-bound factory is the case under test
  const maker = () => Array;
  const { f } = maker;
  assert.same(f, undefined, 'the slot is genuinely absent');
  assert.throws(() => f().from([1]), TypeError, 'and the call throws like native');
});

// a const-bound ARRAY wrapper reached through a pattern slot still descends to its real value:
// `wrapper` holds `[globalThis]` via its own pattern pairing, so the nested claim resolves
QUnit.test('destructuring: a pattern-bound array wrapper still resolves its leaf', assert => {
  const [wrapper] = [[globalThis]];
  const [{ Array: { from } }] = wrapper;
  assert.deepEqual(from([3, 4]), [3, 4], 'the leaf claim answers through the wrapper alias');
});

// a spread at the wrapper alias's OWN declarator makes the slot's union incomplete - the value
// the runtime hands the slot comes out of the spread, not the lone enumerable candidate, so the
// follow must decline: resolving past it substituted the pure static over the user's own value
QUnit.test('destructuring: a spread-shifted pattern-bound wrapper keeps the user value', assert => {
  function marker() { return 'mine'; }
  const xs = [[{ Array: { from: marker } }]];
  const [wrapper] = [...xs, [globalThis]];
  const [{ Array: { from } }] = wrapper;
  assert.same(from, marker, 'the slot binds the spread element, not the candidate literal');
  assert.same(from(), 'mine', 'and calling it runs the user function');
});

// a wrapper alias whose slot union is a LONE DEFAULT declines the same way: the pairing is an
// over-approximation - the object spread hides the key the runtime actually pairs - so the
// default is not certain to fire, and following it substituted the static over the user's value
QUnit.test('destructuring: a defaulted pattern-bound wrapper keeps the paired user value', assert => {
  function marker() { return 'mine'; }
  const src = { wrapper: [{ Array: { from: marker } }] };
  const { wrapper = [globalThis] } = { ...src };
  const [{ Array: { from } }] = wrapper;
  assert.same(from, marker, 'the runtime pairs the spread key, not the default');
});

// the WRAPPED spellings of the wrapper alias hand the same runtime value as the bare one - a
// paren, a sequence tail - so the claim still answers through the polyfill in a stripped realm
QUnit.test('destructuring: wrapped spellings of a pattern-bound wrapper still resolve', assert => {
  let seq = 0;
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren spelling is the case under test
  const [parenInit] = ([[globalThis]]);
  const [{ Array: { from: viaParen } }] = parenInit;
  assert.deepEqual(viaParen([1, 2]), [1, 2], 'the paren-wrapped init resolves its leaf');
  const [seqInit] = (seq++, [[globalThis]]);
  const [{ Array: { from: viaSeq } }] = seqInit;
  assert.deepEqual(viaSeq([3]), [3], 'the sequence tail resolves its leaf');
  assert.same(seq, 1, 'the prefix effect ran exactly once, at the declaration');
});

// ... and a spread HIDDEN by the wrapper still makes the union incomplete: the value the runtime
// hands the slot comes out of the spread, and resolving past it substituted the static over it
QUnit.test('destructuring: a paren-wrapped spread-shifted wrapper keeps the user value', assert => {
  function marker() { return 'mine'; }
  const xs = [[{ Array: { from: marker } }]];
  // eslint-disable-next-line @stylistic/no-extra-parens -- the paren spelling is the case under test
  const [wrapper] = ([...xs, [globalThis]]);
  const [{ Array: { from } }] = wrapper;
  assert.same(from, marker, 'the paren hides nothing - the slot binds the spread element');
});

// a value resolved through an alias walk re-anchors in the alias's own declaration scope: a
// use-site shadow of a name the value reads must not capture it. the stripped realm is what
// makes the row non-vacuous - a lost claim leaves a raw read there. the write-RHS twin of this
// anchor is usage-global's alone (pure bails a reassigned alias by design) and lives in the
// usage-global fixture instead
QUnit.test('destructuring: alias values resolve where the alias lives, not at a shadowed use', assert => {
  // eslint-disable-next-line unicorn/consistent-function-style -- the arrow-bound factory is the case under test
  const factory = () => Array;
  // eslint-disable-next-line no-unused-vars -- the shadow parameter is the case under test
  function callSiteShadow(Array) {
    return factory().from([5, 6]);
  }
  assert.deepEqual(callSiteShadow('shadow'), [5, 6], 'an inline-callee return ignores the call-site shadow');
});
