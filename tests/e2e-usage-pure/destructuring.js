// Destructuring: const { method } = Constructor - ObjectPattern path in usagePure

// standalone-post transform leg: detection ran on the fully-lowered text, where class static
// fields are already `_createClass` + assignments - the last-wins container fold this test
// asserts never fires there, and the extraction keeps its native-faithful behavior (an
// unbound this-sensitive static throws). the fold itself stays locked by the other legs
import { withWindowWithoutSelf } from './window-without-self-host.js';

const testUnlessDetectLowered = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

const POST_LOWERED = typeof E2E_POST_LOWERED !== 'undefined';
const restArrayAt = POST_LOWERED ? Array.prototype.at : Object.getOwnPropertyDescriptor(Array.prototype, 'at')?.value;
const restArrayFlat = POST_LOWERED ? Array.prototype.flat : Object.getOwnPropertyDescriptor(Array.prototype, 'flat')?.value;
const restArrayIncludes = POST_LOWERED ? Array.prototype.includes : Object.getOwnPropertyDescriptor(Array.prototype, 'includes')?.value;
const restStringAt = POST_LOWERED ? String.prototype.at : Object.getOwnPropertyDescriptor(String.prototype, 'at')?.value;
const nativeMap = Object.getOwnPropertyDescriptor(globalThis, 'Map')?.value;
const restMapGroupBy = POST_LOWERED ? Map.groupBy : nativeMap && Object.getOwnPropertyDescriptor(nativeMap, 'groupBy')?.value;
// Read the native slot without turning the expectation into a polyfill claim.
const nativeArrayFrom = Object.getOwnPropertyDescriptor(Array, 'from')?.value;
const nativeArrayOf = Object.getOwnPropertyDescriptor(Array, 'of')?.value;
const nativeArrayIterator = Object.getOwnPropertyDescriptor(Array.prototype, Symbol.iterator)?.value;
const nativeObjectEntries = Object.getOwnPropertyDescriptor(Object, 'entries')?.value;

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

QUnit.test('destructuring: a guarded source rejects before nested static keys', assert => {
  const events = [];
  let result;
  try {
    const { Array: { [(events.push('key'), 'from')]: from }, Object: { keys } }
      // eslint-disable-next-line no-unsafe-optional-chaining -- rejection before the key is the observable
      = (events.push('source'), globalThis.window?.self);
    result = [from([7])[0], keys({ x: 1 })[0]];
  } catch (error) {
    result = error.name;
  }
  if (typeof window === 'undefined') {
    assert.same(result, 'TypeError');
    assert.deepEqual(events, ['source']);
  } else {
    assert.deepEqual(result, [7, 'x']);
    assert.deepEqual(events, ['source', 'key']);
  }
});

QUnit.test('destructuring: a guarded assignment rejects before nested static keys', assert => {
  const events = [];
  const pureFrom = Array.from;
  let from = 'old-from';
  let keys = 'old-keys';
  let result;
  try {
    ({ Array: { [(events.push('key'), 'from')]: from }, [(events.push('x'.at(0), from === pureFrom), 'Object')]: { keys } }
      // eslint-disable-next-line no-unsafe-optional-chaining -- rejection before the key is the observable
      = (events.push('source'), globalThis.window?.self));
    result = [from([7])[0], keys({ x: 1 })[0]];
  } catch (error) {
    result = error.name;
  }
  if (typeof window === 'undefined') {
    assert.same(result, 'TypeError');
    assert.deepEqual(events, ['source']);
    assert.same(from, 'old-from');
    assert.same(keys, 'old-keys');
  } else {
    assert.deepEqual(result, [7, 'x']);
    assert.deepEqual(events, ['source', 'key', 'x', true]);
  }
});

QUnit.test('destructuring: a nested static assignment precedes the next key error', assert => {
  const events = [];
  const pureFrom = Array.from;
  const failure = {};
  let from = 'old-from';
  let keys = 'old-keys';
  function nextKey() {
    events.push(from === pureFrom);
    throw failure;
  }
  try {
    ({ Array: { [(events.push('key'), 'from')]: from }, [(nextKey(), 'Object')]: { keys } } = globalThis);
  } catch (error) {
    assert.same(error, failure);
  }
  assert.same(from, pureFrom);
  assert.same(keys, 'old-keys');
  assert.deepEqual(events, ['key', true]);
});

QUnit.test('destructuring: a retained nested key keeps its own polyfills', assert => {
  const events = [];
  let from;
  let keys;
  let defaults = 0;
  /* eslint-disable prefer-const -- the assignment pattern is the subject */
  ({ Array: { [(events.push('first'), 'from')]: from },
    [(events.push('outer'), 'Object')]: {
      [(events.push('x'.at(0)), 'keys')]: keys = (defaults++, null),
    } } = globalThis);
  /* eslint-enable prefer-const -- end of the assignment-pattern control */
  assert.same(from([7])[0], 7);
  assert.deepEqual(keys({ x: 1 }), ['x']);
  assert.same(defaults, 0);
  assert.deepEqual(events, ['first', 'outer', 'x']);
});

QUnit.test('destructuring: native static targets keep their computed keys live', assert => {
  const events = [];
  const pureFrom = Array.from;
  const box = {};
  let from;
  let bind;
  let defaults = 0;
  ({ Array: { [(events.push('first'), 'from')]: from },
    Object: { keys: { [(events.push('x'.at(0)), 'bind')]: bind } } } = globalThis);
  assert.deepEqual(from([5]), [5]);
  assert.same(from, pureFrom);
  ({ Array: { [(events.push('second'), 'from')]: from },
    // eslint-disable-next-line no-sequences -- the computed assignment target sequence is the subject
    Object: { keys: box[events.push('y'.at(0)), 'value'] } } = globalThis);
  assert.deepEqual(from([6]), [6]);
  assert.same(from, pureFrom);
  ({ Array: { [(events.push('third'), 'from')]: from },
    // eslint-disable-next-line no-sequences -- the computed assignment target sequence is the subject
    Object: { keys: box[events.push('z'.at(0)), 'value'] = (defaults++, null) } } = globalThis);
  assert.deepEqual(from([7]), [7]);
  assert.same(from, pureFrom);
  assert.same(typeof bind, 'function');
  assert.deepEqual(box.value({ x: 1 }), ['x']);
  assert.same(defaults, 0);
  assert.deepEqual(events, ['first', 'x', 'second', 'y', 'third', 'z']);
});

QUnit.test('destructuring: guarded assignments separate pure bindings and native targets', assert => {
  const events = [];
  const pureFrom = Array.from;
  const box = {};
  let from = 'old';
  let error;
  try {
    ({ Array: { [(events.push('first'), 'from')]: from },
      // eslint-disable-next-line no-sequences -- this target observes the preceding write
      Object: { keys: box[events.push(from === pureFrom, 'x'.at(0)), 'value'] } }
      // eslint-disable-next-line no-unsafe-optional-chaining -- absence must reject before the target write
      = (events.push('source'), globalThis.window?.self));
  } catch (error_) {
    error = error_.name;
  }
  if (typeof window === 'undefined') {
    assert.same(error, 'TypeError');
    assert.same(from, 'old');
    assert.deepEqual(events, ['source']);
  } else {
    assert.same(error, undefined);
    assert.same(from, pureFrom);
    assert.deepEqual(box.value({ x: 1 }), ['x']);
    assert.deepEqual(events, ['source', 'first', true, 'x']);
  }
});

QUnit.test('destructuring: nested bindings consume the static value and keep their keys live', assert => {
  const events = [];
  let seen;
  function observe() {
    try {
      seen = typeof from;
    } catch (error) {
      seen = error.name;
    }
  }
  const { Array: { [(events.push('declaration'), observe(), 'from')]: from },
    Object: { keys: { [(events.push('x'.at(0)), 'bind')]: bind } } } = globalThis;
  function read({ Array: { [(events.push('parameter'), 'from')]: method },
    Object: { keys: { [(events.push('y'.at(0)), 'bind')]: bound } } } = globalThis) {
    return [method([8])[0], typeof bound];
  }
  assert.deepEqual(from([7]), [7]);
  assert.same(typeof bind, 'function');
  // Standard Babel lowering omits TDZ checks; the differential locks the original ReferenceError.
  assert.same(seen, 'undefined');
  assert.deepEqual(read(), [8, 'function']);
  assert.deepEqual(events, ['declaration', 'x', 'parameter', 'y']);
});

QUnit.test('destructuring: an array-wrapped static key precedes its binding', assert => {
  let seen;
  function observe() {
    try {
      seen = typeof from;
    } catch (error) {
      seen = error.name;
    }
  }
  const [{ [(observe(), 'from')]: from }, other] = [Array, {}];
  // Babel lowers lexical bindings without TDZ checks here; the differential checks the original TDZ.
  assert.same(seen, 'undefined');
  assert.deepEqual(from([7]), [7]);
  assert.deepEqual(other, {});
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
  assert.same(from, POST_LOWERED ? Array.from : nativeArrayFrom);
  assert.same(typeof rest, 'object');
});

// same collapse exercised through the parameter-default receiver path
QUnit.test('destructuring: const-alias proxy-global `.self` hop collapses (param default)', assert => {
  const g = globalThis;
  function withDefault({ from, ...rest } = g.self.Array) {
    return [from, typeof rest];
  }
  assert.deepEqual(withDefault(), [nativeArrayFrom, 'object']);
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
  assert.same(from, nativeArrayFrom);
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
  assert.same(from, nativeArrayFrom);
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
    return [from, typeof rest];
  }
  assert.deepEqual(withDefault(), [nativeArrayFrom, 'object']);
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
  // eslint-disable-next-line no-unreachable-loop -- observe the initializer once even when the native method is absent
  for (const [{ Array: { fromAsync }, ...rest }] = [(log.push('eff'), globalThis)]; !out;) {
    out = rest && fromAsync;
    break;
  }
  assert.deepEqual(log, ['eff']);
  assert.same(out, POST_LOWERED ? Array.fromAsync : Object.getOwnPropertyDescriptor(Array, 'fromAsync')?.value);
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
  assert.same(groupBy, restMapGroupBy);
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

QUnit.test('destructuring: a catch default memo survives the retained rest split', assert => {
  let defaults = 0;
  function fallback() { return 9; }
  try {
    throw { other: 7 };
  } catch ({ includes = (defaults++, fallback), ...rest }) {
    assert.same(includes(), 9);
    assert.same(defaults, 1);
    assert.deepEqual(rest, { other: 7 });
  }
});

QUnit.test('destructuring: a catch iterator sibling retains the default memo and rest', assert => {
  let defaults = 0;
  try {
    throw [1];
  } catch ({ [Symbol.iterator]: iter, includes = defaults++, ...rest }) {
    assert.same(includes, restArrayIncludes ?? 0);
    if (POST_LOWERED || nativeArrayIterator) assert.same(iter.call([1]).next().value, 1);
    else assert.same(iter, undefined);
    assert.same(defaults, restArrayIncludes ? 0 : 1);
    assert.same(rest[0], 1);
    assert.same(Object.getOwnPropertyDescriptor(rest, 'includes'), undefined);
    assert.same(Object.getOwnPropertyDescriptor(rest, Symbol.iterator), undefined);
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
  assert.same(from, Array.from);
  assert.strictEqual(typeof rest, 'object');
});

// nested key with a rest sibling - same once-only guarantee one level down
QUnit.test('computed-key: nested side-effecting prefix with a rest sibling runs once', assert => {
  const log = [];
  const { x: { [(log.push('eff'), 'from')]: from, ...rest } } = { x: Array };
  assert.deepEqual(log, ['eff']);
  assert.same(from, nativeArrayFrom);
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

// an alias wrapper level captured BEFORE the aliased array is reassigned: the outer literal holds the
// ORIGINAL inner array, so the leaf is still Array and `from` polyfills - the deeper level anchors its
// reassignment check at the capture (the outer declarator), not at the destructure host
QUnit.test('destructuring: two-level array-wrapper alias reassigned after capture keeps the leaf', assert => {
  let inner = [Array];
  const outer = [inner];
  // eslint-disable-next-line no-useless-assignment -- the write after the capture is the shape under test
  inner = [Set];
  const [[{ from }]] = outer;
  assert.deepEqual(from('xy'), ['x', 'y']);
  // NEGATIVE: reassigned BEFORE the capture - the outer literal holds the replacement, and its leaf decides
  // eslint-disable-next-line no-useless-assignment -- the dead init is the shape under test: the write before the capture wins
  let inner2 = [Array];
  inner2 = [{ from: () => 'user' }];
  const outer2 = [inner2];
  const [[{ from: from2 }]] = outer2;
  assert.same(from2('xy'), 'user');
  // ... and a replacement that IS a constructor polyfills through the dominating write: the one
  // unconditional write before the capture is the only value the read can observe
  // eslint-disable-next-line no-useless-assignment -- the dead init is the shape under test: the write before the capture wins
  let inner3 = [Array];
  inner3 = [Object];
  const outer3 = [inner3];
  const [[{ fromEntries }]] = outer3;
  assert.deepEqual(fromEntries([['a', 1]]), { a: 1 });
});

// a chain assignment installs its TAIL into every name on the chain: a wrapper alias written as
// `w = q = [Array]`, a pattern write whose slot is a chain (`[k] = [j = "from"]`), a computed key
// written as `k = j = "from"` - each reads the tail's value, so the static polyfills
QUnit.test('destructuring: chain assignments install their tail in every alias channel', assert => {
  // eslint-disable-next-line no-useless-assignment -- the dead init is the shape under test: the chained write wins
  let w = [Object];
  let q;
  w = q = [Array];
  const [{ from }] = w;
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.same(q, w);
  // eslint-disable-next-line no-useless-assignment -- the dead init is the shape under test: the chained slot write wins
  let k = 'of';
  let j;
  [k] = [j = 'from'];
  assert.deepEqual(Array[k]('cd'), ['c', 'd']);
  assert.same(j, 'from');
  // eslint-disable-next-line no-useless-assignment -- the dead init is the shape under test: the chained write wins
  let key = 'of';
  let key2;
  key = key2 = 'from';
  assert.deepEqual(Array[key]('ef'), ['e', 'f']);
  assert.same(key2, 'from');
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

// A rest-bearing parameter keeps its native leaves and exclusion set.
QUnit.test('destructuring: nested param default with multiple leaves and rest', assert => {
  function f({ Array: { from, of, ...rest } } = globalThis) {
    return [from, of, typeof rest];
  }
  const [a, b, c] = f();
  assert.same(a, nativeArrayFrom);
  assert.same(b, nativeArrayOf);
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

// Object-rest remains native even when every caller uses the parameter default.
QUnit.test('destructuring: rest in a default-only parameter retains the native slot', assert => {
  function stays({ from, ...rest } = Array) {
    return [from, Object.keys(rest).length];
  }
  const [arr, restLen] = stays();
  assert.same(arr, nativeArrayFrom);
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

// Rest keeps the native slots on the truthy branch; the falsy branch still throws.
QUnit.test('destructuring: declarator &&-guarded proxy with rest keeps falsy-path throw', assert => {
  function attempt(guard) {
    try {
      const { Array: { from, ...rest } } = guard && globalThis;
      return [typeof from, Object.keys(rest).length];
    } catch {
      return 'throw';
    }
  }
  assert.deepEqual(attempt(1), [typeof nativeArrayFrom, 0]);
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
    assert.same(at, restArrayAt);
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
  assert.same(from, nativeArrayFrom);
  assert.false('from' in rest);
  // a COMPUTED leaf collapses the hop too - no `.self` read survives
  // eslint-disable-next-line dot-notation -- the computed-leaf hop collapse IS the case under test
  function k({ entries, ...r4 } = globalThis.self['Object']) { return [entries, r4]; }
  const [entries] = k();
  assert.same(entries, nativeObjectEntries);
});

// A rest-bearing destructuring assignment remains native in strict module code.
QUnit.test('destructuring: native rest assignment keeps its strict-mode bindings', assert => {
  /* eslint-disable prefer-const -- the assignment-destructure form IS the case under test */
  let resolve, rest;
  ({ resolve, ...rest } = Promise);
  let from, r2;
  ({ Array: { from }, ...r2 } = globalThis);
  /* eslint-enable prefer-const -- end of the assignment-destructure forms */
  assert.same(typeof resolve, 'function');
  assert.false('resolve' in rest);
  assert.same(from, POST_LOWERED ? Array.from : nativeArrayFrom);
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
  // a multi-ctor proxy declarator: the poly leaf polyfills, and the residual leaf beside it must read
  // off the pure constructor (`{ customQ } = _Set`) rather than collapse to a native residual
  // (`_globalThis.Set.customQ`, a throw off-engine where the realm carries no `Set` at all).
  // reverting the anchor makes the read throw in the stripped realm instead of answering undefined.
  // the key is deliberately one NEITHER surface carries: a key core-js spells as a PROTOTYPE entry is
  // handed out as a static by the pure binding alone, and the row below is where that one belongs
  // the leaf whose key only the PONYFILL carries (`Set.union`) is locked in the differential and in
  // `usage-pure/ponyfill-static-surface-leaf`, never here: this suite runs a `pre+post` leg whose
  // babel step LOWERS the destructure between the phases, and the post pass then reads a plain
  // member chain, where the ordinary constructor substitution applies and the leaf is a ponyfill
  // read again. A row asserting the realm's answer would hold on three legs and fail on that one
  const { Array: { from }, Set: { customQ } } = globalThis;
  const { Object: { fromEntries }, Map: { groupBy } } = globalThis;
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
  assert.strictEqual(typeof customQ, 'undefined');
  assert.deepEqual(fromEntries([['a', 1]]), { a: 1 });
  assert.strictEqual(typeof groupBy, 'function');
});

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
  if (typeof E2E_POST_LOWERED === 'undefined') {
    assert.throws(() => viaDetachedTag(true), TypeError);
  } else {
    // The post pass also polyfills the preceding assignment, selecting the pure static.
    const result = viaDetachedTag(true);
    assert.same(typeof result.promise.then, 'function');
    assert.same(typeof result.resolve, 'function');
    assert.same(typeof result.reject, 'function');
  }
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

// rest inside the symbol-keyed value pattern keeps that level native: the method is read off the
// array by the source's own key, and the rest gathers its own keys, excluding the named one
// (`length`, not `name`: IE-safe arity). a sham host reads nothing under that key
if (!Symbol.sham) QUnit.test('symbol-keyed pattern: inner rest keeps the level native', assert => {
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
QUnit.test('destructure: a replaced container slot reads the installed constructor', assert => {
  const holder = { k: Object };
  holder.k = Map;
  const { k: { groupBy } } = holder;
  assert.same(groupBy, Map.groupBy);
  const box = [Object];
  box[0] = Map;
  const { 0: { groupBy: viaSlot } } = box;
  assert.same(viaSlot, Map.groupBy);
  const nested = { part: { k: Object } };
  nested.part.k = Map;
  const { part: { k: { groupBy: viaNested } } } = nested;
  assert.same(viaNested([7], value => value).get(7)[0], 7);
  const original = { k: Object };
  const alias = original;
  original.k = Map;
  const { k: { groupBy: viaAlias } } = alias;
  assert.same(viaAlias([8], value => value).get(8)[0], 8);
  const inner = { k: Object };
  const outer = { part: inner };
  inner.k = Map;
  const { part: { k: { groupBy: viaHeld } } } = outer;
  assert.same(viaHeld([9], value => value).get(9)[0], 9);
  const effects = [];
  const accessor = {
    // eslint-disable-next-line es/no-accessor-properties -- the getter/setter pair is the source form under test
    get k() { effects.push('get'); return Object; },
    // eslint-disable-next-line es/no-accessor-properties -- the setter preserves the getter's returned constructor
    set k(value) { effects.push('set'); },
  };
  accessor.k = Map;
  const { k: { groupBy: viaGetter } } = accessor;
  assert.deepEqual(viaGetter([10], value => value)[10], [10], 'a setter need not replace the getter\'s constructor');
  assert.deepEqual(effects, ['set', 'get']);
});

QUnit.test('destructure: local calls and tags replace own constructor slots', assert => {
  function install(value) { if (value) value.k = Map; }
  function tag(strings, value) {
    if (value) value.k = Map;
    return '';
  }
  const direct = { k: Object };
  install(direct);
  const { k: { groupBy: fromCall } } = direct;
  assert.deepEqual(fromCall([7], value => value).get(7), [7]);
  const tagged = { k: Object };
  tag`${ tagged }`;
  const { k: { groupBy: fromTag } } = tagged;
  assert.deepEqual(fromTag([8], value => value).get(8), [8]);
  const kept = { k: Object };
  function conditional(value, flag) { if (flag) value.k = Map; }
  conditional(kept, false);
  const { k: { groupBy: fromKept } } = kept;
  assert.deepEqual(fromKept([9], value => value)[9], [9]);
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
    const { Set: { customQ }, Array: { of } } = globalThis.window?.self;
    return [typeof customQ, typeof of];
  }
  function consumedFirst() {
    const { Array: { of }, Set: { customQ } } = globalThis.window?.self;
    return [typeof of, typeof customQ];
  }
  function stringKeyFirst() {
    // eslint-disable-next-line @stylistic/quote-props -- the string spelling IS the form under test
    const { 'Array': { of }, Set: { customQ } } = globalThis.window?.self;
    return [typeof of, typeof customQ];
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
  // the PRESENT-probe claims run wherever this suite does: the host is built around the read where
  // the environment has none, so the composite exercises them instead of the browser leg alone -
  // written under `WINDOW_PRESENT` they ran in karma only, and an impossible expectation sat there
  // unread (`customQ` is a key NEITHER surface carries, so the residual anchored on the pure
  // constructor answers undefined; what an order decides is where the POLYFILLED leaf lands)
  withWindowWithoutSelf(() => {
    assert.same(ctorLeaf(), 'function', 'the ctor-leaf extraction resolves on a present host');
    assert.deepEqual(anchoredFirst(), ['undefined', 'function'], 'the anchored-first order resolves');
    assert.deepEqual(consumedFirst(), ['function', 'undefined'], 'the consumed-first order resolves');
    assert.deepEqual(stringKeyFirst(), ['function', 'undefined'], 'the string-key order resolves');
    assert.same(arrayWrapped(), 'function', 'the array-wrapped extraction resolves');
    assert.same(aliasHeld(), 'function', 'the alias-held extraction resolves');
    // the `??` row swaps its left for a synth that carries the probe's own nullish guard, so the
    // fallback still fires exactly off-env and a present host reads the ponyfill - the karma
    // floor included, where the host's own slot is absent
    assert.same(fallbackRescued(), 'function', 'a present host never reads the fallback - the guarded synth answers');
  });
  if (!WINDOW_PRESENT) {
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
  // An ordinary call argument is not a fallback slot: keep its absent-receiver throw.
  if (typeof window == 'undefined') assert.throws(iifeArg, TypeError);
  else assert.same(iifeArg(), 'function', 'a present IIFE argument supplies the method');
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
  assert.same(flat, restArrayFlat);
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
  assert.same(kept, restArrayAt);
  assert.same(Object.keys(rest).length, src.length, 'and the rest still collects what it excluded');
});

// a REST sibling on an assignment host re-reads the receiver past the renamed key, so a receiver
// nothing can re-read is memoized: both readers take the one identity, and an observable receiver
// evaluates exactly once
QUnit.test('destructuring: a rest sibling on an assignment host shares one receiver read', assert => {
  const log = [];
  let at, rest;
  ({ at, ...rest } = [1, 2]);
  assert.same(at, restArrayAt);
  assert.same(Object.keys(rest).length, 2, 'and the rest collects what the renamed key excluded');
  function mk() {
    log.push('recv');
    return [7, 8, 9];
  }
  ({ at, ...rest } = mk());
  assert.same(log.join(','), 'recv', 'an observable receiver evaluates exactly once');
  assert.same(at, restArrayAt);
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
  assert.same(shared, restArrayAt);
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
  assert.same(kept, restArrayAt);
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
QUnit.test('destructuring: rest above a hop preserves native reads and exclusions', assert => {
  const holder = {
    keep: 1,
    y: [1, [2]],
  };
  const { y: { at: flat }, ...flatRest } = holder;
  assert.same(flat, restArrayAt);
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
QUnit.test('destructuring: rest in a for-x head keeps the native slot and object type', assert => {
  const rows = Object.assign([1, [2]], { extra: 7 });
  const nested = [{ y: rows }];
  for (const { at, ...rest } of [rows]) {
    assert.same(at, restArrayAt);
    assert.same('at' in rest, false, 'and the rest it left behind is a plain object');
    assert.same(rest.extra, 7, 'holding what the pattern did not name');
    assert.same(rest.at, undefined, 'with no instance method of the element it came from');
  }
  for (const [{ y: { at, ...rest } }] of [nested]) {
    assert.same(at, restArrayAt);
    assert.same('at' in rest, false, 'the nested rest is a plain object too');
    assert.same(rest.extra, 7, 'holding the same keys');
  }
  for (const { at, ...rest } of [rows]) assert.same('at' in rest, false, 'a bodyless head answers the same');
  const keys = [];
  for (const { at, ...rest } in { a: 1 }) {
    keys.push(typeof at, 'at' in rest);
  }
  assert.same(keys.join(','), `${ typeof restStringAt },false`, 'a for-in head destructures its key');
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
  assert.same(at, restArrayAt);
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
  for (const ctor of [Array]) {
    const Array = { from: 17 };
    const { from } = ctor;
    assert.same(Array.from, 17, 'a body-local constructor name stays local');
    assert.same(typeof from, 'function', 'the guard resolves its constructor outside the loop body');
    assert.deepEqual(from([1, 2]), [1, 2]);
  }
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
  assert.same(from, POST_LOWERED ? Array.from : nativeArrayFrom);
  if (from) assert.same(from([1]).length, 1, 'and calls through the present method');
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

// a do-while TEST and a for UPDATE run only after a body / iteration that completed normally: a
// `break` skips them, so the alias write standing there is not unconditional and the later read
// takes the runtime guard, which reads the live value and throws where the native does
QUnit.test('destructuring: alias written in a skipped do-while test throws like native', assert => {
  function f(ready) {
    let M;
    do {
      if (!ready) break;
    // eslint-disable-next-line no-unmodified-loop-condition, @stylistic/no-extra-parens -- the test-slot write is the case under test
    } while (({ Map: M } = globalThis));
    return M.groupBy([1], x => x);
  }
  assert.throws(() => f(false), TypeError);
});

QUnit.test('destructuring: alias written in a skipped for update throws like native', assert => {
  function f(ready) {
    let M;
    // eslint-disable-next-line no-unmodified-loop-condition, @stylistic/no-extra-parens -- the update-slot write is the case under test
    for (let i = 0; i < 1; ({ Map: M } = globalThis)) {
      if (!ready) break;
    }
    return M.groupBy([2], x => x);
  }
  assert.throws(() => f(false), TypeError);
});

// an identity self-assign writes the alias's own value back: the pattern-bound alias keeps its
// static, which the stripped realm can only answer through the ponyfill
QUnit.test('destructuring: identity self-assign keeps the pattern alias', assert => {
  let { Map: M } = globalThis;
  // eslint-disable-next-line no-self-assign -- the identity write is the case under test
  M = M;
  const grouped = M.groupBy([1, 2, 3], x => x % 2);
  assert.deepEqual(grouped.get(1), [1, 3]);
  let [A] = [globalThis.Array];
  // eslint-disable-next-line no-self-assign -- the identity write is the case under test
  A = A;
  assert.deepEqual(A.from('ab'), ['a', 'b']);
});

// an assignment-form alias read in a LOOP BODY resolves its single write before the loop: the
// back-edge re-runs the read, never the write
QUnit.test('destructuring: loop-body read of an assignment alias', assert => {
  /* eslint-disable prefer-const -- the assignment form of the alias is the case under test */
  let w;
  w = globalThis;
  /* eslint-enable prefer-const -- end of the assignment-form alias */
  let seen;
  // eslint-disable-next-line no-unmodified-loop-condition, no-unreachable-loop -- a loop-body read of the alias is the case under test
  while (w) {
    seen = w.Array.of(1, 2);
    break;
  }
  assert.deepEqual(seen, [1, 2]);
  let nested;
  for (let i = 1; i > 0; i--) {
    while (i) {
      nested = w.Array.of(3);
      i--;
    }
  }
  assert.deepEqual(nested, [3]);
});

// a nested pattern off an init the source COMPUTES: the root is evaluated exactly once and the leaf
// binds the polyfill, which only a realm without the native can tell from the raw read
QUnit.test('destructuring: nested pattern off a computed root evaluates it once', assert => {
  let calls = 0;
  function mk() {
    calls++;
    return { data: [5, 6] };
  }
  const { data: { at } } = mk();
  assert.same(calls, 1);
  assert.same(at.call([7, 8], -1), 8);
  const { data: { at: withSlotDefault } = { at: () => 'D' } } = mk();
  assert.same(calls, 2);
  assert.same(withSlotDefault.call([1, 2], 0), 1);
  const holder = { inner: { data: [3] } };
  const { data: { at: viaMember } } = holder.inner;
  assert.same(viaMember.call([9], 0), 9);
  const { data: { at: withLeafSibling, length } } = mk();
  assert.same(calls, 3);
  assert.same(length, 2);
  assert.same(withLeafSibling.call([4], 0), 4);
});

// an array-wrapped element beside an EFFECTFUL neighbour: native builds the whole literal before it
// reads anything off a slot, and the extraction keeps that order whether the effect stands before
// the slot (the wrapper dies, the effect rides the dispatch) or after a sole one (the wrapper stays,
// or the element memoizes ahead); a getter element beside a bound neighbour fires once
QUnit.test('destructuring: array-wrapped element beside an effectful neighbour keeps the order', assert => {
  const log = [];
  function eff(v) {
    log.push(v);
    return v;
  }
  const [, { at: afterEffect }] = [eff('n'), eff([1, 2])];
  assert.deepEqual(log, ['n', [1, 2]]);
  assert.same(afterEffect.call([4, 5], 1), 5);
  const [{ at: beforeEffect }] = [eff([6]), eff('t')];
  assert.deepEqual(log.slice(2), [[6], 't']);
  assert.same(beforeEffect.call([8, 9], 0), 8);
  let reads = 0;
  const holder = {};
  Object.defineProperty(holder, 'inner', {
    get() {
      reads++;
      return [1];
    },
  });
  const [{ at: viaGetter }, keep] = [holder.inner, 7];
  assert.same(reads, 1);
  assert.same(keep, 7);
  assert.same(viaGetter.call([2], 0), 2);
});

// an instance leaf under a STATIC hop reads the static's ponyfill - behind a proxy hop, off the init's
// own member read and with a leaf sibling alike - and a static claim with a pattern default binds the
// pattern off the guarded ponyfill, whose own missing key still fires the leaf's default
QUnit.test('destructuring: instance leaf under a static hop reads the static ponyfill', assert => {
  const { Array: { of: { name: viaHop } = {} } = {} } = globalThis;
  assert.same(typeof viaHop, 'string');
  const { of: { name: viaMember } } = globalThis.Array;
  assert.same(typeof viaMember, 'string');
  const { of: { length: arity, name: sibling } } = Array;
  assert.same(arity, 0);
  assert.same(typeof sibling, 'string');
  const { of: { missing = 'F' } = {} } = Array;
  assert.same(missing, 'F');
});

// a SOLE array wrapper whose trailing neighbour runs code beside an element carrying its own
// prefix: native evaluates the prefix, the element, then the neighbour, and a receiver-less static
// reads nothing after that - so the wrapper drops and both effects run once, in that order, ahead
// of the binding. a write the element stores lands before the neighbour too, and an inline
// neighbour above an ALIASED element lifts while the alias keeps its literal
QUnit.test('destructuring: a trailing wrapper neighbour lifts behind the element it follows', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  const [{ Object: { hasOwn } }] = [(eff('e'), globalThis), eff('f')];
  assert.same(hasOwn({ k: 1 }, 'k'), true);
  assert.deepEqual(order, ['e', 'f']);
  let stored;
  const [{ Map: { groupBy } }] = [stored = (eff('w'), globalThis), eff('n')];
  assert.same(stored, globalThis);
  assert.same(typeof groupBy, 'function');
  assert.deepEqual(order.slice(2), ['w', 'n']);
  const alias = [globalThis];
  const [[{ Object: { fromEntries } }]] = [alias, eff('m')];
  assert.same(fromEntries([['a', 1]]).a, 1);
  assert.same(alias.length, 1);
  assert.deepEqual(order.slice(4), ['m']);
});

// what a wrapper residual keeps for a receiver-less static: a SPREAD neighbour still iterates its
// argument exactly once (the wrapper survives under a sentinel), a kept WRITE in the slot stores its
// value once and the binding is the ponyfill, a bare constructor's prefix and trailing neighbour run
// in source order ahead of the binding, and a for-init header keeps the write ahead of the pure
QUnit.test('destructuring: a wrapper residual keeps its spread, its write and its order', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  let pulls = 0;
  const xs = { [Symbol.iterator]() {
    let done = false;
    return { next() {
      if (done) return { done: true, value: undefined };
      done = true;
      pulls++;
      return { done: false, value: 'x' };
    } };
  } };
  const [{ Object: { getPrototypeOf } }] = [globalThis, ...xs];
  assert.same(pulls, 1);
  assert.same(getPrototypeOf([]), Array.prototype);
  let stored;
  const [{ Object: { entries }, other }] = [stored = (eff('w'), globalThis), 7];
  assert.same(stored, globalThis);
  assert.same(other, undefined);
  assert.deepEqual(entries({ a: 1 }), [['a', 1]]);
  const [{ values }] = [(eff('e'), Object), eff('f')];
  assert.deepEqual(values({ b: 2 }), [2]);
  assert.deepEqual(order, ['w', 'e', 'f']);
  let out;
  let written;
  for (const [{ Object: { fromEntries } }] = [written = (eff('q'), globalThis), 7]; !out;) out = fromEntries;
  assert.same(written, globalThis);
  assert.same(out([['c', 3]]).c, 3);
  assert.same(order.at(-1), 'q');
});

// the shapes the wrapper convergence closed last: a kept write under a MULTI-element assignment
// wrapper stores once and the binding still takes the ponyfill, a bare constructor stored with its
// own prefix classifies by the tail, and beside a SPREAD a defaulted instance leaf, an effectful
// computed key and a name the hops merely reach answer as native does - the key's effect included
QUnit.test('destructuring: a multi-wrapper write, a stored constructor and reading claims beside a spread', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  let stored;
  let groupBy;
  let zn;
  // eslint-disable-next-line prefer-const, @stylistic/no-extra-parens -- the assignment host with its parens IS the case under test
  ([{ Map: { groupBy } }, zn] = [stored = (eff('w'), globalThis), 7]);
  assert.same(stored, globalThis);
  assert.same(zn, 7);
  assert.same(typeof groupBy, 'function');
  let ctor;
  const [{ getOwnPropertySymbols }] = [ctor = (eff('c'), Object)];
  assert.same(ctor, Object);
  assert.same(typeof getOwnPropertySymbols, 'function');
  const xs = [1];
  const nul = null;
  const [{ Array: { prototype: { flat: viaDefault = nul } } }] = [globalThis, ...xs];
  assert.deepEqual(viaDefault.call([[1], [2]]), [1, 2]);
  const [{ [(eff('k'), 'at')]: viaKey }] = [Array.prototype, ...xs];
  assert.same(viaKey.call([5, 6], -1), 6);
  const [{ Array: { keys: nameMatch } }] = [globalThis, ...xs];
  assert.same(nameMatch, undefined);
  assert.deepEqual(order, ['w', 'c', 'k']);
});

// a SIBLING-declarator host beside a trailing neighbour keeps the source's order across the whole
// declaration: the leading sibling's effect, then the neighbour, then the binding reads its ponyfill;
// a spread one wrapper level down still iterates exactly once, a bodyless assignment slot lands the
// overwrite inside its braces, and a loop head beside a spread binds the element positionally
QUnit.test('destructuring: sibling hosts, buried spreads and loop heads beside a neighbour', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the sibling-declarator host IS the case under test
  const lead = eff('lead'), [{ Array: { prototype: { findLast } } }] = [globalThis, eff('n')];
  assert.same(lead, 'lead');
  assert.same(findLast.call([1, 2, 3], x => x < 3), 2);
  assert.deepEqual(order, ['lead', 'n']);
  let pulls = 0;
  const xs = { [Symbol.iterator]() {
    let done = false;
    return { next() {
      if (done) return { done: true, value: undefined };
      done = true;
      pulls++;
      return { done: false, value: 'x' };
    } };
  } };
  const [[{ Object: { groupBy } }]] = [[globalThis, ...xs]];
  assert.same(pulls, 1);
  assert.deepEqual(groupBy([1, 2, 3], x => x % 2 ? 'odd' : 'even').odd, [1, 3]);
  let stored;
  let bodylessGb;
  let bodylessZn;
  if (lead) [{ Map: { groupBy: bodylessGb } }, bodylessZn] = [stored = (eff('w'), globalThis), 7];
  assert.same(stored, globalThis);
  assert.same(bodylessZn, 7);
  assert.same(typeof bodylessGb, 'function');
  let out;
  for (const [{ Array: { prototype: { toSorted } } }] = [globalThis, ...xs]; !out;) out = toSorted;
  assert.same(pulls, 2);
  assert.deepEqual(out.call([3, 1, 2]), [1, 2, 3]);
  assert.deepEqual(order.slice(2), ['w']);
});

QUnit.test('destructuring: several claims over one stored or prefixed init run its setup once', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  let stored;
  // eslint-disable-next-line prefer-const -- the claims share the init the write performs
  let { Array: { prototype: { at: flatAt } }, Object: { keys: flatKeys } } = stored = (eff('w'), globalThis);
  assert.same(stored, globalThis);
  assert.same(flatAt.call([1, 2, 3], -1), 3);
  assert.deepEqual(flatKeys({ a: 1 }), ['a']);
  const [{ Array: { prototype: { at: wrapAt } }, Object: { values: wrapValues } }] = [stored = (eff('x'), globalThis)];
  assert.same(stored, globalThis);
  assert.same(wrapAt.call([1, 2, 3], 0), 1);
  assert.deepEqual(wrapValues({ a: 1 }), [1]);
  const [{ Object: { keys: pairKeys, values: pairValues } }] = [stored = (eff('y'), globalThis)];
  assert.same(stored, globalThis);
  assert.deepEqual(pairKeys({ b: 2 }), ['b']);
  assert.deepEqual(pairValues({ b: 2 }), [2]);
  let loopOut;
  for (const [{ Array: { prototype: { at: loopAt } }, Object: { entries: loopEntries } }] = [stored = (eff('z'), globalThis)]; !loopOut;) loopOut = [loopAt, loopEntries];
  assert.same(stored, globalThis);
  assert.same(loopOut[0].call([7], 0), 7);
  assert.deepEqual(loopOut[1]({ c: 3 }), [['c', 3]]);
  let assignAt;
  let assignKeys;
  if (order.length) ({ Array: { prototype: { at: assignAt } }, Object: { keys: assignKeys } } = stored = (eff('v'), globalThis));
  assert.same(stored, globalThis);
  assert.same(assignAt.call([4, 5], 1), 5);
  assert.deepEqual(assignKeys({ d: 4 }), ['d']);
  assert.deepEqual(order, ['w', 'x', 'y', 'z', 'v']);
});

QUnit.test('destructuring: a slot behind a spread, a loop head beside an effect and two extractions over one write', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  const xs = [1];
  const [, { Array: { prototype: { at: behindSpread } } }] = [...xs, globalThis];
  assert.same(behindSpread.call([8, 9], -1), 9);
  const [, { at: slotBehindSpread }] = [...xs, [6, 7]];
  assert.same(slotBehindSpread.call([6, 7], 0), 6);
  let out;
  for (const [{ Object: { keys: loopKeys } }] = [globalThis, eff('p')]; !out;) out = loopKeys;
  assert.deepEqual(out({ e: 5 }), ['e']);
  let stored;
  let twin;
  for (const [{ Object: { keys: twinKeys, values: twinValues } }] = [stored = (eff('q'), globalThis)]; !twin;) twin = [twinKeys, twinValues];
  assert.same(stored, globalThis);
  assert.deepEqual(twin[0]({ f: 6 }), ['f']);
  assert.deepEqual(twin[1]({ f: 6 }), [6]);
  assert.deepEqual(order, ['p', 'q']);
});

QUnit.test('destructuring: one host, one order - claims, loop-head sinks and a slot-written memo', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  let assignStatic;
  let assignInstance;
  let assignOther;
  ({ Object: { keys: assignStatic }, Array: { prototype: { at: assignInstance } } } = (eff('a'), globalThis));
  assert.deepEqual(assignStatic({ a: 1 }), ['a']);
  assert.same(assignInstance.call([1, 2], -1), 2);
  ({ Array: { prototype: { at: assignInstance } }, Object: { keys: assignStatic }, other: assignOther } = (eff('b'), globalThis));
  assert.same(assignInstance.call([3, 4], 0), 3);
  assert.deepEqual(assignStatic({ b: 2 }), ['b']);
  assert.same(assignOther, undefined);
  let head;
  for (const { Array: { prototype: { values: headValues, at: headAt } }, Object: { keys: headKeys } } = (eff('c'), globalThis); !head;) {
    head = [headValues, headAt, headKeys];
  }
  assert.same(typeof head[0], 'function');
  assert.same(head[1].call([5, 6], 1), 6);
  assert.deepEqual(head[2]({ c: 3 }), ['c']);
  const rows = [[1, 2]];
  const [, { at: slotAt, length: slotLength }] = [eff('d'), rows.flat()];
  assert.same(slotAt.call([7, 8], 0), 7);
  assert.same(slotLength, 2);
  let wrapFrom;
  let wrapTail;
  [{ Array: { from: wrapFrom } }, wrapTail] = [globalThis, eff('e')];
  assert.deepEqual(wrapFrom([9]), [9]);
  assert.same(wrapTail, 'e');
  [{ Array: { of: wrapFrom } }, wrapTail] = [globalThis, eff('f')];
  assert.deepEqual(wrapFrom(10), [10]);
  assert.same(wrapTail, 'f');
  assert.deepEqual(order, ['a', 'b', 'c', 'd', 'e', 'f']);
});

QUnit.test('destructuring: a loop initializer precedes all extracted bindings', assert => {
  const seen = [];
  let result;
  // eslint-disable-next-line no-var -- observing the hoisted binding survives lexical lowering too
  for (var lead = seen.push('lead'), { Object: { keys }, Array: { prototype: { at } } } = (seen.push(typeof keys, typeof at), globalThis), tail = seen.push('tail'); !result;) {
    result = [keys, at, lead, tail];
  }
  assert.deepEqual(seen, ['lead', 'undefined', 'undefined', 'tail']);
  assert.deepEqual(result[0]({ a: 1 }), ['a']);
  assert.same(result[1].call([7, 8], -1), 8);
  assert.deepEqual(result.slice(2), [1, 4]);
  const single = [];
  let singleResult;
  // eslint-disable-next-line no-var -- the single static extraction has the same initialization order
  for (var before = single.push('before'), { Array: { from } } = (single.push(typeof from), globalThis), after = single.push('after'); !singleResult;) {
    singleResult = [from('ab'), before, after];
  }
  assert.deepEqual(single, ['before', 'undefined', 'after']);
  assert.deepEqual(singleResult, [['a', 'b'], 1, 3]);
});

QUnit.test('destructuring: nested static keys precede their own bindings', assert => {
  const seen = [];
  // eslint-disable-next-line no-var -- the old value remains observable after lexical lowering
  var { Array: { [(seen.push(typeof direct), 'from')]: direct } } = globalThis;
  // eslint-disable-next-line no-var -- the all-proxy selection must preserve the same order
  var { Array: { [(seen.push(typeof selected), 'of')]: selected } } = seen.length ? globalThis : globalThis;
  // eslint-disable-next-line no-var -- a static and an instance claim share the ordered host
  var { x: { [(seen.push(typeof mixed), 'from')]: mixed }, y: { [(seen.push(typeof mixed, typeof at), 'at')]: at } } = { x: Array, y: [4, 8] };
  // eslint-disable-next-line no-var -- a retained rest must not move the key after its binding
  var { x: { [(seen.push(typeof withRest), 'from')]: withRest, ...rest } } = { x: Array };
  // eslint-disable-next-line no-var -- the outer computed key must retain the captured static type
  var { [(seen.push('outer'), 'Array')]: { [(seen.push(typeof keyed), 'from')]: keyed } } = globalThis;
  assert.deepEqual(seen, ['undefined', 'undefined', 'undefined', 'function', 'undefined', 'undefined', 'outer', 'undefined']);
  assert.deepEqual(direct('ab'), ['a', 'b']);
  assert.deepEqual(selected(4), [4]);
  assert.deepEqual(mixed('cd'), ['c', 'd']);
  assert.same(at.call([4, 8], -1), 8);
  assert.same(withRest, nativeArrayFrom);
  assert.same(typeof rest, 'object');
  assert.false(Object.hasOwn(rest, 'from'));
  assert.deepEqual(keyed('gh'), ['g', 'h']);
});

QUnit.test('destructuring: a bracketed hop key names the slot its dotted spelling does', assert => {
  const order = [];
  function eff(tag) {
    order.push(tag);
    return tag;
  }
  /* eslint-disable no-useless-computed-key -- the bracketed spelling of a hop key IS the subject */
  const { ['Array']: { prototype: { at: literalKeyAt } } } = globalThis;
  assert.same(literalKeyAt.call([1, 2], -1), 2);
  const K = 'Array';
  const { [K]: { prototype: { includes: boundKeyIncludes } } } = globalThis;
  assert.same(boundKeyIncludes.call([3, 4], 4), true);
  const [{ ['Array']: { prototype: { forEach: wrappedForEach } } }] = [globalThis];
  const seen = [];
  wrappedForEach.call([5, 6], value => seen.push(value));
  assert.deepEqual(seen, [5, 6]);
  const { ['box']: { map: literalReceiverMap } } = { box: [7] };
  assert.deepEqual(literalReceiverMap.call([7], value => value + 1), [8]);
  /* eslint-enable no-useless-computed-key -- end of the bracketed-spelling block */
  // a HOP under a key that only folds through a SEQUENCE keeps its level like a rest sibling: the
  // hop retires to a sentinel, the key runs exactly once, and the leaf below extracts the polyfill
  const { [(eff('key'), 'Array')]: { prototype: { values: effectKeyValues } } } = globalThis;
  assert.same(typeof effectKeyValues, 'function', 'the leaf under an effectful hop key binds the polyfill');
  assert.deepEqual([...effectKeyValues.call([7, 8])], [7, 8], '... and it works');
  assert.deepEqual(order, ['key'], 'the key ran exactly once');
});

/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- `self` beside `globalThis` IS
   the selecting receiver under test: the two name one realm, which is what lets the surface collapse */
QUnit.test('destructuring: a selecting realm receiver reads one surface', assert => {
  const pick = 1;
  const { Array: { prototype: { at: ternaryAt } } } = pick ? globalThis : self;
  assert.same(ternaryAt.call([1, 2], -1), 2);
  const { Array: { prototype: { includes: nullishIncludes } } } = self ?? globalThis;
  assert.same(nullishIncludes.call([3, 4], 4), true);
  const { Array: { prototype: { map: testedMap } } } = pick && globalThis;
  assert.same(typeof testedMap, 'function');
});
/* eslint-enable no-restricted-globals, unicorn/prefer-global-this -- end of the selecting-receiver test */

QUnit.test('destructuring: an object-literal hop reaches the built-in surface', assert => {
  const { w: { Array: { prototype: { at: hopAt } } } } = { w: globalThis };
  assert.same(hopAt.call([1, 2], -1), 2);
  const { q: { w: { Array: { prototype: { includes: deepIncludes } } } } } = { q: { w: globalThis } };
  assert.same(deepIncludes.call([3, 4], 4), true);
  const { w: { Array: { prototype: { map: besideSibling } } }, z } = { w: globalThis, z: 5 };
  assert.deepEqual(besideSibling.call([1], value => value + 1), [2]);
  assert.same(z, 5);
  const { y: { find: literalFind } } = { y: [6, 7] };
  assert.same(literalFind.call([6, 7], value => value > 6), 7);
});

QUnit.test('destructuring: a sole-key object hop pairs the slot it names', assert => {
  const { w: { Map: HopMap } } = { w: globalThis };
  assert.same(new HopMap([[1, 2]]).get(1), 2);
  const hopHolder = { P: Array };
  const { P: { from: hopFrom } } = hopHolder;
  assert.deepEqual(hopFrom('ab'), ['a', 'b']);
  // the hazards that keep a level whole are locked byte-wise in the fixture: what stays native there
  // reads the realm's own slot, which a stripped realm does not have to carry
});

QUnit.test('destructuring: an object hop keeps every effect the literal spells', assert => {
  const order = [];
  function bump(tag) {
    order.push(tag);
    return 1;
  }
  // a sibling VALUE runs whether the level is consumed or kept - the two legs may route it
  // differently, and neither may lose it
  const { w: { Map: BesideEffect } } = { z: bump('sibling'), w: globalThis };
  assert.same(typeof new BesideEffect([]).get, 'function');
  // ... and so does a sequence PREFIX standing in front of the literal
  const { w: { Set: BehindPrefix } } = (bump('prefix'), { w: globalThis });
  assert.same(typeof new BehindPrefix([]).has, 'function');
  // ... and a SPREAD standing ahead of the key keeps the literal alive, so the claim still reads the
  // slot the key names and everything the spread brought in stays where the source put it
  const spreadSource = { z: bump('spread') };
  const { w: { at: overSpread }, z: spreadKept } = { ...spreadSource, w: [7, 8] };
  assert.same(overSpread.call([7, 8], -1), 8);
  assert.same(spreadKept, 1);
  assert.deepEqual(order, ['sibling', 'prefix', 'spread']);
});

// the SLOT's own prefix runs exactly once whichever host the hop stands in, and a level whose key
// nothing can name at runtime stays whole: the runtime value is the source's, never a ponyfill
// read off a slot the level may not hold
// an inline-array spread in a wrapper is a longer literal: every element still evaluates once, in
// source order, whichever route the pairing takes (the wrapper dropped, a memo, a directive, an
// IIFE argument), and the claim reads the value the element holds
QUnit.test('destructuring: an inline-array spread in a wrapper evaluates its elements once, in order', assert => {
  const log = [];
  function mark(tag, value) {
    log.push(tag);
    return value;
  }
  // eslint-disable-next-line unicorn/no-useless-spread -- the inline spread is the case
  const [{ at: viaDropped }] = [...[mark('a', [1, 2])], mark('b', 0)];
  assert.same(viaDropped.call([3, 4], -1), 4, 'the wrapper element the claim reads is the one the spread spells');
  assert.deepEqual(log, ['a', 'b'], 'the dropped wrapper still runs its elements in source order');
  // eslint-disable-next-line unicorn/no-useless-spread -- the inline spread is the case
  const [, { at: viaShifted }] = [...[mark('c', 0), mark('d', [5, 6])]];
  assert.same(viaShifted.call([7], 0), 7);
  assert.deepEqual(log, ['a', 'b', 'c', 'd'], 'a shifted slot behind an effect keeps the effect ahead of it');
  // ... the receiver slot spells a LITERAL: an opaque call there is no receiver the mirror can
  // classify, and that argument stays native by design
  // eslint-disable-next-line unicorn/no-useless-spread -- the inline spread is the case
  const viaIife = (({ at }, x) => [at.call([8, 9], -1), x])(...[[0], mark('e', 1)]);
  assert.deepEqual(viaIife, [9, 1], 'an IIFE argument list spread from an inline array binds by position');
  assert.deepEqual(log, ['a', 'b', 'c', 'd', 'e']);
  // eslint-disable-next-line unicorn/no-useless-spread -- the inline spread is the case
  const viaDirective = Object.seal(...[mark('g', [10, 11])]);
  assert.same(viaDirective.at(-1), 11, 'a returning directive hands on the element at the coordinate');
  const box = [[12]];
  // eslint-disable-next-line unicorn/no-useless-spread -- the inline spread is the case
  const [alias] = [...[box]];
  alias.push('s');
  assert.same(alias, box, 'the alias IS the element the spread expands to');
  assert.same(box.at(-1), 's', 'the alias re-homes it');
  assert.deepEqual(log, ['a', 'b', 'c', 'd', 'e', 'g']);
  const viaSeq = (({ at }) => at)((mark('h', null), [13, 14]));
  assert.same(viaSeq.call([15], 0), 15, 'a sequence-tail argument reads its tail');
  assert.deepEqual(log, ['a', 'b', 'c', 'd', 'e', 'g', 'h']);
});

QUnit.test('destructuring: an object hop slot runs its prefix once on every host', assert => {
  let hits = 0;
  function bump() {
    hits += 1;
  }
  // eslint-disable-next-line @stylistic/no-extra-parens -- the nested sequence LEVEL is the case
  const { w: { Map: DeclSeq } } = { w: (bump(), (bump(), globalThis)) };
  assert.same(typeof new DeclSeq([]).get, 'function');
  assert.same(hits, 2, 'a nested comma run in a declaration slot runs both effects once');
  let AssignSeq;
  // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
  ({ w: { Map: AssignSeq } } = { w: (bump(), globalThis ?? {}) });
  assert.same(typeof new AssignSeq([]).get, 'function');
  assert.same(hits, 3, 'an assignment slot runs its prefix once');
  let AssignNested;
  // eslint-disable-next-line prefer-const, @stylistic/no-extra-parens -- the assignment host and the nested LEVEL are the case
  ({ w: { Array: { from: AssignNested } } } = { w: (bump(), (bump(), globalThis)) });
  assert.same(AssignNested('ab').length, 2);
  assert.same(hits, 5, 'a nested run in an assignment slot runs both effects once');
  const other = { Map: 'other' };
  function unnameable(key) {
    const { w: { Map: kept } } = { w: globalThis, [key]: other };
    let keptAssign;
    // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
    ({ w: { Map: keptAssign } } = { w: globalThis, [key]: other });
    return [kept, keptAssign];
  }
  assert.deepEqual(unnameable('w'), ['other', 'other'], 'a key that IS the slot at runtime wins on both hosts');
  assert.same(typeof unnameable('q')[0], 'function', 'and another key leaves the realm slot in place');
});

// the hop on the hosts that MIRROR their receiver: a literal container in the slot pairs the hop key
// with its slot value and the mirror lands in that slot - the value read is the polyfill's, and a
// passed argument still destructures natively (the default never fires)
QUnit.test('destructuring: an object hop over a literal container mirrors on every mirroring host', assert => {
  function viaParam({ w: { Map: M } } = { w: globalThis }) {
    return M;
  }
  assert.same(new (viaParam())([[1, 2]]).get(1), 2, 'a parameter default mirrors the ctor into the slot');
  assert.same(viaParam({ w: { Map: 'passed' } }), 'passed', '... and a passed argument destructures natively');
  function viaParamInstance({ w: { at } } = { w: [7, 8] }) {
    return at;
  }
  assert.same(viaParamInstance().call([7, 8], -1), 8, 'an instance leaf under the hop dispatches on the slot');
  const heads = [];
  for (const { w: { Map: HeadMap } } of [{ w: globalThis }]) heads.push(typeof new HeadMap([]).get);
  assert.deepEqual(heads, ['function'], 'a for-of head element mirrors the same way');
  const ViaIife = (({ w: { Map: M } }) => M)({ w: globalThis });
  assert.same(new ViaIife([[3, 4]]).get(3), 4, 'an IIFE argument mirrors the same way');
});

// a BOUND computed hop key (`{ [k]: {...} }` with `const k = 'w'`) claims exactly what the literal
// spelling claims, on every host - and an emptied hop beside a rest on an assignment host writes a
// sentinel the emitter must declare: an undeclared write throws in strict code
QUnit.test('destructuring: a bound computed hop key claims like its literal spelling', assert => {
  const k = 'w';
  const { [k]: { Map: BoundCtor } } = { w: globalThis };
  assert.same(new BoundCtor([[1, 2]]).get(1), 2, 'a ctor leaf under the bound key');
  const { [k]: { at: boundAt } } = { w: [7, 8] };
  assert.same(boundAt.call([7, 8], -1), 8, 'an instance leaf under the bound key');
  // eslint-disable-next-line unicorn/no-unused-properties -- the pattern reads it through the bound key
  const alias = { w: [5, 6] };
  const { [k]: { at: aliasAt } } = alias;
  assert.same(aliasAt.call([5, 6], -1), 6, '... through a followed alias');
  const { [k]: [{ at: wrappedAt }] } = { w: [[3, 4]] };
  assert.same(wrappedAt.call([3, 4], 0), 3, 'a wrapper under the key pairs its slot');
  let assignAt;
  // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
  ({ [k]: [{ at: assignAt }] } = { w: [[3, 4]] });
  assert.same(assignAt.call([3, 4], 0), 3, '... on an assignment host too');
  let restAt;
  let rest;
  // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
  ({ w: { at: restAt }, ...rest } = { w: [1, 2], z: 1 });
  assert.same(restAt, restArrayAt);
  assert.deepEqual(rest, { z: 1 }, '... and the rest gathers the other keys');
  const heads = [];
  for (const { [k]: { at: headAt } } of [{ w: [9] }]) heads.push(headAt.call([9], 0));
  const thrown = new Error('x');
  thrown.w = [10];
  try {
    throw thrown;
  } catch ({ [k]: { at: caughtAt } }) {
    heads.push(caughtAt.call([10], 0));
  }
  assert.deepEqual(heads, [9, 10], 'a loop head and a catch clause relocate the same way');
});

// a comma run in front of a hop SLOT runs once and its tail is what the claim reads - on the
// declaration and under a wrapper - and a REST beside the hop still gathers every other key
QUnit.test('destructuring: a comma run in front of a hop slot runs once on every host', assert => {
  let hits = 0;
  function bump() {
    hits += 1;
  }
  const { w: { at: seqAt } } = { w: (bump(), [7, 8]) };
  assert.same(seqAt.call([7, 8], -1), 8, 'the tail is the receiver');
  assert.same(hits, 1, 'the prefix ran once');
  const [{ w: { at: wrappedAt } }] = [{ w: (bump(), [5, 6]) }];
  assert.same(wrappedAt.call([5, 6], 0), 5, '... under an array wrapper too');
  assert.same(hits, 2, 'and once there as well');
  // a ctor leaf beside a REST stays the host's own slot (the rest-bearing level keeps its reads
  // native; the post-lowered legs re-read the lowered member), so the probe uses only what every
  // matrix cell's `Map` has - the floor's takes no iterable and its `set` returns nothing
  const { w: { Map: RestCtor }, ...rest } = { w: globalThis, z: 1 };
  const restMap = new RestCtor();
  restMap.set(1, 2);
  assert.same(restMap.get(1), 2, 'a ctor leaf beside a rest');
  assert.deepEqual(rest, { z: 1 }, '... and the rest keeps the other keys');
  let AssignCtor;
  let assignRest;
  // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
  ({ w: { Map: AssignCtor }, ...assignRest } = { w: globalThis, z: 2 });
  const assignMap = new AssignCtor();
  assignMap.set(3, 4);
  assert.same(assignMap.get(3), 4, '... on an assignment host');
  assert.deepEqual(assignRest, { z: 2 }, 'where the rest gathers too');
  const order = [];
  const [{ w: { at: liftedAt } }] = [{ w: (order.push('a'), [9]) }, order.push('b')];
  assert.same(liftedAt.call([9], 0), 9, 'a dead wrapper with a trailing effect');
  assert.deepEqual(order, ['a', 'b'], '... keeps the source order');
});

// a hop over a slot the level cannot spell twice, while the level stays whole: the value moves to a
// ref both readers take, evaluated once and in source order - hoisted where nothing observable stands
// before the slot, written in the slot behind an observable property; a member read fires its getter once
QUnit.test('destructuring: a hop slot the level cannot spell twice memoizes once and in order', assert => {
  const log = [];
  function eff(tag, value) {
    log.push(tag);
    return value;
  }
  const { w: { at: hoistAt }, z } = { w: eff('w', [7, 8]), z: 1 };
  assert.same(hoistAt.call([7, 8], -1), 8, 'the hoisted slot value dispatches');
  assert.same(z, 1, '... and the sibling still binds');
  const { a, w: { at: inSlotAt } } = { a: eff('a', 1), w: eff('w2', [5, 6]) };
  assert.same(inSlotAt.call([5, 6], 0), 5, 'the in-slot value dispatches');
  assert.same(a, 1, '... and the preceding sibling still binds');
  assert.deepEqual(log, ['w', 'a', 'w2'], 'every slot ran once, in source order');
  let reads = 0;
  const holder = {};
  Object.defineProperty(holder, 'p', { get() {
    reads += 1;
    return [9];
  } });
  const { b, w: { at: memberAt } } = { b: eff('b', 2), w: holder.p };
  assert.same(memberAt.call([9], 0), 9, 'a member read behind an observable property dispatches');
  assert.same(b, 2);
  assert.same(reads, 1, '... and its getter fired once');
  const [, { y: { at: holeAt } }] = [eff('hole', 0), { y: eff('slot', [3, 4]) }];
  assert.same(holeAt.call([3, 4], 1), 4, 'a slot behind an effectful hole dispatches');
  assert.deepEqual(log.slice(-2), ['hole', 'slot'], '... after the hole ran, once each');
  const { w: { at: sibHoistAt }, z: z2 } = { w: eff('sib-w', [1, 2]), z: 1 },
        sibQ = 2;
  assert.same(sibHoistAt.call([1, 2], -1), 2, 'a hoisted slot beside a sibling declarator dispatches');
  assert.same(z2 + sibQ, 3, '... and both other bindings still bind');
  const { a: a2, w: { at: sibInSlotAt } } = { a: eff('sib-a', 1), w: eff('sib-w2', [5, 6]) },
        sibQ2 = 3;
  assert.same(sibInSlotAt.call([5, 6], 1), 6, 'an in-slot memo beside a sibling declarator dispatches');
  assert.same(a2 + sibQ2, 4);
  assert.deepEqual(log.slice(-3), ['sib-w', 'sib-a', 'sib-w2'], '... every slot ran once, in source order');
  const { b: b2, w: { at: twinAt, flat: twinFlat } } = { b: eff('twin-b', 1), w: eff('twin-w', [[7]]) };
  assert.same(twinAt.call([[7]], 0)[0], 7, 'two leaves off one in-slot memo dispatch');
  assert.deepEqual(twinFlat.call([[7]]), [7]);
  assert.same(b2, 1);
  assert.deepEqual(log.slice(-2), ['twin-b', 'twin-w'], '... and the slot ran once for both');
  const [fa, { at: flatInSlotAt }] = [eff('flat-a', 1), eff('flat-w', [8, 9])];
  assert.same(flatInSlotAt.call([8, 9], 0), 8, 'a sole-prop flat element behind an effectful sibling dispatches');
  assert.same(fa, 1);
  assert.deepEqual(log.slice(-2), ['flat-a', 'flat-w'], '... in source order, once each');
  const [, { at: liftedThenSlotAt }, fz] = [eff('lift-1', 0), eff('lift-2', [1]), 1];
  assert.same(liftedThenSlotAt.call([1], 0), 1, 'a slot behind a discarded effect with a live sibling dispatches');
  assert.same(fz, 1);
  assert.deepEqual(log.slice(-2), ['lift-1', 'lift-2'], '... the discarded effect first, then the slot');
  const [fx, , { at: boundThenHoleAt }] = [1, eff('hole-2', 0), eff('slot-3', [2])];
  assert.same(boundThenHoleAt.call([2], 0), 2, 'a slot behind a discarded effect that follows a bound slot dispatches');
  assert.same(fx, 1);
  assert.deepEqual(log.slice(-2), ['hole-2', 'slot-3'], '... the discarded effect still first');
  const { a: a3, w: { at: hostObjAt } } = { a: eff('two-a', 1), w: eff('two-w', [1, 2]) },
        [{ flat: hostArrFlat }, hz] = [eff('two-arr', [[3]]), 4];
  assert.same(hostObjAt.call([1, 2], 1), 2, 'an object hop beside an array wrapper in one declaration dispatches');
  assert.deepEqual(hostArrFlat.call([[3]]), [3], '... and so does the array wrapper beside it');
  assert.same(a3 + hz, 5);
  assert.deepEqual(log.slice(-3), ['two-a', 'two-w', 'two-arr'], '... every init ran once, in source order');
  const { b: b3, w: { [Symbol.iterator]: symInSlot } } = { b: eff('sym-b', 1), w: eff('sym-w', [5]) };
  assert.same(typeof symInSlot, 'function', 'a symbol leaf under a hop beside a sibling binds the iterator method');
  assert.same(symInSlot.call([5]).next().value, 5);
  assert.same(b3, 1);
  assert.deepEqual(log.slice(-2), ['sym-b', 'sym-w'], '... its slot ran once, in order');
});

QUnit.test('destructuring: several SE keys on one pattern read in key order', assert => {
  const log = [];
  function key(tag) {
    log.push(tag);
    return tag;
  }
  // an ARRAY whose own getters log the read and answer the built-in method: the dispatch reads the
  // own property first and hands the polyfill over only where it is the built-in
  const source = Object.defineProperties([7, [8]], {
    at: { get() {
      log.push('get-at');
      return Array.prototype.at;
    } },
    flat: { get() {
      log.push('get-flat');
      return Array.prototype.flat;
    } },
    z: { value: 9 },
  });
  const { [key('at')]: segAt, [key('flat')]: segFlat, z } = source;
  assert.same(segAt.call([7], -1), 7, 'the first claim binds a working method');
  assert.deepEqual(segFlat.call([[8]]), [8], 'the second claim binds a working method');
  assert.same(z, 9, '... and the trailing prop still binds');
  assert.true(log.indexOf('at') < log.indexOf('get-at'), 'the first key runs before its property is read');
  assert.true(log.lastIndexOf('get-at') < log.indexOf('flat'), '... and every read of it precedes the second key');
  assert.true(log.indexOf('flat') < log.indexOf('get-flat'), 'the second key runs before its property is read');
});

// an UNCLAIMED effectful key beside a claim still segments the residual at the claim: native reads
// the claimed slot before the props written past it, and so does the emitted shape
QUnit.test('destructuring: an unclaimed effectful key beside a claim keeps the per-prop read order', assert => {
  const log = [];
  const recv = Object.defineProperties({}, {
    at: { get() {
      log.push('at');
      return Array.prototype.at;
    } },
    m: { get() {
      log.push('m');
      return 'm';
    } },
  });
  // eslint-disable-next-line no-unused-vars -- the unclaimed key's binding is the shape under test
  const { [(log.push('k1'), 'of')]: o, [(log.push('k2'), 'at')]: a, m } = recv;
  assert.same(typeof a, 'function', 'the claim bound the polyfilled method');
  assert.same(m, 'm', 'the trailing prop bound');
  assert.deepEqual(log.slice(0, 3), ['k1', 'k2', 'at'], 'keys, then the claimed slot');
  assert.same(log.at(-1), 'm', 'the trailing prop reads last');
});

QUnit.test('destructuring: a constructor under a literal hop beside a sibling prop binds the polyfill', assert => {
  const { w: { Map: HopMap }, z } = { w: globalThis, z: 1 };
  assert.same(typeof HopMap, 'function', 'the constructor binds');
  assert.same(new HopMap([[1, 2]]).get(1), 2, '... and works');
  assert.same(z, 1, '... while the sibling still binds');
  const { a, w: { Map: HopMap2, Set: HopSet } } = { a: 3, w: globalThis };
  assert.same(typeof HopMap2 + typeof HopSet, 'functionfunction', 'two constructors off one hop bind');
  assert.same(a, 3);
  let hits = 0;
  const { w: { Array: { prototype: { at: deepBeside } } }, z: sibZ } = { w: globalThis, z: (hits += 1, 1) };
  assert.same(deepBeside.call([4, 5], -1), 5, 'a deep nav under a hop beside an observable sibling dispatches');
  assert.same(sibZ + hits, 2, '... the sibling binds and its effect ran once');
  const order = [];
  // the slot has to SPELL the realm for the nav below it to be a surface: a sequence tail, not a call
  const { w: { Array: { prototype: { at: navInSlot } } }, z: nz } = { z: (order.push('z'), 1), w: (order.push('w'), globalThis) };
  assert.same(navInSlot.call([6, 7], 0), 6, 'a nav below an effectful memoized slot dispatches on the surface');
  assert.deepEqual(order, ['z', 'w'], '... the slots ran once, in source order');
  assert.same(nz, 1);
  let navAssign, na;
  // eslint-disable-next-line prefer-const -- the destructuring ASSIGNMENT host is the case under test
  ({ w: { Array: { prototype: { at: navAssign } } }, a: na } = { w: globalThis, a: 4 });
  assert.same(navAssign.call([8], -1), 8, 'an assignment host navigating below a realm slot dispatches');
  assert.same(na, 4);
});

QUnit.test('destructuring: a selecting receiver under a wrapper mirrors per branch', assert => {
  const userObj = { from: () => 'user', keys: () => 'user' };
  for (const pick of [true, false]) {
    const [{ from: viaElement }] = [pick ? Array : userObj];
    const [{ from: viaDefault } = {}] = [pick ? Array : userObj];
    const { w: { keys: viaKeyed } } = { w: pick ? Object : userObj };
    function viaParam([{ from: f }] = [pick ? Array : userObj]) { return f; }
    if (pick) {
      assert.same(typeof viaElement, 'function', 'the element arm binds the polyfill');
      assert.same(viaElement('ab').length, 2, '... and it works');
      assert.same(viaDefault('ab').length, 2, 'the defaulted element binds the polyfill');
      assert.same(viaKeyed({ a: 1 }).length, 1, 'the keyed level binds the polyfill');
      assert.same(viaParam()('ab').length, 2, 'the parameter default binds the polyfill');
    } else {
      assert.same(viaElement(), 'user', 'the user arm keeps its own value');
      assert.same(viaDefault(), 'user', '... under a defaulted element too');
      assert.same(viaKeyed(), 'user', '... and under a keyed level');
      assert.same(viaParam()(), 'user', '... and in a parameter default');
    }
    assert.same(viaParam([userObj])(), 'user', 'a passed argument destructures natively');
  }
});

// a static leaf's user default is dead text - the binding is the polyfill, never the default -
// and a hop value the name channel reads through a call's return type runs exactly once beside a
// sibling the pattern keeps, whichever selection spells it
QUnit.test('destructuring: static default is dead, call-valued hop runs once beside a sibling', assert => {
  function fb() { return 'fallback'; }
  const K = 'from';
  const { from: viaAlias = fb } = Array;
  const { [K]: viaComputed = fb } = Array;
  const { Array: { from: viaHop = fb } } = globalThis;
  const { w: { Array: { from: viaBesideSibling = fb } }, z } = { w: globalThis, z: 1 };
  assert.deepEqual(viaAlias('ab'), ['a', 'b']);
  assert.deepEqual(viaComputed('ab'), ['a', 'b']);
  assert.deepEqual(viaHop('ab'), ['a', 'b']);
  assert.deepEqual(viaBesideSibling('ab'), ['a', 'b']);
  assert.same(z, 1);
  const log = [];
  function eff() {
    log.push('eff');
    return Object;
  }
  const { w: { keys: viaCall }, q: q1 } = { w: eff(), q: 1 };
  const { w: { keys: viaNullish }, q: q2 } = { w: eff() ?? Object, q: 2 };
  const { w: { keys: viaOr }, q: q3 } = { w: eff() || {}, q: 3 };
  const { w: { keys: viaTernary }, q: q4 } = { w: q3 ? eff() : Object, q: 4 };
  assert.deepEqual(viaCall({ a: 1 }), ['a']);
  assert.deepEqual(viaNullish({ a: 1 }), ['a']);
  assert.deepEqual(viaOr({ a: 1 }), ['a']);
  assert.deepEqual(viaTernary({ a: 1 }), ['a']);
  assert.deepEqual([q1, q2, q3, q4], [1, 2, 3, 4]);
  assert.deepEqual(log, ['eff', 'eff', 'eff', 'eff']);
});

// a hop whose level keeps siblings splits out beside the host: the leaf still binds the polyfill,
// the siblings still bind off the root, and a user root's getters fire in the source's order
QUnit.test('destructuring: nested twin beside siblings of its level', assert => {
  const { of: { name: hopFirst, foo: f1 }, from: F1 } = Array;
  const { from: F2, of: { name: hopLast, foo: f2 }, isArray: I } = Array;
  const { Array: { of: { name: viaProxy, foo: f3 }, junk }, more } = globalThis;
  assert.same(hopFirst, 'of');
  assert.same(hopLast, 'of');
  assert.same(viaProxy, 'of');
  assert.deepEqual([f1, f2, f3, junk, more], [undefined, undefined, undefined, undefined, undefined]);
  assert.deepEqual(F1('ab'), ['a', 'b']);
  assert.deepEqual(F2('ab'), ['a', 'b']);
  assert.true(I([]));
  const log = [];
  const box = {};
  Object.defineProperties(box, {
    y: {
      get() {
        log.push('y');
        return [1, 2];
      },
    },
    junk: {
      get() {
        log.push('junk');
        return 'j';
      },
    },
  });
  const { y: { at: yFirst, other: o1 }, junk: j1 } = box;
  const { junk: j2, y: { at: yLast, other: o2 } } = box;
  assert.same(yFirst.call([1, 2], -1), 2);
  assert.same(yLast.call([1, 2], -1), 2);
  assert.deepEqual([o1, o2, j1, j2], [undefined, undefined, 'j', 'j']);
  assert.deepEqual(log, ['y', 'junk', 'junk', 'y']);
});

/* eslint-disable es/no-accessor-properties -- ordinary getters expose the order of nested extraction */
QUnit.test('destructuring: a nested read stays between earlier and later user getters', assert => {
  const log = [];
  const source = {
    get before() { log.push('before'); return 1; },
    get slot() { log.push('slot'); return [4, 8]; },
    get after() { log.push('after'); return 2; },
  };
  const { before, slot: { at }, after } = source;
  assert.deepEqual(log, ['before', 'slot', 'after']);
  assert.same(at.call([4, 8], -1), 8);
  assert.deepEqual([before, after], [1, 2]);
});
/* eslint-enable es/no-accessor-properties -- end of nested extraction order */

QUnit.test('destructuring: retained static assignments keep key and binding order', assert => {
  const log = [];
  // eslint-disable-next-line @stylistic/one-var-declaration-per-line -- the assignment target has an observable previous value
  let method = null, next, rest;
  // eslint-disable-next-line es/no-nonstandard-array-properties -- the missing sibling fires its default after the static assignment
  ({ [(log.push(typeof method), 'from')]: method, next = (log.push(typeof method), 4), ...rest } = Array);
  assert.deepEqual(log, ['object', 'function']);
  assert.deepEqual(method('ab'), ['a', 'b']);
  assert.same(next, 4);
  assert.false(Object.hasOwn(rest, 'from'));
  assert.false(Object.hasOwn(rest, 'next'));
  let first;
  let isArray;
  const seen = [];
  const pureFrom = Array.from;
  // eslint-disable-next-line prefer-const -- the assignment route owns the default and key order
  ({ [(seen.push(typeof first), 'from')]: first = null, [(seen.push(typeof first), 'isArray')]: isArray } = Array);
  assert.deepEqual(seen, ['undefined', 'function']);
  assert.same(first, pureFrom);
  assert.true(isArray([]));
});

// an alias of a container slot binds the polyfilled static, whichever spelling declares it: the
// source's own, the destructure lowering's (`var _r$w = r.w, values = _r$w.values`), an index into a
// wrapper literal, the tail behind an effect prefix. the stripped realm has no native `Object.values`,
// so only the ponyfill answers
QUnit.test('destructuring: an alias of a container slot binds the static', assert => {
  const r = { w: Object, y: [1] };
  const alias = r.w;
  const viaAlias = alias.values;
  const loweredSlot = r.w;
  const viaLowered = loweredSlot.values;
  const loweredWrapper = [0, r];
  // eslint-disable-next-line prefer-destructuring -- the lowering's own index read is the shape under test
  const loweredElement = loweredWrapper[1];
  const loweredElementSlot = loweredElement.w;
  const viaLoweredWrapper = loweredElementSlot.values;
  const box = [r];
  const viaWrapper = box[0].w.values;
  const { w: { values: viaDestructure } } = r;
  let effects = 0;
  const seqAlias = (effects++, r.w);
  const viaSeqAlias = seqAlias.values;
  assert.same(effects, 1);
  for (const values of [viaAlias, viaLowered, viaLoweredWrapper, viaWrapper, viaDestructure, viaSeqAlias]) {
    assert.same(typeof values, 'function');
    assert.deepEqual(values({ a: 1, b: 2 }), [1, 2]);
  }
});

// a container declared in one lexical scope and a same-named container WRITTEN in a sibling scope
// are two bindings: the write taints its own, and the other's slot keeps binding the static - for a
// loop head, a block, a branch and a catch parameter shadowing the name alike. the stripped realm has none of these
// statics natively, so only the ponyfill answers
QUnit.test('destructuring: a same-named container in a sibling scope keeps its slots', assert => {
  const seen = [];
  for (const item of [{ w: Object }]) {
    const { values } = item.w;
    seen.push(values);
  }
  for (const item of [{ w: Array }]) item.w = Map;
  {
    const item = { w: Object };
    const { entries } = item.w;
    seen.push(entries);
  }
  {
    const item = { w: Array };
    item.w = Map;
  }
  if (seen.length) {
    const item = { w: Object };
    const { is } = item.w;
    seen.push(is);
  }
  if (seen.length) {
    const item = { w: Array };
    item.w = Map;
  }
  const holder = { w: Object };
  try {
    throw { w: Array };
  // eslint-disable-next-line unicorn/catch-error-name, no-shadow -- the shadowing catch parameter is the shape under test
  } catch (holder) {
    holder.w = Map;
  }
  const { assign } = holder.w;
  seen.push(assign);
  assert.same(seen.map(fn => typeof fn).join(','), 'function,function,function,function');
  assert.deepEqual(seen[0]({ a: 1 }), [1]);
  assert.deepEqual(seen[1]({ a: 1 }), [['a', 1]]);
  assert.true(seen[2](1, 1));
  assert.deepEqual(seen[3]({}, { a: 1 }), { a: 1 });
});

/* eslint-disable no-unreachable-loop -- the first iteration exposes the loop-head extraction order */

// Standalone post receives Babel's lowered destructuring instead of these source patterns.

export function readWrappedOpaque(make) {
  const [{ data: { at: method } }] = [make()];
  return method;
}

export function readWrappedRest(box) {
  const [{ y: { flat, ...rest } }] = [box];
  return [flat, rest];
}

export function readWrappedKey(box, key) {
  const [{ inner: { [(key(), 'flat')]: method } }] = [box];
  return method;
}

export function readWrappedLoopInit(box, effect) {
  for (let [, { y: { flat, ...rest } }] = [effect(), box, effect()]; ;) {
    return [flat, rest];
  }
}

export function readWrappedLoopHead(rows) {
  const nested = [{ y: rows }];
  for (const [{ y: { at, ...rest } }] of [nested]) return [at, rest];
}

export function readWrappedLoopSiblings(box, effect) {
  for (const [{ y: { at, other } }, value] = [box, effect()]; ;) return [at, other, value];
}

QUnit.test('destructuring array loop initializer captures elements before nested sibling reads', assert => {
  const events = [];
  const rows = [];
  function ownAt() { return 7; }
  readLoggedProperty(rows, 'at', events, ownAt);
  readLoggedProperty(rows, 'other', events, 9);
  const box = {};
  readLoggedProperty(box, 'y', events, rows);
  const result = readWrappedLoopSiblings(box, () => {
    events.push('effect');
    return 3;
  });
  assert.deepEqual(result, [ownAt, 9, 3]);
  assert.deepEqual(events, ['effect', 'y', 'at', 'other']);
  const plain = [3, 4];
  assert.same(readWrappedLoopSiblings({ y: plain }, () => 3)[0].call(plain, -1), 4);
});

export function readWrappedArrayFrom() {
  const [{ from, ...rest }] = [Array];
  return [from, rest];
}

function readLoggedProperty(source, name, events, value) {
  Object.defineProperty(source, name, {
    enumerable: true,
    configurable: true,
    get() {
      events.push(name);
      return value;
    },
  });
}

QUnit.test('destructuring array wrapper reads an excluded instance getter once', assert => {
  const events = [];
  const rows = [];
  function ownFlat() { return 7; }
  readLoggedProperty(rows, 'flat', events, ownFlat);
  readLoggedProperty(rows, 'extra', events, 9);
  const box = {};
  readLoggedProperty(box, 'y', events, rows);
  const result = readWrappedRest(box);
  assert.same(result[0], ownFlat);
  assert.deepEqual(result[1], { extra: 9 });
  assert.deepEqual(events, ['y', 'flat', 'extra']);
});

QUnit.test('destructuring array wrapper retains the native method beside rest', assert => {
  const rows = [[1], [2]];
  const result = readWrappedRest({ y: rows });
  assert.same(result[0], restArrayFlat);
  assert.same('flat' in result[1], false);
  assert.deepEqual(result[1], { 0: [1], 1: [2] });
});

testUnlessDetectLowered('destructuring array wrapper keeps key effects before one slot read', assert => {
  const events = [];
  const rows = [];
  function ownFlat() { return 7; }
  readLoggedProperty(rows, 'flat', events, ownFlat);
  const box = {};
  readLoggedProperty(box, 'inner', events, rows);
  assert.same(readWrappedKey(box, () => events.push('key')), ownFlat);
  assert.deepEqual(events, ['inner', 'key', 'flat']);
  events.length = 0;
  assert.throws(() => readWrappedKey({ inner: null }, () => events.push('key')), TypeError);
  assert.deepEqual(events, []);
});

QUnit.test('destructuring retained array wrapper keeps loop initializer effects before reads', assert => {
  const events = [];
  const rows = [];
  function ownFlat() { return 7; }
  readLoggedProperty(rows, 'flat', events, ownFlat);
  readLoggedProperty(rows, 'extra', events, 9);
  const box = {};
  readLoggedProperty(box, 'y', events, rows);
  const result = readWrappedLoopInit(box, () => events.push('effect'));
  assert.same(result[0], ownFlat);
  assert.deepEqual(result[1], { extra: 9 });
  assert.deepEqual(events, ['effect', 'effect', 'y', 'flat', 'extra']);
});

QUnit.test('destructuring relocated array loop head reads its captured element once', assert => {
  const events = [];
  const rows = [];
  function ownAt() { return 7; }
  readLoggedProperty(rows, 'at', events, ownAt);
  readLoggedProperty(rows, 'extra', events, 9);
  const result = readWrappedLoopHead(rows);
  assert.same(result[0], ownAt);
  assert.deepEqual(result[1], { extra: 9 });
  assert.deepEqual(events, ['at', 'extra']);
  const plain = [3, 4];
  assert.same(readWrappedLoopHead(plain)[0], restArrayAt);
});

QUnit.test('destructuring retained array wrapper preserves its static receiver', assert => {
  const result = readWrappedArrayFrom();
  assert.deepEqual(result[0]({ 0: 7, length: 1 }), [7]);
  assert.same('from' in result[1], false);
});

QUnit.test('destructuring opaque array element retains one call and dispatches its nested method', assert => {
  const events = [];
  const rows = [3, 4];
  const method = readWrappedOpaque(() => {
    events.push('make');
    return { data: rows };
  });
  assert.same(method.call(rows, -1), 4);
  assert.deepEqual(events, ['make']);
  events.length = 0;
  function ownAt() { return 7; }
  const receiver = {};
  readLoggedProperty(receiver, 'at', events, ownAt);
  const box = {};
  readLoggedProperty(box, 'data', events, receiver);
  assert.same(readWrappedOpaque(() => {
    events.push('make');
    return box;
  }), ownAt);
  assert.deepEqual(events, ['make', 'data', 'at']);
  events.length = 0;
  assert.throws(() => readWrappedOpaque(() => {
    events.push('make');
    return { data: null };
  }), TypeError);
  assert.deepEqual(events, ['make']);
});
/* eslint-enable no-unreachable-loop -- end of the source forms above */

// Exported helpers keep the caller's receiver opaque to the transform.
// Standalone post receives Babel's lowered destructuring instead of these source patterns.

export function readConditionalAssignment(receiver, enabled, log) {
  let value;
  enabled && (log.push('prefix'), { at: value } = receiver, log.push('tail'));
  return value;
}

QUnit.test('destructuring assignment keeps a sequence prefix inside its condition', assert => {
  const log = [];
  const receiver = Object.defineProperty({}, 'at', {
    get() { log.push('read'); return 17; },
  });
  assert.same(readConditionalAssignment(receiver, false, log), undefined);
  assert.deepEqual(log, []);
  assert.same(readConditionalAssignment(receiver, true, log), 17);
  assert.deepEqual(log, ['prefix', 'read', 'tail']);
});

export function readComputedReceiver(factory, key) {
  const { [(key(), 'at')]: value } = factory();
  return value;
}

export function readComputedDefault(factory, key, fallback) {
  const { [(key(), 'at')]: value = fallback() } = factory();
  return value;
}

QUnit.test('destructuring computed key runs between the initializer and its one property read', assert => {
  const log = [];
  const receiver = Object.defineProperty({}, 'at', {
    get() {
      log.push('read');
      return 17;
    },
  });
  const value = readComputedReceiver(() => {
    log.push('receiver');
    return receiver;
  }, () => log.push('key'));
  assert.same(value, 17);
  assert.deepEqual(log, ['receiver', 'key', 'read']);
});

testUnlessDetectLowered('destructuring rejects null before evaluating the computed key', assert => {
  let keys = 0;
  assert.throws(() => readComputedReceiver(() => null, () => keys++), TypeError);
  assert.same(keys, 0);
});

QUnit.test('destructuring computed key still supplies the instance ponyfill', assert => {
  let keys = 0;
  const receiver = [7, 8];
  const method = readComputedReceiver(() => receiver, () => keys++);
  assert.same(method.call(receiver, -1), 8);
  assert.same(keys, 1);
});

QUnit.test('destructuring keeps the initializer value when a computed key reassigns its source', assert => {
  const original = { at: 21 };
  let receiver = original;
  const value = readComputedReceiver(() => receiver, () => {
    receiver = { at: 42 };
  });
  assert.same(value, 21);
  assert.same(receiver.at, 42);
});

QUnit.test('destructuring computed key precedes the getter throw and its default runs only for undefined', assert => {
  const log = [];
  const receiver = Object.defineProperty({}, 'at', {
    get() {
      log.push('read');
      return undefined;
    },
  });
  const value = readComputedDefault(() => receiver, () => log.push('key'), () => {
    log.push('default');
    return 31;
  });
  assert.same(value, 31);
  assert.deepEqual(log, ['key', 'read', 'default']);
  log.length = 0;
  assert.throws(() => readComputedReceiver(() => Object.defineProperty({}, 'at', {
    get() {
      log.push('throw');
      throw new RangeError('receiver');
    },
  }), () => log.push('key')), RangeError);
  assert.deepEqual(log, ['key', 'throw']);
  log.length = 0;
  assert.throws(() => readComputedReceiver(() => receiver, () => {
    log.push('key-throw');
    throw new RangeError('key');
  }), RangeError);
  assert.deepEqual(log, ['key-throw']);
});

/* eslint-disable es/no-accessor-properties -- the getter body and read order are under test */

QUnit.test('destructuring: retained getter locals precede the guarded assignment', assert => {
  const order = [];
  let Value = 'before';
  let first;
  let last;
  ({ first, realm: { WeakSet: Value }, last } = {
    get first() { order.push('first'); return 1; },
    get realm() {
      order.push('realm');
      const type = typeof Value;
      order.push(type);
      return globalThis;
    },
    get last() { order.push(typeof Value); return 2; },
  });
  const key = {};
  const set = new Value();
  set.add(key);
  assert.true(set.has(key), 'the guarded constructor works without a native WeakSet');
  assert.deepEqual(order, ['first', 'realm', 'string', 'function']);
  assert.deepEqual([first, last], [1, 2]);
});

QUnit.test('destructuring: getter locals keep their own returned value', assert => {
  const order = [];
  const { realm: { WeakSet: Value } } = {
    get realm() {
      // eslint-disable-next-line object-shorthand -- the property must hold a constructable function
      const globalThis = { WeakSet: function () { this.value = 41; } };
      order.push('realm');
      return globalThis;
    },
  };
  assert.same(new Value().value, 41, 'a getter-local realm is not the global object');
  assert.deepEqual(order, ['realm']);
});
/* eslint-enable es/no-accessor-properties -- end of the source forms above */

/* eslint-disable es/no-accessor-properties -- getter reads are the behavior under test */

QUnit.test('destructuring: effectful getters retain their constructor slots', assert => {
  const order = [];
  const { w: { WeakSet: Direct } } = {
    get w() { order.push('direct'); return globalThis; },
  };
  const held = {
    get w() { order.push('alias'); return globalThis; },
  };
  const { w: { WeakSet: Aliased } } = held;
  let Assigned = 'before';
  ({ w: { WeakSet: Assigned } } = {
    get w() { order.push(Assigned); return globalThis; },
  });
  const key = {};
  const direct = new Direct();
  const aliased = new Aliased();
  const assigned = new Assigned();
  direct.add(key);
  aliased.add(key);
  assigned.add(key);
  assert.true(direct.has(key), 'direct getter supplies the constructor in a stripped realm');
  assert.true(aliased.has(key), 'an alias preserves the getter read');
  assert.true(assigned.has(key), 'the assignment supplies the constructor');
  assert.deepEqual(order, ['direct', 'alias', 'before'], 'each getter runs once before its binding changes');
});

QUnit.test('destructuring: overridden and throwing getter slots keep their effects', assert => {
  let reads = 0;
  const held = {
    get w() {
      reads += 1;
      throw new Error('getter stopped');
    },
  };
  assert.throws(() => {
    const { w: { WeakSet: Value } } = held;
    return Value;
  }, /getter stopped/);
  assert.same(reads, 1, 'abrupt completion runs the getter exactly once');
  const replacement = { WeakSet: 'custom' };
  const override = { w: replacement };
  const { w: { WeakSet: Overridden } } = {
    get w() { reads += 1; return globalThis; },
    ...override,
  };
  assert.same(Overridden, 'custom', 'the overriding property still supplies the binding');
  assert.same(reads, 1, 'the overridden getter never runs');
});

QUnit.test('destructuring: getter slot binding stays between sibling reads', assert => {
  const order = [];
  let Value = 'before';
  let leading;
  let trailing;
  ({ leading, w: { WeakSet: Value }, trailing } = {
    get leading() { order.push(Value); return 1; },
    get w() { order.push(Value); return globalThis; },
    get trailing() { order.push(typeof Value); return 2; },
  });
  const key = {};
  const set = new Value();
  set.add(key);
  assert.true(set.has(key), 'the middle slot still supplies the ponyfill');
  assert.deepEqual(order, ['before', 'before', 'function'], 'reads and binding interleave in source order');
  assert.same(leading, 1);
  assert.same(trailing, 2);
});
/* eslint-enable es/no-accessor-properties -- end of the source forms above */

/* eslint-disable es/no-accessor-properties -- getter order is the source behavior under test */

export function readChangedContainer(change) {
  const box = { value: Object };
  change(box);
  const { value: { entries: method } } = box;
  return method;
}

export function readRealmIteratorWithStatic() {
  const obj = globalThis;
  const { Array: { from }, [Symbol.iterator]: iter, ...rest } = obj;
  return [from, iter, rest];
}

export function readArrayIteratorBeforeStatic() {
  const { [Symbol.iterator]: it, from, ...rest } = globalThis.Array;
  return [it, from, rest];
}

QUnit.test('destructuring: an array capture registers its static receiver', assert => {
  const [{ [Symbol.iterator]: it, of: o, ...rest }] = [Array];
  assert.deepEqual(o(1), [1]);
  assert.same(Object.getOwnPropertyDescriptor(rest, 'of'), undefined);
  assert.same(Object.getOwnPropertyDescriptor(rest, Symbol.iterator), undefined);
  assert.same(it, undefined);
});

QUnit.test('destructuring: a static before an iterator shares the rest capture', assert => {
  const log = [];
  const [{ from, [Symbol.iterator]: it, ...rest }] = [(log.push('source'), Array)];
  assert.same(from, POST_LOWERED ? Array.from : nativeArrayFrom);
  assert.same(it, undefined);
  assert.same(Object.getOwnPropertyDescriptor(rest, 'from'), undefined);
  assert.same(Object.getOwnPropertyDescriptor(rest, Symbol.iterator), undefined);
  assert.deepEqual(log, ['source']);
});

export function readNestedRealmIterator() {
  const { w: { [Symbol.iterator]: method }, ...rest } = { w: globalThis, value: 3 };
  return [method, rest];
}

QUnit.test('destructuring: a nested default follows its captured source and preceding sibling', assert => {
  for (const value of [[7], undefined]) {
    const order = [];
    const box = {
      get junk() { order.push('junk'); return 1; },
      get y() { order.push('y'); return value; },
    };
    const { junk, y: { at: method, length } = (order.push('default'), [9]) } = box;
    assert.same(junk, 1);
    assert.same(length, 1);
    assert.same(method.call([3], 0), 3);
    assert.deepEqual(order, value === undefined ? ['junk', 'y', 'default'] : ['junk', 'y']);
  }
});

QUnit.test('destructuring: a constructor guard retains instance dispatch for a replaced container slot', assert => {
  const rows = [3];
  const method = readChangedContainer(box => { box.value = rows; });
  assert.deepEqual(Array.from(method.call(rows)), [[0, 3]]);
  const staticMethod = readChangedContainer(box => box);
  assert.deepEqual(staticMethod({ answer: 42 }), [['answer', 42]]);
  let reads = 0;
  function custom() { return 9; }
  const customMethod = readChangedContainer(box => {
    box.value = {
      get entries() { reads++; return custom; },
    };
  });
  assert.same(customMethod, custom);
  assert.same(reads, 1);
  assert.throws(() => readChangedContainer(box => { box.value = null; }), TypeError);
});

QUnit.test('destructuring: nested guarded slots initialize before trailing getters', assert => {
  const order = [];
  const { leading, box: { first, realm: { WeakSet: Value }, last }, trailing } = {
    get leading() { order.push('outer-before'); return 1; },
    get box() {
      order.push('box');
      return {
        get first() { order.push('inner-before'); return 2; },
        get realm() { order.push('realm'); return globalThis; },
        get last() { order.push(typeof Value); return 3; },
      };
    },
    get trailing() { order.push(typeof Value); return 4; },
  };
  const key = {};
  const set = new Value();
  set.add(key);
  assert.true(set.has(key), 'the nested slot supplies the constructor in a stripped realm');
  assert.deepEqual(order, ['outer-before', 'box', 'inner-before', 'realm', 'function', 'function']);
  assert.deepEqual([leading, first, last, trailing], [1, 2, 3, 4]);
});

QUnit.test('destructuring: separate guarded slots retain their source order', assert => {
  const order = [];
  let SetValue = 'set-before';
  let MapValue = 'map-before';
  let middle;
  let last;
  ({ set: { WeakSet: SetValue }, middle, map: { WeakMap: MapValue }, last } = {
    get set() { order.push(SetValue); return globalThis; },
    get middle() { order.push(typeof SetValue, MapValue); return 1; },
    get map() { order.push(MapValue); return globalThis; },
    get last() { order.push(typeof MapValue); return 2; },
  });
  const key = {};
  const set = new SetValue();
  const map = new MapValue();
  set.add(key);
  map.set(key, 3);
  assert.true(set.has(key));
  assert.same(map.get(key), 3);
  assert.deepEqual(order, ['set-before', 'function', 'map-before', 'map-before', 'function']);
  assert.deepEqual([middle, last], [1, 2]);
});

QUnit.test('destructuring: a default cannot redirect later guarded siblings', assert => {
  const order = [];
  let source = {
    get leading() { order.push('leading'); return undefined; },
    get realm() { order.push('realm'); return globalThis; },
    get trailing() { order.push('trailing'); return 2; },
  };
  const { leading = (source = { trailing: 'wrong' }, Array.of(1)[0]), realm: { WeakSet: Value }, trailing } = source;
  const key = {};
  const set = new Value();
  set.add(key);
  assert.true(set.has(key));
  assert.deepEqual(order, ['leading', 'realm', 'trailing']);
  assert.deepEqual([leading, trailing, source.trailing], [1, 2, 'wrong']);
});

QUnit.test('destructuring: a guarded assignment still yields its original receiver', assert => {
  const order = [];
  let Value = 'before';
  let first;
  let last;
  const source = {
    get first() { order.push(Value); return 1; },
    get realm() { order.push(Value); return globalThis; },
    get last() { order.push(typeof Value); return 2; },
  };
  const returned = { first, realm: { WeakSet: Value }, last } = source;
  const key = {};
  const set = new Value();
  set.add(key);
  assert.true(set.has(key));
  assert.same(returned, source, 'the assignment yields the source object');
  assert.deepEqual(order, ['before', 'before', 'function']);
  assert.deepEqual([first, last], [1, 2]);
});

QUnit.test('destructuring: ordinary reads share the guarded sibling schedule', assert => {
  const order = [];
  const { at: first, realm: { WeakSet: Value }, includes: last } = {
    get at() {
      order.push('first');
      return function () { return 41; };
    },
    get realm() { order.push(typeof first); return globalThis; },
    get includes() {
      order.push(typeof Value);
      return function () { return 42; };
    },
  };
  const key = {};
  const set = new Value();
  set.add(key);
  assert.true(set.has(key));
  assert.same(first(), 41);
  assert.same(last(), 42);
  assert.deepEqual(order, ['first', 'function', 'function']);
});

QUnit.test('destructuring: an earlier nested dispatch cannot hide a later guard', assert => {
  const order = [];
  const { array: { at: first }, realm: { WeakSet: Value }, tail } = {
    array: [41],
    get realm() { order.push(typeof first); return globalThis; },
    get tail() { order.push(typeof Value); return 3; },
  };
  const key = {};
  const set = new Value();
  set.add(key);
  assert.true(set.has(key));
  assert.same(first.call([41], 0), 41, 'the earlier method is polyfilled too');
  assert.deepEqual(order, ['function', 'function']);
  assert.same(tail, 3);
});

export function readIteratorPatternSiblings(input, order) {
  const { [(order.push('key'), 'lead')]: lead, [Symbol.iterator]: { missing = (order.push('default'), 7) }, tail } = input;
  return [lead, missing, tail];
}

for (const mode of ['value', 'null', 'throw']) {
  QUnit.test(`destructuring: iterator pattern siblings preserve order (${ mode })`, assert => {
    const order = [];
    const source = {
      get lead() { order.push('lead'); return 1; },
      get [Symbol.iterator]() {
        order.push('iterator');
        if (mode === 'throw') throw new Error('sentinel');
        return mode === 'null' ? null : function () { /* empty */ };
      },
      get tail() { order.push('tail'); return 2; },
    };
    if (mode === 'value') {
      assert.deepEqual(readIteratorPatternSiblings(source, order), [1, 7, 2]);
      assert.deepEqual(order, ['key', 'lead', 'iterator', 'default', 'tail']);
    } else {
      assert.throws(() => readIteratorPatternSiblings(source, order));
      assert.deepEqual(order, ['key', 'lead', 'iterator']);
    }
  });
}
/* eslint-enable es/no-accessor-properties -- end of the source forms above */

/* eslint-disable es/no-accessor-properties -- getter order is the source behavior under test */
QUnit.test('destructuring: nested assignment reads its native slot before rest', assert => {
  const log = [];
  let at;
  let rest;
  const source = {
    get w() { log.push('w'); return [1, 2]; },
    get z() { log.push(typeof at); return 3; },
  };
  const returned = { w: { at }, ...rest } = source;
  assert.same(at, restArrayAt);
  assert.deepEqual(rest, { z: 3 });
  assert.same(returned, source);
  assert.deepEqual(log, ['w', typeof restArrayAt]);
});
/* eslint-enable es/no-accessor-properties -- end of the source forms above */

/* eslint-disable es/no-accessor-properties -- getter order and single evaluation are the source forms under test */

// Standalone post receives Babel's lowered destructuring instead of these source patterns.

export function captureBesideInner(source, key) {
  const { q, p: { [(key(), 'flat')]: method, other } } = source;
  return [method, other, q];
}

function captureOpaque(make, outer, leaf) {
  const { [(outer(), 'w')]: { [(leaf(), 'at')]: method } } = make();
  return method;
}

function captureLiteral(receiver, outer, leaf) {
  const { [(outer(), 'w')]: { [(leaf(), 'at')]: method } } = { w: receiver };
  return method;
}

function captureAncestor(make, outer) {
  const { [(outer(), 'w')]: { at: method } } = make();
  return method;
}

export function captureBesideOuter(receiver, events) {
  const { y: { [(events.push('key'), 'flat')]: method }, q } = {
    y: (events.push('source'), receiver), q: 9,
  };
  return [method, q];
}

QUnit.test('destructuring: an outer sibling keeps the nested key before its single getter read', assert => {
  const events = [];
  function ownFlat() { return 7; }
  const receiver = {
    get flat() { events.push('get'); return ownFlat; },
  };
  const result = captureBesideOuter(receiver, events);
  assert.deepEqual(events, ['source', 'key', 'get']);
  assert.same(result[0], ownFlat);
  assert.same(result[1], 9);
  events.length = 0;
  const rows = [1, [2]];
  const arrayResult = captureBesideOuter(rows, events);
  assert.deepEqual(events, ['source', 'key']);
  assert.deepEqual(arrayResult[0].call(rows), [1, 2]);
});

QUnit.test('destructuring: nested computed keys keep receiver, hop and leaf reads in order', assert => {
  const events = [];
  const rows = [3, 4];
  const receiver = {
    get w() { events.push('hop'); return rows; },
  };
  const method = captureOpaque(
    () => { events.push('make'); return receiver; },
    () => { events.push('outer'); },
    () => { events.push('leaf'); },
  );
  assert.deepEqual(events, ['make', 'outer', 'hop', 'leaf']);
  assert.same(method.call(rows, -1), 4);
  events.length = 0;
  const literalMethod = captureLiteral(
    rows, () => { events.push('outer'); }, () => { events.push('leaf'); },
  );
  assert.deepEqual(events, ['outer', 'leaf']);
  assert.same(literalMethod.call(rows, 0), 3);
});

QUnit.test('destructuring: nested capture reads a custom leaf getter once', assert => {
  const events = [];
  function ownAt() { return 7; }
  const receiver = {
    get at() { events.push('read'); return ownAt; },
  };
  const method = captureOpaque(
    () => ({ get w() { events.push('hop'); return receiver; } }),
    () => { events.push('outer'); },
    () => { events.push('leaf'); },
  );
  assert.deepEqual(events, ['outer', 'hop', 'leaf', 'read']);
  assert.same(method, ownAt);
});

testUnlessDetectLowered('destructuring: null capture throws before the key at that level', assert => {
  const events = [];
  function outer() { events.push('outer'); }
  function leaf() { events.push('leaf'); }
  assert.throws(() => captureOpaque(() => null, outer, leaf), TypeError);
  assert.deepEqual(events, []);
  assert.throws(() => captureOpaque(() => ({
    get w() { events.push('hop'); return null; },
  }), outer, leaf), TypeError);
  assert.deepEqual(events, ['outer', 'hop']);
  events.length = 0;
  assert.throws(() => captureAncestor(() => ({
    get w() { events.push('hop'); return null; },
  }), outer), TypeError);
  assert.deepEqual(events, ['outer', 'hop']);
});

QUnit.test('destructuring: an outer computed key cannot replace the captured receiver', assert => {
  const events = [];
  const rows = [3, 4];
  // eslint-disable-next-line no-useless-assignment -- the RHS captures this value before the pattern key replaces it
  let receiver = {
    get w() { events.push('original'); return rows; },
  };
  const replacement = {
    get w() { events.push('replacement'); return []; },
  };
  const { [(events.push('outer'), receiver = replacement, 'w')]: { [(events.push('leaf'), 'at')]: method } } = receiver;
  assert.deepEqual(events, ['outer', 'original', 'leaf']);
  assert.same(receiver, replacement);
  assert.same(method.call(rows, -1), 4);
});

export function captureDefaultedInner(box, spare, log) {
  const { inner: { [(log.push('key'), 'flat')]: method } = spare } = box;
  return method;
}

QUnit.test('destructuring: a defaulted nested slot reads its getter before the computed leaf once', assert => {
  const events = [];
  function ownFlat() { return 7; }
  const receiver = {
    get flat() { events.push('flat'); return ownFlat; },
  };
  const spare = {
    get flat() { events.push('spare'); return ownFlat; },
  };
  const method = captureDefaultedInner({
    get inner() { events.push('inner'); return receiver; },
  }, spare, events);
  assert.same(method, ownFlat);
  assert.deepEqual(events, ['inner', 'key', 'flat']);

  events.length = 0;
  const rows = [1, [2]];
  const arrayMethod = captureDefaultedInner({
    get inner() { events.push('inner'); return rows; },
  }, spare, events);
  assert.deepEqual(events, ['inner', 'key']);
  assert.deepEqual(arrayMethod.call(rows), [1, 2], 'the selected array method works in a stripped realm');
});

QUnit.test('destructuring: an undefined nested slot reads the fallback getter after its key', assert => {
  const events = [];
  function fallbackFlat() { return 9; }
  const method = captureDefaultedInner({
    get inner() { events.push('inner'); return undefined; },
  }, {
    get flat() { events.push('fallback-flat'); return fallbackFlat; },
  }, events);
  assert.same(method, fallbackFlat);
  assert.deepEqual(events, ['inner', 'key', 'fallback-flat']);
});

testUnlessDetectLowered('destructuring: a null nested slot suppresses its key and fallback reads', assert => {
  const events = [];
  const spare = {
    get flat() { events.push('fallback-flat'); return 9; },
  };
  assert.throws(() => captureDefaultedInner({
    get inner() { events.push('inner'); return null; },
  }, spare, events), TypeError);
  assert.deepEqual(events, ['inner']);
  events.length = 0;
  assert.throws(() => captureDefaultedInner(null, spare, events), TypeError);
  assert.deepEqual(events, []);
});

testUnlessDetectLowered('destructuring: inner siblings keep the computed key before one getter read', assert => {
  const events = [];
  function ownFlat() { return 7; }
  const receiver = {
    get flat() { events.push('flat'); return ownFlat; },
    get other() { events.push('other'); return 9; },
  };
  const source = {
    get q() { events.push('q'); return 1; },
    get p() { events.push('p'); return receiver; },
  };
  assert.deepEqual(captureBesideInner(source, () => events.push('key')), [ownFlat, 9, 1]);
  assert.deepEqual(events, ['q', 'p', 'key', 'flat', 'other']);
  events.length = 0;
  const rows = [1, [2]];
  const result = captureBesideInner({ q: 1, p: rows }, () => events.push('key'));
  assert.deepEqual(result[0].call(rows), [1, 2]);
  assert.deepEqual(events, ['key']);
  events.length = 0;
  assert.throws(() => captureBesideInner({ q: 1, p: null }, () => events.push('key')), TypeError);
  assert.deepEqual(events, []);
});
/* eslint-enable es/no-accessor-properties -- end of the source forms above */

// A constructor's instance slot is polyfilled whether its receiver is spelled bare or through
// the realm. Wrapped constructors do not promise a particular name, only the string API.
QUnit.test('destructuring: instance slot off a proxy constructor argument', assert => {
  // eslint-disable-next-line no-unused-vars -- the sibling parameter shadows the constructor name
  const name = function ({ name: value }, Symbol) { return value; }(globalThis.Symbol);
  assert.same(typeof name, 'string');
});

QUnit.test('destructuring: instance slot off a computed proxy constructor', assert => {
  const realm = globalThis;
  // eslint-disable-next-line dot-notation -- the computed constructor spelling is under test
  const name = (({ name: value }) => value)(realm['Symbol']);
  assert.same(typeof name, 'string');
});

QUnit.test('destructuring: proxy constructor default respects the caller', assert => {
  function read({ name } = globalThis.Symbol) { return name; }
  assert.same(typeof read(), 'string');
  assert.same(read({ name: 'caller' }), 'caller');
});

// Exported helpers keep the source opaque while the computed member is polyfilled.
// Standalone post receives Babel's lowered destructuring instead of these source patterns.

export function readRetainedSlots(factory, key, fallback) {
  const { before = fallback('before'), [(key(), 'at')]: value = fallback('value'), after = fallback('after'), ...rest } = factory();
  return [before, value, after, rest];
}

QUnit.test('Retained outer static sibling survives an instance capture', assert => {
  let held;
  const log = [];
  const [{ Array: { prototype: { at } }, Object: { keys }, other }] = [held = (log.push('source'), globalThis)];
  assert.same(at.call([4, 8], -1), 8);
  assert.deepEqual(keys({ a: 1 }), ['a']);
  assert.same(other, undefined);
  assert.same(held, globalThis);
  assert.deepEqual(log, ['source']);
});

QUnit.test('Retained sibling capture stops at a throwing initializer', assert => {
  let held = null;
  const log = [];
  const error = new Error('source');
  function effect() {
    log.push('source');
    throw error;
  }
  assert.throws(() => {
    const [{ Array: { prototype: { at } }, Object: { keys }, other }] = [held = (effect(), globalThis)];
    log.push(at, keys, other);
  }, value => value === error);
  assert.same(held, null);
  assert.deepEqual(log, ['source']);
});

/* eslint-disable es/no-accessor-properties -- user getter order is the behavior under test */
QUnit.test('Guarded sibling capture preserves user getters and queued claims', assert => {
  let held;
  const log = [];
  const source = {
    get Array() { log.push('Array'); return Array; },
    get Object() { log.push('Object'); return Object; },
    get other() { log.push('other'); return 7; },
  };
  const { from } = Array,
        { Array: { prototype: { at } }, Object: { keys }, other } = held = (log.push('source'), source);
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.same(at.call([4, 8], -1), 8);
  assert.deepEqual(keys({ a: 1 }), ['a']);
  assert.same(other, 7);
  assert.same(held, source);
  assert.deepEqual(log, ['source', 'Array', 'Object', 'other']);
});

QUnit.test('Guarded sibling capture distinguishes a getter prototype from an overriding slot', assert => {
  function read(key) {
    const log = [];
    const source = {
      get C() { log.push('getter'); return Array; },
      [key]: String,
      get tail() { log.push('tail'); return 7; },
    };
    let held;
    const { C: { prototype: { includes } }, tail } = held = (log.push('source'), source);
    return [includes.call(['a', 'b'], 'a,b'), tail, held === source, log];
  }
  assert.deepEqual(read('other'), [false, 7, true, ['source', 'getter', 'tail']]);
  assert.deepEqual(read('C'), [true, 7, true, ['source', 'tail']]);
});

QUnit.test('Guarded sibling capture stops at a throwing user getter', assert => {
  const log = [];
  const error = new Error('Object');
  const source = {
    get Array() { log.push('Array'); return Array; },
    get Object() { log.push('Object'); throw error; },
    get other() { log.push('other'); return 7; },
  };
  let held;
  assert.throws(() => {
    const { Array: { prototype: { at } }, Object: { keys }, other } = held = (log.push('source'), source);
    log.push(at, keys, other);
  }, value => value === error);
  assert.same(held, source);
  assert.deepEqual(log, ['source', 'Array', 'Object']);
});
/* eslint-enable es/no-accessor-properties -- end of getter capture cases */

QUnit.test('Destructuring a wrapped method preserves calls on another receiver', assert => {
  const holder = { rows: ['a', 'b'], read() { return this.rows.includes('a,b'); } };
  const [{ read }] = [holder];
  assert.same(read.call({ rows: 'a,b' }), true);
  assert.same(read.call({ rows: ['a', 'b'] }), false);
});

QUnit.test('Computed instance read survives a preceding static declarator rewrite', assert => {
  const log = [];
  const { Array: { from } } = globalThis,
        { [(log.push('key'), 'at')]: at } = Array.prototype;
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.same(at.call([4, 8], -1), 8);
  assert.deepEqual(log, ['key']);
});

QUnit.test('Realm rest preserves a static sibling after a symbol claim', assert => {
  const [{ [Symbol.iterator]: iterator, Array: { from }, ...rest }] = [globalThis];
  assert.same(iterator, undefined);
  assert.same(from, POST_LOWERED ? Array.from : nativeArrayFrom);
  assert.same('Array' in rest, false);
  assert.same(Symbol.iterator in rest, false);
});

export function assignMixedRetainedSlots(factory, key, target, restTarget, fallback) {
  let value;
  const result = { before: target('before').value, [(key(), 'at')]: value = fallback(), after: target('after').value, ...restTarget().value } = factory();
  return [result, value];
}

export function assignRetainedSlots(factory, key, target, restTarget, fallback) {
  let before;
  let after;
  const result = { before, [(key(), 'at')]: target().value = fallback(), after, ...restTarget().value } = factory();
  return [result, before, after];
}

export function assignBareRetainedSlots(factory, key, target, restTarget) {
  return { [(key(), 'at')]: target().value, ...restTarget().value } = factory();
}

export function assignPlainMemberSlots(factory, target) {
  return { before: target().x, at: target().y } = factory();
}

export function readAliasedRetainedKeys(factory) {
  const firstKey = 'at';
  const secondKey = 'flat';
  const { [firstKey]: first, [secondKey]: second, [Symbol.iterator]: iterator, ...rest } = factory();
  return [first, second, iterator, rest];
}

QUnit.test('destructuring retained rest preserves aliased and symbol method keys', assert => {
  const source = [7, 8];
  const [first, second, iterator, rest] = readAliasedRetainedKeys(() => source);
  assert.same(first, restArrayAt);
  assert.same(second, restArrayFlat);
  if (POST_LOWERED || nativeArrayIterator) assert.deepEqual(iterator.call(source).next(), { value: 7, done: false });
  else assert.same(iterator, undefined);
  assert.deepEqual(rest, { 0: 7, 1: 8 });
});

QUnit.test('destructuring retained rest copies primitive string indices', assert => {
  const [before, method, after, rest] = readRetainedSlots(() => 'ab', () => 0, name => name);
  assert.same(before, 'before');
  assert.same(after, 'after');
  assert.same(method, restStringAt ?? 'value');
  assert.deepEqual(rest, { 0: 'a', 1: 'b' });
});

QUnit.test('destructuring plain member assignments evaluate the target before the null read throws', assert => {
  const log = [];
  assert.throws(() => assignPlainMemberSlots(() => null, () => log.push('target')), TypeError);
  assert.deepEqual(log, ['target']);
});

function recordGetter(source, name, log, value) {
  Object.defineProperty(source, name, {
    enumerable: true,
    get() {
      log.push(name);
      return value;
    },
  });
}

QUnit.test('destructuring retained slots bind the first getter result', assert => {
  const log = [];
  const source = { before: 10, after: 30, other: 40 };
  let reads = 0;
  Object.defineProperty(source, 'at', {
    enumerable: true,
    get() {
      log.push('at');
      return ++reads;
    },
  });
  const result = readRetainedSlots(() => source, () => log.push('key'), () => 'unexpected');
  assert.deepEqual(result, [10, 1, 30, { other: 40 }]);
  assert.deepEqual(log, ['key', 'at']);
  assert.same(reads, 1);
});

QUnit.test('destructuring retained slots keep the original receiver through key rebinding', assert => {
  const original = { before: 10, at: 20, after: 30, other: 40 };
  let source = original;
  const result = readRetainedSlots(() => source, () => {
    source = { before: 50, at: 60, after: 70, other: 80 };
  }, () => 'unexpected');
  assert.deepEqual(result, [10, 20, 30, { other: 40 }]);
  assert.same(source.other, 80);
});

if (!Symbol.sham) QUnit.test('destructuring retained rest copies enumerable symbol keys after string keys', assert => {
  const log = [];
  const symbol = Symbol('retained');
  const source = { before: 10, at: 20, after: 30 };
  recordGetter(source, 'other', log, 40);
  Object.defineProperty(source, symbol, {
    enumerable: true,
    get() {
      log.push('symbol');
      return 50;
    },
  });
  const { 3: rest } = readRetainedSlots(() => source, () => log.push('key'), () => 'unexpected');
  assert.deepEqual(log, ['key', 'other', 'symbol']);
  assert.same(rest[symbol], 50);
  assert.same(rest.other, 40);
});

QUnit.test('destructuring rest retains a native method or its default', assert => {
  const source = [7, 8];
  const result = readRetainedSlots(() => source, () => 0, () => 'missing');
  assert.same(result[1], restArrayAt ?? 'missing');
  assert.same(result[0], 'missing');
  assert.same(result[2], 'missing');
  assert.deepEqual(result[3], { 0: 7, 1: 8 });
});

QUnit.test('destructuring rest assignment retains a native method or its default', assert => {
  const source = [7, 8];
  const sink = {};
  const restSink = {};
  const result = assignMixedRetainedSlots(() => source, () => 0, () => sink, () => restSink, () => 'missing');
  assert.same(result[0], source);
  assert.same(result[1], restArrayAt ?? 'missing');
  assert.deepEqual(restSink.value, { 0: 7, 1: 8 });
});

export function readNamedRetainedDefault(factory, key) {
  const { [(key(), 'at')]: method = function () { /* empty */ }, after } = factory();
  return [method.name, after];
}

export function readEvalRetainedDefault(factory, key) {
  const local = 11;
  // eslint-disable-next-line no-eval -- the source default must keep its direct eval scope
  const { [(key(), 'at')]: method = eval('local'), after } = factory();
  return [method, after, local];
}

export function readRetainedDefaultBinding(factory, key) {
  let { [(key(), 'at')]: method = function () { return method; }, after } = factory();
  const original = method;
  method = 42;
  return [original(), after];
}

export function readNestedRetainedDefault(factory, key, fallback) {
  const { [(key(), 'w')]: { at: method } = fallback(), after } = factory();
  return [method, after];
}

// an engine without `Function.prototype.name` (the karma floor) infers no names, so the
// preservation claim has nothing to observe there
const FUNCTION_NAMES = !!Object.getOwnPropertyDescriptor(() => { /* empty */ }, 'name');
(FUNCTION_NAMES ? testUnlessDetectLowered : QUnit.skip)('destructuring retained defaults preserve inferred function names', assert => {
  const log = [];
  const source = {};
  recordGetter(source, 'at', log, undefined);
  recordGetter(source, 'after', log, 30);
  assert.deepEqual(readNamedRetainedDefault(() => source, () => log.push('key')), ['method', 30]);
  assert.deepEqual(log, ['key', 'at', 'after']);
});

QUnit.test('destructuring retained defaults preserve direct eval scope', assert => {
  const log = [];
  const source = {};
  recordGetter(source, 'at', log, undefined);
  recordGetter(source, 'after', log, 30);
  assert.deepEqual(readEvalRetainedDefault(() => source, () => log.push('key')), [11, 30, 11]);
  assert.deepEqual(log, ['key', 'at', 'after']);
});

QUnit.test('destructuring retained defaults preserve the outer function binding', assert => {
  const log = [];
  const source = {};
  recordGetter(source, 'at', log, undefined);
  recordGetter(source, 'after', log, 30);
  assert.deepEqual(readRetainedDefaultBinding(() => source, () => log.push('key')), [42, 30]);
  assert.deepEqual(log, ['key', 'at', 'after']);
});

QUnit.test('destructuring retained nested defaults run before extraction and later siblings', assert => {
  const log = [];
  const source = {};
  const rows = [7, 8];
  recordGetter(source, 'w', log, undefined);
  recordGetter(source, 'after', log, 30);
  const result = readNestedRetainedDefault(() => source, () => log.push('key'), () => {
    log.push('fallback');
    return rows;
  });
  assert.same(result[0].call(rows, -1), 8);
  assert.same(result[1], 30);
  assert.deepEqual(log, ['key', 'w', 'fallback', 'after']);
  log.length = 0;
  assert.throws(() => readNestedRetainedDefault(() => source, () => log.push('key'), () => {
    log.push('fallback');
    return null;
  }), TypeError);
  assert.deepEqual(log, ['key', 'w', 'fallback']);
});

QUnit.test('destructuring rest member target retains a native method or its default', assert => {
  const source = [7, 8];
  const sink = {};
  const restSink = {};
  const result = assignRetainedSlots(() => source, () => 0, () => sink, () => restSink, () => 'missing');
  assert.same(result[0], source);
  assert.same(sink.value, restArrayAt ?? 'missing');
  assert.deepEqual(restSink.value, { 0: 7, 1: 8 });
});

QUnit.test('destructuring rest member target retains the native method', assert => {
  const log = [];
  const source = [7, 8];
  const sink = {};
  const restSink = {};
  const result = assignBareRetainedSlots(() => source, () => log.push('key'), () => {
    log.push('target');
    return sink;
  }, () => {
    log.push('rest-target');
    return restSink;
  });
  assert.same(result, source);
  assert.same(sink.value, restArrayAt);
  assert.deepEqual(restSink.value, { 0: 7, 1: 8 });
  assert.deepEqual(log, ['key', 'target', 'rest-target']);
});

QUnit.test('destructuring plain member targets run before their getters without computed keys or rest', assert => {
  const log = [];
  const source = {};
  recordGetter(source, 'before', log, 10);
  recordGetter(source, 'at', log, 20);
  const sink = {};
  Object.defineProperties(sink, {
    x: { set(value) { log.push(`x-${ value }`); } },
    y: { set(value) { log.push(`y-${ value }`); } },
  });
  const result = assignPlainMemberSlots(() => {
    log.push('receiver');
    return source;
  }, () => {
    log.push('target');
    return sink;
  });
  assert.same(result, source);
  assert.deepEqual(log, ['receiver', 'target', 'before', 'x-10', 'target', 'at', 'y-20']);
  const rows = [7, 8];
  const target = {};
  assert.same(assignPlainMemberSlots(() => rows, () => target), rows);
  assert.same(target.y.call(rows, -1), 8);
});

export function readNestedStaticBranch(useGlobal, user) {
  const { Array: { from, ...rest } } = useGlobal ? globalThis : user;
  return [from, rest];
}

export function readUnknownConstructorSlot() {
  const { [Symbol.iterator]: iterator, Map: { custom }, ...rest } = globalThis;
  return [iterator, custom, rest];
}

let deferredStatic, deferredRest;
export const { entries: deferredEntries } = ({ Promise: { allSettled: deferredStatic, ...deferredRest } } = globalThis, Object);

QUnit.test('destructuring a deferred static assignment keeps the pure ancestor and rest exclusion', assert => {
  assert.same(typeof deferredStatic, 'function');
  assert.same(typeof deferredEntries, 'function');
  assert.same(Object.hasOwn(deferredRest, 'allSettled'), false);
});

QUnit.test('destructuring static candidates keep a selected user branch', assert => {
  const user = { Array: { extra: 17 } };
  const [from, rest] = readNestedStaticBranch(false, user);
  assert.same(from, undefined);
  assert.deepEqual(rest, { extra: 17 });
});

// the rest-bearing level reads its named slot natively off the ponyfill (`length`, not `name`:
// IE-safe arity - the floor has no `name` on functions and that level takes no polyfill)
QUnit.test('destructuring a static function with rest uses the ponyfill receiver', assert => {
  const { of: { length: methodArity, ...rest } } = Array;
  assert.same(methodArity, 0);
  assert.same(Object.hasOwn(rest, 'length'), false);
  const { name: ctorName, of: { length: nestedArity, ...nestedRest } } = Array;
  assert.same(typeof ctorName, 'string');
  assert.same(nestedArity, 0);
  assert.same(Object.hasOwn(nestedRest, 'length'), false);
});

// the ASSIGNMENT host dispatches an instance leaf under a static hop on the static's ponyfill, the
// declaration host's answer: the raw static is absent on the floor, and a re-anchored residual read
// the static off the narrow constructor entry (`_Map.groupBy` - undefined everywhere)
QUnit.test('destructuring assignment: an instance leaf under a static hop uses the ponyfill receiver', assert => {
  let name;
  let junk;
  ({ Array: { of: { name }, junk } } = globalThis);
  assert.same(typeof name, 'string', 'beside a surviving sibling');
  assert.same(junk, undefined, '... which keeps reading the constructor');
  ({ Array: { of: { name } } } = globalThis);
  assert.same(typeof name, 'string', 'as the sole slot');
  [{ Array: { of: { name } } }] = [globalThis];
  assert.same(typeof name, 'string', 'under an array wrapper');
  ({ Map: { groupBy: { name } } } = globalThis);
  assert.same(typeof name, 'string', 'off a constructor with a pure entry of its own');
});

QUnit.test('destructuring assignment: a typed user nav the claim owns dispatches on the nav', assert => {
  let at;
  const reads = [];
  const source = {};
  recordGetter(source, 'y', reads, [7, 8]);
  // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
  ({ y: { at } } = source);
  assert.same(at.call([7, 8], -1), 8);
  assert.deepEqual(reads, ['y'], 'the nav is read once');
});

QUnit.test('destructuring assignment: an anonymous default under a user nav fires where the dispatch reads undefined', assert => {
  let fallback;
  const foreign = { y: {} };
  // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
  ({ y: { at: fallback = () => -1 } } = foreign);
  assert.same(fallback(), -1);
});

(FUNCTION_NAMES ? testUnlessDetectLowered : QUnit.skip)('destructuring assignment: an anonymous default under a user nav keeps its inferred name', assert => {
  let fallback;
  // a receiver the type channel cannot name: a TYPED plain object claims nothing here (the
  // declaration host's answer, and a lowering of the native statement names nothing), so only the
  // emitted guard carries the inferred name through
  const foreign = JSON.parse('{"y":{}}');
  // eslint-disable-next-line prefer-const -- the assignment-host spelling is the case
  ({ y: { at: fallback = () => -1 } } = foreign);
  assert.same(fallback.name, 'fallback');
});

QUnit.test('catch parameter: a defaulted nav leaf beside a hop-level sibling', assert => {
  const source = { codes: {}, other: { x: 1 } };
  const seen = (() => {
    try {
      throw source;
    } catch ({ codes: { findIndex: m = () => -1 }, other }) {
      return [m(), other.x];
    }
  })();
  assert.deepEqual(seen, [-1, 1]);
  const arrays = { codes: [3, 4], other: { x: 2 } };
  const live = (() => {
    try {
      throw arrays;
    } catch ({ codes: { findIndex: m = () => -1 }, other }) {
      return [m.call([1, 2, 3], x => x === 2), other.x];
    }
  })();
  assert.deepEqual(live, [1, 2]);
});

QUnit.test('catch parameter: a defaulted nav leaf beside a leaf-level sibling', assert => {
  const source = { codes: {} };
  const seen = (() => {
    try {
      throw source;
    } catch ({ codes: { findIndex: m = () => -1, keys: k } }) {
      return [m(), typeof k];
    }
  })();
  assert.deepEqual(seen, [-1, 'undefined']);
  const arrays = { codes: [3, 4] };
  const live = (() => {
    try {
      throw arrays;
    } catch ({ codes: { findIndex: m = () => -1, keys: k } }) {
      return [m.call([1, 2, 3], x => x === 2), typeof k];
    }
  })();
  assert.deepEqual(live, [1, 'function']);
});

(FUNCTION_NAMES ? testUnlessDetectLowered : QUnit.skip)('catch parameter: an anonymous default beside a sibling keeps its inferred name', assert => {
  const source = { codes: {}, other: { x: 1 } };
  const hop = (() => {
    try {
      throw source;
    } catch ({ codes: { findIndex: m = () => -1 }, other }) {
      return [m.name, other.x];
    }
  })();
  assert.deepEqual(hop, ['m', 1]);
  const leaf = (() => {
    try {
      throw source;
    } catch ({ codes: { findIndex: m = () => -1, keys: k } }) {
      return [m.name, typeof k];
    }
  })();
  assert.deepEqual(leaf, ['m', 'undefined']);
});

QUnit.test('a defaulted instance leaf beside a sibling off an effectful realm init is polyfilled', assert => {
  let eff = 0;
  const { Array: { prototype: { flat: f = () => 'default' }, of: o } } = (eff++, globalThis);
  assert.same(eff, 1);
  assert.same(typeof o, 'function');
  assert.deepEqual(f.call([[1, 2], [3]]), [1, 2, 3]);
  const { Array: { prototype: { flat: f2 = () => 'default', at } } } = (eff++, globalThis);
  assert.same(eff, 2);
  assert.same(at.call([5, 6], -1), 6);
  assert.deepEqual(f2.call([[1]]), [1]);
  const user = { codes: {}, other: 1 };
  const { codes: { findIndex: m = () => -1 }, other } = (eff++, user);
  assert.same(m(), -1);
  assert.same(other, 1);
  assert.same(eff, 3);
});

QUnit.test('a nested instance leaf off a call that provably yields the realm is polyfilled', assert => {
  let eff = 0;
  function g() { return globalThis; }
  const { Array: { prototype: { flat: f }, of: o } } = g();
  assert.deepEqual(f.call([[1, 2], [3]]), [1, 2, 3]);
  assert.same(typeof o, 'function');
  const { Array: { prototype: { flat: f2 }, of: o2 } } = (eff++, g());
  assert.deepEqual(f2.call([[1]]), [1]);
  assert.same(typeof o2, 'function');
  const { Array: { prototype: { flat: f3 } } } = (eff++, g());
  assert.deepEqual(f3.call([[[1]]]), [[1]]);
  assert.same(eff, 2, 'each prefix runs once');
});

(FUNCTION_NAMES ? testUnlessDetectLowered : QUnit.skip)('a defaulted instance leaf beside a sibling off an effectful init keeps its inferred name', assert => {
  let eff = 0;
  // a receiver of unknown type: the dispatch reads the leaf off the memo and the default fires
  function pick(user) {
    const { codes: { findIndex: m = () => -1 }, other } = (eff++, user);
    return [m.name, m(), other];
  }
  assert.deepEqual(pick({ codes: {}, other: 1 }), ['m', -1, 1]);
  assert.same(eff, 1);
});

QUnit.test('destructuring under outer rest keeps the native constructor slot', assert => {
  // eslint-disable-next-line @stylistic/quote-props -- Preserve the quoted constructor key spelling.
  const { 'Map': { groupBy }, ...rest } = globalThis;
  assert.same(groupBy, restMapGroupBy);
  assert.same(Object.hasOwn(rest, 'Map'), false);
});

QUnit.test('destructuring an unknown constructor slot keeps its native coercion', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'Map');
  if (descriptor) assert.same(readUnknownConstructorSlot()[1], descriptor.value.custom);
  else assert.throws(readUnknownConstructorSlot, TypeError);
});

QUnit.test('destructuring a borrowed static receiver reads the excluded getter before rest', assert => {
  const events = [];
  class WithRest extends Array {
    static read() {
      const { of, ...rest } = this;
      return [typeof of, rest.custom];
    }
  }
  const receiver = Object.defineProperties({}, {
    of: { enumerable: true, get() { events.push('of'); return Array.of; } },
    custom: { enumerable: true, get() { events.push('custom'); return 17; } },
  });
  assert.deepEqual(WithRest.read.call(receiver), ['function', 17]);
  assert.deepEqual(events, ['of', 'custom']);
});

/* eslint-disable no-useless-assignment -- overwritten initial holders and cross writes are the shapes under test */

QUnit.test('container alias: a later opaque replacement keeps the earlier slot write', assert => {
  const events = [];
  function read(external) {
    const original = { x: Array };
    let alias = original;
    alias.x = { from: xs => ['custom', xs[0]] };
    alias = external();
    const { x: { from } } = original;
    return [original.x.from([1]), from([2])];
  }
  assert.deepEqual(read(() => {
    events.push('replace');
    return {};
  }), [['custom', 1], ['custom', 2]]);
  assert.deepEqual(events, ['replace']);
});

QUnit.test('container alias: a captured member keeps its replacement after rebinding', assert => {
  let calls = 0;
  function read(external) {
    const original = { part: { x: Array } };
    let alias = original.part;
    alias.x = { from: xs => ['custom', xs[0]] };
    alias = external();
    const { part: { x: { from } } } = original;
    return [original.part.x.from([1]), from([2])];
  }
  assert.deepEqual(read(() => {
    calls++;
    return {};
  }), [['custom', 1], ['custom', 2]]);
  assert.same(calls, 1);
});

QUnit.test('container alias: a wrapper retains its captured member destination', assert => {
  const original = { part: { x: Array } };
  const local = original.part;
  const alias = { box: local };
  alias.box.x = { from: xs => ['custom', xs[0]] };
  const { part: { x: { from } } } = original;
  assert.deepEqual(original.part.x.from([1]), ['custom', 1]);
  assert.deepEqual(from([2]), ['custom', 2]);
});

QUnit.test('container alias: a dominating local assignment selects the static', assert => {
  let first = { x: Number };
  const second = { x: String };
  first = second;
  const { x: { raw } } = first;
  assert.same(raw({ raw: ['left', 'right'] }, '-'), 'left-right');
});

QUnit.test('container alias: cross assignments retain the captured source', assert => {
  let first = { x: Number };
  let second = { x: String };
  first = second;
  second = first;
  const { x: { raw } } = first;
  assert.same(raw({ raw: ['before', 'after'] }, ':'), 'before:after');
});

// Array.from is stripped by the runtime harness, so this row also proves injection happened.
QUnit.test('container alias: cross assignments supply a static in a stripped realm', assert => {
  let first = { x: Number };
  let second = { x: Array };
  first = second;
  second = first;
  const { x: { from } } = first;
  assert.deepEqual(from({ 0: 'captured', length: 1 }), ['captured']);
});

/* eslint-disable no-var, no-redeclare, block-scoped-var -- repeated var declarations share one hoisted binding */
QUnit.test('destructured var: a later declaration survives an earlier conditional revisit', assert => {
  function read(flag) {
    if (flag) { var { Promise: M } = globalThis; }
    var { Map: M } = globalThis;
    return M.groupBy([1, 2, 3], value => value % 2).get(1);
  }
  assert.deepEqual(read(true), [1, 3]);
  assert.deepEqual(read(false), [1, 3]);
});

QUnit.test('destructured var: a later conditional user value remains authoritative', assert => {
  function read(flag) {
    var { Promise: M } = globalThis;
    if (flag) { var { value: M } = { value: { withResolvers: () => 'custom' } }; }
    return M.withResolvers();
  }
  assert.same(read(true), 'custom');
  assert.same(typeof read(false).resolve, 'function');
});
/* eslint-enable no-var, no-redeclare, block-scoped-var -- end of var redeclaration cases */
/* eslint-enable no-useless-assignment -- end of the source forms above */

/* eslint-disable no-useless-assignment -- overwritten initial holders and cross writes are the shapes under test */

// The stripped realms remove Array.from, so these positive rows require its replacement.
QUnit.test('container alias lexical scope: callback locals keep the captured source', assert => {
  let first = { x: Number };
  let second = { x: Array };
  first = second;
  second = first;
  const { x: { from } } = first;
  assert.deepEqual(from({ 0: 'callback', length: 1 }), ['callback']);
});

QUnit.test('container alias lexical scope: a common nested block keeps the captured source', assert => {
  // eslint-disable-next-line no-lone-blocks -- declaration and writes must share this additional lexical scope
  {
    let first = { x: Number };
    let second = { x: Array };
    first = second;
    second = first;
    const { x: { from } } = first;
    assert.deepEqual(from({ 0: 'block', length: 1 }), ['block']);
  }
});

QUnit.test('container alias lexical scope: an unshadowed nested write keeps the source', assert => {
  let holder = { x: Number };
  const source = { x: Array };
  // eslint-disable-next-line no-lone-blocks -- the nested write without a shadow is the boundary under test
  {
    holder = source;
  }
  const { x: { from } } = holder;
  assert.deepEqual(from({ 0: 'nested write', length: 1 }), ['nested write']);
});

QUnit.test('container alias lexical scope: a nested source shadow keeps its custom method', assert => {
  // eslint-disable-next-line no-unused-vars -- this outer binding must differ from the source at the write
  const source = { x: Array };
  let holder = { x: Number };
  {
    // eslint-disable-next-line no-shadow -- distinct lexical sources are the boundary under test
    const source = { x: { from: () => ['inner'] } };
    holder = source;
  }
  const { x: { from } } = holder;
  assert.deepEqual(from([]), ['inner']);
});

QUnit.test('container alias lexical scope: a declaration-side shadow cannot replace an outer source', assert => {
  const source = { x: { from: () => ['outer'] } };
  {
    // eslint-disable-next-line no-shadow, no-unused-vars -- only the declaration sees this source binding
    const source = { x: Array };
    // eslint-disable-next-line no-var -- the holder outlives its declaration block
    var holder = 0;
  }
  // eslint-disable-next-line block-scoped-var -- the write intentionally occurs outside the declaration block
  holder = source;
  // eslint-disable-next-line block-scoped-var -- reading the function-scoped holder observes the outer source
  const { x: { from } } = holder;
  assert.deepEqual(from([]), ['outer']);
});
/* eslint-enable no-useless-assignment -- end of the source forms above */

QUnit.test('destructuring: computed default and rest capture a getter once', assert => {
  const events = [];
  const value = restArrayAt ? 6 : 9;
  const defaultEvent = restArrayAt ? [] : ['default'];
  const leaf = [5, 6];
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- own rest property on this array
  leaf.extra = 7;
  const source = {
    // eslint-disable-next-line es/no-accessor-properties -- observable extraction order
    get before() { events.push('before'); return 1; },
    // eslint-disable-next-line es/no-accessor-properties -- observable extraction order
    get data() { events.push('getter'); return leaf; },
    // eslint-disable-next-line es/no-accessor-properties -- observable extraction order
    get after() { events.push('after'); return 2; },
  };
  function fallback() {
    events.push('default');
    return () => 9;
  }
  const { before, data: { [(events.push('key'), 'at')]: method = fallback(), ...rest }, after } = source;
  assert.deepEqual([before, method.call(leaf, -1), rest.extra, after], [1, value, 7, 2]);
  assert.deepEqual(events, ['before', 'getter', 'key', ...defaultEvent, 'after']);
  events.length = 0;
  let assigned, assignedRest, first, last;
  const result = { before: first, data: { [(events.push('key'), 'at')]: assigned = fallback(), ...assignedRest }, after: last } = source;
  assert.same(result, source);
  assert.deepEqual([first, assigned.call(leaf, -1), assignedRest.extra, last], [1, value, 7, 2]);
  assert.deepEqual(events, ['before', 'getter', 'key', ...defaultEvent, 'after']);
  events.length = 0;
  try {
    throw source;
  } catch ({ data: { [(events.push('key'), 'at')]: caught = fallback(), ...caughtRest } }) {
    assert.deepEqual([caught.call(leaf, -1), caughtRest.extra], [value, 7]);
  }
  assert.deepEqual(events, ['getter', 'key', ...defaultEvent]);
});

QUnit.test('destructuring: a for-of head reads a static through a multi-element array wrapper', assert => {
  const events = [];
  const seen = [];
  function eff(tag) {
    events.push(tag);
    return tag;
  }
  for (const [{ from }, tail] of [[Array, eff('first')], [Array, eff('second')]]) seen.push(from([7])[0], tail);
  for (const [{ of }, count] of [[Array, 1]]) seen.push(of(8)[0], count);
  for (const [{ Array: { isArray } }, tail] of [[globalThis, eff('third')]]) seen.push(isArray([]), tail);
  for (const [[{ from }], tail] of [[[Array], 4]]) seen.push(from([9])[0], tail);
  assert.deepEqual(seen, [7, 'first', 7, 'second', 8, 1, true, 'third', 9, 4]);
  assert.deepEqual(events, ['first', 'second', 'third']);
});

QUnit.test('destructuring: a positional slot renames only where no later slot reads first', assert => {
  const events = [];
  function mk() {
    return {
      // eslint-disable-next-line es/no-accessor-properties -- observable read order
      get y() { events.push('y'); return [7, 8]; },
    };
  }
  const box = {
    // eslint-disable-next-line es/no-accessor-properties -- observable read order
    get z() { events.push('z'); return 2; },
  };
  const pair = [mk(), box];
  const [{ y: { at: first } }, { z }] = pair;
  const [{ y: { at: second } }, tail] = pair;
  const [{ z: lead }, { y: { at: third } }] = pair.slice().reverse();
  // `first` keeps its native read: a later slot that reads declines the rename on both legs
  assert.deepEqual([typeof first !== 'number', z, second.call([1, 2], -1), tail === box, lead, third.call([1, 2], -1)], [true, 2, 2, true, 2, 2]);
  assert.deepEqual(events, ['y', 'z', 'y', 'z', 'y']);
});

QUnit.test('destructuring: a captured wrapper element that names the global object keeps its instance leaf', assert => {
  const events = [];
  function realm() { return globalThis; }
  const [{ Array: { prototype: { at: soleAt } } }] = [realm()];
  let out;
  for (const [{ Array: { prototype: { at: headAt } } }, tail] = [realm(), events.push('t')]; !out;) out = [headAt, tail];
  assert.same(soleAt.call([1, 2], -1), 2);
  assert.same(out[0].call([3, 4], -1), 4);
  assert.deepEqual([out[1], events], [1, ['t']]);
});

QUnit.test('destructuring: a receiver-bearing inner default mirrors beside the live slot', assert => {
  const seen = [];
  function pick() {
    return { from: () => ['mine'] };
  }
  for (const [{ from } = Array] of [[undefined], [], [Array]]) seen.push(from([7])[0]);
  for (const [{ from } = Array, tail] of [[undefined, 1], [Array, 2]]) seen.push(from([7])[0], tail);
  for (const { k: { from } = Array } of [{}, { k: Array }, { k: undefined }]) seen.push(from([7])[0]);
  for (const { k: [{ from } = Array] } of [{ k: [undefined] }]) seen.push(from([7])[0]);
  for (const [{ groupBy } = Map] of [[undefined]]) seen.push(groupBy([1, 2], x => x % 2).size);
  // a slot nothing proves keeps the user's own value; the default alone is swapped
  for (const [{ from } = Array] of [[pick()]]) seen.push(from([7])[0]);
  const [{ from: dynamicFrom } = Array] = [pick()];
  const [{ from: dynamicSibling } = Array, count] = [pick(), 1];
  let assigned;
  // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
  [{ from: assigned } = Array] = [pick()];
  const { k: { from: keyedFrom } = Array } = { k: Array };
  const { k: { from: keyedAbsent } = Array } = { k: undefined };
  let caught;
  try {
    throw [undefined];
  } catch ([{ from: thrown } = Array]) {
    caught = thrown;
  }
  const iife = (({ k: { from } = Array }) => from)({ k: Array });
  // a slot that proves a value (a binding holding the user's literal) never fires the default: the
  // user's own member binds
  const held = { from: () => ['held'] };
  const [{ from: heldFrom } = Array] = [held];
  assert.deepEqual(seen, [7, 7, 7, 7, 1, 7, 2, 7, 7, 7, 7, 2, 'mine']);
  assert.deepEqual([dynamicFrom([7])[0], dynamicSibling([7])[0], count, assigned([7])[0]], ['mine', 'mine', 1, 'mine']);
  assert.deepEqual([keyedFrom([7])[0], keyedAbsent([7])[0], caught([7])[0], iife([7])[0], heldFrom([7])[0]], [7, 7, 7, 7, 'held']);
});

// a MIXED pattern under the default - a flat constructor beside a nested static - takes the same
// plan on every host: mirrored where the slot proves `undefined` or stays open (a call), left as
// written where the slot proves a value (the user's object binds its own members), and settled at
// the call for a named function whose every caller is seen
QUnit.test('destructuring: a mixed pattern under an inner default takes one plan on every host', assert => {
  function pickUndefined() {
    return [][0];
  }
  const held = { Set: class HeldSet {}, Array: { of: x => [x, 'held'] } };
  const iifeAbsent = (([{ Set: S, Array: { of } } = globalThis]) => [typeof S, of(7)[0]])([]);
  const iifeBlock = (([{ Set: S, Array: { of } } = globalThis]) => {
    return [typeof S, of(7)[0]];
  })([]);
  const iifeHeld = (([{ Set: S, Array: { of } } = globalThis]) => [S === held.Set, of(7)[1]])([held]);
  const iifeOpen = (([{ Set: S, Array: { of } } = globalThis]) => [typeof S, of(7)[0]])([pickUndefined()]);
  const iifeRealm = (([{ Set: S, Array: { of } } = globalThis]) => [typeof S, of(7)[0]])([globalThis]);
  const iifeKeyed = (({ p: { Set: S, Array: { of } } = globalThis }) => [typeof S, of(7)[0]])({});
  const [{ Set: declSet, Array: { of: declOf } } = globalThis] = [];
  const [{ Set: heldSet, Array: { of: heldOf } } = globalThis] = [held];
  const [{ Set: openSet, Array: { of: openOf } } = globalThis] = [pickUndefined()];
  const { p: { Set: keyedSet, Array: { of: keyedOf } } = globalThis } = {};
  let assignedSet, assignedOf;
  // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
  [{ Set: assignedSet, Array: { of: assignedOf } } = globalThis] = [];
  function once([{ Set: S, Array: { of } } = globalThis]) {
    return [typeof S, of(7)[0]];
  }
  function twice([{ Set: S, Array: { of } } = globalThis]) {
    return [typeof S, of(7)[0]];
  }
  assert.deepEqual([iifeAbsent, iifeBlock, iifeHeld, iifeOpen], [['function', 7], ['function', 7], [true, 'held'], ['function', 7]]);
  assert.deepEqual([iifeRealm, iifeKeyed], [['function', 7], ['function', 7]]);
  assert.deepEqual([typeof declSet, declOf(7)[0], heldSet === held.Set, heldOf(7)[1]], ['function', 7, true, 'held']);
  assert.deepEqual([typeof openSet, openOf(7)[0], typeof keyedSet, keyedOf(7)[0]], ['function', 7, 'function', 7]);
  assert.deepEqual([typeof assignedSet, assignedOf(7)[0]], ['function', 7]);
  assert.deepEqual([once([]), twice([pickUndefined()]), twice([globalThis])], [['function', 7], ['function', 7], ['function', 7]]);
  // ... and a host no slot can be paired for - a thrown value, a spread call, a head over a held
  // iterable - mirrors the default alone, so the arm still lands where the slot is empty
  let caught;
  try {
    throw [];
  } catch ([{ Set: S, Array: { of } } = globalThis]) {
    caught = [typeof S, of(7)[0]];
  }
  const spreadArgs = [[pickUndefined()]];
  const rows = [[], [held]];
  const heads = [];
  for (const [{ Set: S, Array: { of } } = globalThis] of rows) heads.push(typeof S, of(7)[1]);
  assert.deepEqual([caught, once(...spreadArgs), heads], [['function', 7], ['function', 7], ['function', undefined, 'function', 'held']]);
  // ... and a declarator over an opaque binding (a parameter): the default's walk alone answers
  function viaOpaque(slot) {
    const [{ Set: S, Array: { of } } = globalThis] = slot;
    return [typeof S, of(7)[1]];
  }
  assert.deepEqual([viaOpaque([]), viaOpaque([held])], [['function', undefined], ['function', 'held']]);
  // ... at any depth above the default: the descent loses the element in the opaque container and
  // the nearest default's walk alone answers for its level
  function viaOpaqueKey(o) {
    const { p: { Set: S, Array: { of } } = globalThis } = o;
    return [typeof S, of(7)[0]];
  }
  function viaOpaqueTwoLevels(o) {
    const [{ k: { Set: S, Array: { of } } = globalThis } = {}] = o;
    return [typeof S, of(7)[0]];
  }
  assert.deepEqual([viaOpaqueKey({}), viaOpaqueTwoLevels([])], [['function', 7], ['function', 7]]);
});

// a binding read ahead of its own initializer holds `undefined` (a hoisted `var` declared below) or
// throws (a lexical binding in its TDZ): a resolution following the binding to its literal has to
// prove the initializer ran first, or the rewrite binds where the source throws
QUnit.test('destructuring: a binding read ahead of its initializer keeps the throw', assert => {
  const outcomes = [];
  function record(read) {
    try {
      outcomes.push(read());
    } catch (error) {
      outcomes.push(error.name);
    }
  }
  record(() => {
    const { a: { from } } = container;
    return from([1]).length;
  });
  record(() => {
    const alias = container;
    const { a: { from } } = alias;
    return from([1]).length;
  });
  record(() => {
    const [{ from }] = wrapper;
    return from([1]).length;
  });
  record(() => {
    const { [key]: from } = Array;
    return typeof from;
  });
  record(() => {
    const [{ of } = Array] = [slot];
    return of(1)[0];
  });
  record(() => {
    const { Array: { from } } = realm();
    return from([1]).length;
  });
  // eslint-disable-next-line no-var -- the hoisted declaration below the reads is the shape under test
  var container = { a: Array };
  // eslint-disable-next-line no-var, unicorn/consistent-function-style -- the hoisted var holding a function is the shape under test
  var realm = () => globalThis;
  // eslint-disable-next-line no-var -- the hoisted declaration below the reads is the shape under test
  var wrapper = [Array];
  // eslint-disable-next-line no-var -- the hoisted declaration below the reads is the shape under test
  var key = 'from';
  // eslint-disable-next-line no-var -- the hoisted declaration below the reads is the shape under test
  var slot = { of: x => [x, 'late'] };
  record(() => {
    const { a: { from } } = container;
    return from([1]).length;
  });
  record(() => {
    const [{ of } = Array] = [slot];
    return of(1)[1];
  });
  record(() => {
    const { Array: { from } } = realm();
    return from([1]).length;
  });
  assert.deepEqual(outcomes, ['TypeError', 'TypeError', 'TypeError', 'undefined', 1, 'TypeError', 1, 'late', 1]);
});

QUnit.test('destructuring: a static hop holding a claim-free pattern reads the ponyfill', assert => {
  const events = [];
  const { Array: { of: { length: declared } } } = globalThis;
  let assigned;
  // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
  ({ Array: { of: { length: assigned } } } = globalThis);
  const { Array: { of: { name: declaredName, length: declaredTwo } } } = globalThis;
  let assignedName, assignedTwo;
  // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
  ({ Array: { of: { name: assignedName, length: assignedTwo } } } = globalThis);
  const { Map: { groupBy: { length: grouped } } } = globalThis;
  const { Array: { of: { length: prefixed } } } = (events.push('e'), globalThis);
  const { Array: { of: { length: beside }, from } } = globalThis;
  // ... and off a constructor init: bare, aliased, spelled through the realm, with its own entry
  const { from: { length: ctorDeclared } } = Array;
  let ctorAssigned;
  // eslint-disable-next-line prefer-const -- the assignment host is the shape under test
  ({ from: { length: ctorAssigned } } = Array);
  const Aliased = Array;
  const { from: { length: ctorAlias } } = Aliased;
  const { from: { length: ctorMember } } = globalThis.Array;
  const { groupBy: { length: ctorEntry } } = Map;
  assert.deepEqual([declared, assigned, declaredTwo, assignedTwo, prefixed, beside], [0, 0, 0, 0, 0, 0]);
  assert.deepEqual([declaredName, assignedName, grouped], ['of', 'of', 2]);
  assert.deepEqual([ctorDeclared, ctorAssigned, ctorAlias, ctorMember, ctorEntry], [1, 1, 1, 1, 2]);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.deepEqual(events, ['e']);
});

QUnit.test('destructuring: a wrapper literal with a computed element is captured beside its sibling', assert => {
  const events = [];
  function eff(t) {
    events.push(t);
    return t;
  }
  function realm() {
    return globalThis;
  }
  function mk() {
    return {
      // eslint-disable-next-line es/no-accessor-properties -- observable read order
      get y() { events.push('y'); return [7, 8]; },
    };
  }
  const box = {
    // eslint-disable-next-line es/no-accessor-properties -- observable read order
    get z() { events.push('z'); return 2; },
  };
  const [{ Array: { prototype: { at: viaCall } } }, tail] = [realm(), eff('t')];
  const [{ y: { at: viaGetter } }, { z }] = [mk(), box];
  const [[{ Array: { prototype: { at: nested } } }], count] = [[realm()], 4];
  assert.same(viaCall.call([1, 2], -1), 2);
  assert.same(viaGetter.call([3, 4], -1), 4);
  assert.same(nested.call([5, 6], -1), 6);
  assert.deepEqual([tail, z, count, events], ['t', 2, 4, ['t', 'y', 'z']]);
});

// an inner default on a NON-function host - an assignment, a catch parameter, an object key - takes
// the same per-key fallback a parameter's does where the mirror declines (a non-identifier key
// beside the leaves): every static leaf, flat or nested, reads the polyfill, and a pattern spelling
// only nested leaves mirrors the default from them
QUnit.test('destructuring: an inner default on a non-function host keeps the per-key fallback for every leaf', assert => {
  /* eslint-disable prefer-const -- the ASSIGNMENT host is the shape under test */
  let S, of, d;
  [{ Set: S, 'with-dash': d, Array: { of } } = globalThis] = [];
  /* eslint-enable prefer-const -- end of the assignment host */
  assert.same(typeof S, 'function');
  assert.deepEqual(of(7), [7]);
  assert.same(d, undefined);
  let caughtOf;
  try {
    throw [];
  } catch ([{ Array: { of: inner }, 'with-dash': d2 } = globalThis]) {
    caughtOf = inner;
    assert.same(d2, undefined);
  }
  assert.deepEqual(caughtOf(8), [8]);
  const { k: { Array: { of: keyed } } = globalThis } = {};
  assert.deepEqual(keyed(9), [9]);
  const { k: { Set: S3, Array: { of: keyed3 }, 'with-dash': d3 } = globalThis } = {};
  assert.same(typeof S3, 'function');
  assert.deepEqual(keyed3(1), [1]);
  assert.same(d3, undefined);
});

// a residual leaf naming one of the ctor's OWN statics with no extraction to serve it - a member
// target, which the raw canon keeps - reads the native receiver: re-anchored on the pure ctor
// binding it would read `undefined` (the `*/constructor` entry carries no statics), and inside a
// mirrored literal it stays a raw read through the proxy. on a stripped realm the global is absent
// and the raw read throws like the source does - the live-global legs carry the value oracle
QUnit.test('destructuring: a member target takes the static ponyfill unless its root is a global', assert => {
  // the realm's own ctor and statics, read through calls a member spelling would be resolved
  // through the ponyfill (`Reflect.get` hands the live value back untouched); absent on a
  // stripped realm
  const live = Reflect.get(globalThis, 'Promise');
  const box = {};
  function viaResidual() {
    ({ Promise: { race: box.race } } = globalThis);
    return box.race;
  }
  function viaMirror() {
    let S;
    [{ Set: S, Promise: { all: box.all } } = globalThis] = [];
    return [S, box.all];
  }
  // a PATTERN under the folded static key destructures the static's own ponyfill, as the literal
  // key does - the same arity in every realm
  function viaFoldedPattern() {
    const key = 'race';
    const { Promise: { [key]: { length } } } = globalThis;
    return length;
  }
  if (!POST_LOWERED) assert.same(viaFoldedPattern(), 1);
  // an ALL-proxy selecting inner default takes the shared plan's literal: the leaf reads the
  // polyfill in every realm, whatever the host's slot holds (a spread host pairs nothing)
  function viaAllProxyDefault() {
    /* eslint-disable prefer-const, no-restricted-globals, unicorn/prefer-global-this -- the ASSIGNMENT host and a bare proxy name are the shape under test */
    let gb;
    const extra = {};
    ({ k: { Map: { groupBy: gb } } = self ?? globalThis } = { ...extra });
    /* eslint-enable prefer-const, no-restricted-globals, unicorn/prefer-global-this -- end of the shape under test */
    return typeof gb;
  }
  assert.same(viaAllProxyDefault(), 'function');
  // the author's own object is a slot like a binding the author declares, so the ponyfill lands in
  // it and the read answers in EVERY realm - the stripped one included, where reading the static
  // off the native receiver would have thrown
  assert.same(typeof viaResidual(), 'function');
  const [S, all] = viaMirror();
  assert.same(typeof S, 'function');
  assert.same(typeof all, 'function');
  // ... and a COMPUTED key that folds names the static as the literal does
  const k = 'race';
  ({ Promise: { [k]: box.folded } } = globalThis);
  assert.same(typeof box.folded, 'function');
  // ... and a SELECTING receiver collapses to the realm before any of this, so the target extracts
  // off it beside the ponyfilled sibling
  let viaAll;
  ({ Promise: { race: box.selected, all: viaAll } } = globalThis.window ?? globalThis);
  assert.same(typeof box.selected, 'function');
  assert.same(typeof viaAll, 'function');
  // ... and the leaf's own DEFAULT is dead text over an import that is never undefined
  ({ Promise: { race: box.defaulted = 1 } } = globalThis.window ?? globalThis);
  assert.same(typeof box.defaulted, 'function');
  // ... and a MULTI-hop pattern answers per hop
  let gb;
  ({ Map: { groupBy: gb }, Promise: { race: box.beside } } = globalThis.window ?? globalThis);
  assert.same(typeof gb, 'function');
  assert.same(typeof box.beside, 'function');
  // ... and a value-selecting INNER default (the host's slot provably empty) takes the same mirror
  // on an object-key host, the member target riding it like any slot
  let gbk;
  ({ k: { Map: { groupBy: gbk }, Promise: { race: box.keyed } } = globalThis.window ?? globalThis } = {});
  assert.same(typeof gbk, 'function');
  assert.same(typeof box.keyed, 'function');
  // a key carrying an EFFECT keeps its residual - that is where the effect still has to run - and
  // the residual re-anchors on the constructor's pure binding like any other: the import is what a
  // realm WITHOUT the constructor has instead of it, so the read stands there too. WHICH value the
  // binding answers for a key the plan cannot name is the runtime's own business (the bare
  // `*/constructor` entry installs no statics of its own until another entry decorates it), so the
  // row asserts the effect count and that the read happens at all
  function viaEffectKey() {
    let n = 0;
    ({ Promise: { [(n++, 'race')]: box.effect } } = globalThis);
    return [box.effect, n];
  }
  // ... and a target whose ROOT stands for a global keeps the native read whatever the realm holds:
  // the write would install the ponyfill in the realm, which pure never does
  function viaGlobalRoot() {
    globalThis.e2eMemberRootBox = {};
    ({ Promise: { race: globalThis.e2eMemberRootBox.race } } = globalThis);
    return globalThis.e2eMemberRootBox.race;
  }
  const [effect, effectReads] = viaEffectKey();
  assert.same(effectReads, 1);
  assert.same(typeof effect, 'function');
  if (POST_LOWERED) {
    // a leg whose emission lands on the LOWERED text sees a plain member read where the pattern
    // stood, and a member read takes the ponyfill by the usual rule in every realm - the global-root
    // refusal is a destructuring shape, which the pre-lowering legs hold
    assert.same(typeof viaGlobalRoot(), 'function');
  } else if (live) {
    assert.same(viaGlobalRoot(), Reflect.get(live, 'race'));
  } else {
    assert.throws(viaGlobalRoot, TypeError);
  }
});

// ... and inside a FUNCTION body the same hosts have no caller analysis to prove the slot absent:
// the receiver's own element, present at the call, keeps binding its own value - a body-top hoist
// of the polyfill (the parameter route's shape) would override it. the absent element takes the
// default, and the polyfill, as everywhere
QUnit.test('destructuring: an inner default on a non-function host inside a function keeps the present element', assert => {
  function viaDeclarator(arr) {
    const [{ Set: S, 'with-dash': d, Array: { of } } = globalThis] = arr;
    return [typeof S, of(1).length, d];
  }
  function viaCatch(v) {
    try {
      throw v;
    } catch ([{ Set: S, 'with-dash': d, Array: { of } } = globalThis]) {
      return [typeof S, of(1).length, d];
    }
  }
  const own = [{ Set: 'X', Array: { of: x => [x, 'own'] } }];
  assert.deepEqual(viaDeclarator(own), ['string', 2, undefined]);
  assert.deepEqual(viaDeclarator([]), ['function', 1, undefined]);
  assert.deepEqual(viaCatch(own), ['string', 2, undefined]);
  assert.deepEqual(viaCatch([]), ['function', 1, undefined]);
});

// ... and a DEFAULTED parameter of an immediately invoked function is accounted for only where the
// one call leaves the slot to the default: a real argument binds the caller's own value (the inline
// default keeps it; a body-top hoist of the polyfill would override it), a missing or `undefined`
// argument runs the default and reads the polyfill
QUnit.test('destructuring: a defaulted parameter of an immediately invoked function keeps the argument the call passes', assert => {
  // the arguments are spelled AT the call: a value handed in through a binding is a caller the
  // analysis cannot see through, and the leaves then stay native by design
  assert.deepEqual((({ Set: S, 'with-dash': d, Array: { of } } = globalThis) => {
    return [typeof S, of(1).length, d];
  })({ Set: 'X', Array: { of: x => [x, 'own'] } }), ['string', 2, undefined]);
  assert.deepEqual((({ Set: S, 'with-dash': d, Array: { of } } = globalThis) => {
    return [typeof S, of(1).length, d];
  })(), ['function', 1, undefined]);
  // an explicit `undefined` argument runs the default, and the leaves read the polyfill through it
  assert.deepEqual((({ Set: S, 'with-dash': d, Array: { of } } = globalThis) => {
    return [typeof S, of(1).length, d];
  })(undefined), ['function', 1, undefined]);
  const own = { Set: 'X', Array: { of: x => [x, 'own'] } };
  assert.same((({ Array: { of } } = globalThis) => {
    return of(1).length;
  })(undefined), 1);
  assert.deepEqual((({ k: { Set: S, 'with-dash': d, Array: { of } } = globalThis }) => {
    return [typeof S, of(1).length, d];
  })({ k: own }), ['string', 2, undefined]);
  assert.deepEqual((({ k: { Set: S, 'with-dash': d, Array: { of } } = globalThis }) => {
    return [typeof S, of(1).length, d];
  })({}), ['function', 1, undefined]);
});

// a CAPTURE yields its right-hand side, so the selection under it is what the pattern reads. with an
// opaque arm live there is no sound injection: the mirror would hand the capture our object, and
// binding the ponyfill outright overrides whatever that arm holds. the source's own read stands
QUnit.test('destructuring: a captured selection keeps the arm the source reads', assert => {
  const own = { Array: { from: () => ['own'] } };
  let held;
  const { Array: { from } } = held = own || globalThis;
  assert.deepEqual(from([1]), ['own']);
  assert.same(held, own);
  // the falsy twin of this arm lives in the generated corpus, where the realm read can be compared
  // without a second claim standing in for the expectation
});

// an ASSIGNMENT host whose effectful computed key rebuilds the statement around a minted memo: what
// the rebuild leaves for every SIBLING prop is a read off that memo, a receiver no later route can
// name, so the sibling's own static has to be answered by the rebuild itself. read natively it is
// `undefined` in a realm without the constructor, and the key still runs exactly once
QUnit.test('destructuring: a rebuilt assignment keeps the sibling static polyfill', assert => {
  let keyRuns = 0;
  let of, from;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ [(keyRuns += 1, 'of')]: of, from } = Array);
  assert.same(typeof from, 'function');
  assert.deepEqual(of(7), [7]);
  assert.deepEqual(from([1, 2]), [1, 2]);
  assert.same(keyRuns, 1);
  // ... and with the sibling spelled FIRST, where its claim is taken before the rebuild sees it
  let headRuns = 0;
  let head, tail;
  // eslint-disable-next-line prefer-const -- testing assignment destructuring
  ({ from: head, [(headRuns += 1, 'of')]: tail } = Array);
  assert.same(typeof head, 'function');
  assert.deepEqual(head([3]), [3]);
  assert.deepEqual(tail(7), [7]);
  assert.same(headRuns, 1);
});

// a TEST-selected receiver whose arms DISAGREE about definability: the probe arm is the one every
// host that spells `window` takes, so leaving it raw bound the realm's own member there - the value
// this polyfill exists to replace. the arm takes the literal through a null test on the probe's own
// read, which keeps the native throw where the environment lacks the name
QUnit.test('destructuring: a probe arm of a selecting receiver polyfills where the probe exists', assert => {
  function pick(flagged) {
    const { Array: { of } } = flagged ? globalThis.window : globalThis;
    return of;
  }
  assert.same(typeof pick(false), 'function', 'the guaranteed arm binds the polyfill');
  assert.deepEqual(pick(false)(7), [7], 'and it is the polyfill that runs');
  // the host the probe arm is taken on, built around the read: Node has no `window` at all, and a
  // browser's own `Array.of` makes the two arms indistinguishable - only a realm with the probe
  // present and the native stripped tells the polyfill from the realm's own member
  withWindowWithoutSelf(() => {
    assert.same(typeof pick(true), 'function', 'the probe arm binds the polyfill where the probe exists');
    assert.deepEqual(pick(true)(7), [7], 'reading the polyfill, not the realm own member');
  });
  if (typeof window === 'undefined') {
    assert.throws(() => pick(true), TypeError, 'and an absent probe throws exactly as the source does');
  }
});

// an effect the source runs AHEAD of the pattern belongs to the statement slot, and EXACTLY ONE
// channel may perform it: the render that memoizes the receiver, or the lift that hoists it into
// that slot. Both performing it ran the effect twice; neither, and it never ran at all - and which
// channel is live depends on where the effect-bearing key sits among its siblings
QUnit.test('destructuring: a receiver prefix effect runs exactly once whatever the prop order', assert => {
  const log = [];
  let a, b;
  /* eslint-disable prefer-const -- testing assignment destructuring */
  ({ of: b, [(log.push('k1'), 'from')]: a } = (log.push('recv'), Array));
  assert.deepEqual(log, ['recv', 'k1'], 'a static sibling AHEAD of the effectful key');
  assert.deepEqual([typeof a, typeof b], ['function', 'function'], 'and both slots bind their polyfill');
  log.length = 0;
  let c, d;
  ({ [(log.push('k1'), 'from')]: c, of: d } = (log.push('recv'), Array));
  assert.deepEqual(log, ['recv', 'k1'], 'the effectful key ahead of the sibling');
  assert.deepEqual([typeof c, typeof d], ['function', 'function'], 'and both slots bind their polyfill');
  log.length = 0;
  let e, f;
  ({ [(log.push('k1'), 'from')]: e, [(log.push('k2'), 'of')]: f } = (log.push('recv'), Array));
  assert.deepEqual(log, ['recv', 'k1', 'k2'], 'two effectful keys keep their source order');
  assert.deepEqual([typeof e, typeof f], ['function', 'function'], 'and both slots bind their polyfill');
  log.length = 0;
  let g, h, held;
  // the prefix carries a claim of ITS own: whichever channel performs the effect owes that claim
  // its polyfill, and a receiver read past the prefix takes it out of the pass's sight
  ({ [(log.push('k1'), 'from')]: g, of: h } = (held = Array.of, Array));
  assert.deepEqual(log, ['k1'], 'a prefix that claims performs once, ahead of the key');
  assert.deepEqual([typeof g, typeof h, typeof held], ['function', 'function', 'function'], 'and the claim inside the prefix keeps its polyfill');
  /* eslint-enable prefer-const -- end of the assignment forms */
});

// a key a pattern repeats names ONE slot: both readers read one value, so the synthesized literal
// spells a single property for it. Declining the level over the repeat left a for-x head reading
// raw off the element, which has no statement slot the polyfill could be extracted into
QUnit.test('destructuring: a repeated key mirrors once on a for-of head', assert => {
  let first, second;
  // eslint-disable-next-line no-useless-computed-key -- the repeated key IS the subject here
  for (const { of: a, ['of']: b } of [Array, Array]) {
    first = a;
    second = b;
  }
  assert.deepEqual([typeof first, typeof second], ['function', 'function'], 'both readers bind the polyfill');
  assert.strictEqual(first, second, 'and both bind one value, as the source reads one slot twice');
  const KEY = 'of';
  let bound, plain;
  for (const { [KEY]: c, of: d } of [Array, Array]) {
    bound = c;
    plain = d;
  }
  assert.deepEqual([typeof bound, typeof plain], ['function', 'function'], 'a bound key repeating a literal one mirrors alike');
  assert.strictEqual(bound, plain, 'and lands the same value in both slots');
});
