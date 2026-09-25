QUnit.test('inline returns: locals and nested calls keep their effects', assert => {
  const log = [];
  const value = (() => {
    const inner = [1, [2]].flat();
    log.push(inner.length);
    return globalThis;
  })()?.Array.of(5).at(0);
  assert.same(value, 5);
  assert.deepEqual(log, [2]);

  // eslint-disable-next-line unicorn/consistent-function-style -- cover an identifier-bound arrow callee
  const make = () => {
    const local = 'ab'.padStart(3, '-');
    log.push(local);
    return Array;
  };
  assert.deepEqual(make().of(7), [7]);
  assert.deepEqual(log, [2, '-ab']);
});

QUnit.test('inline returns: every branch yields the same constructor', assert => {
  for (const flag of [false, true]) {
    const log = [];
    const result = (() => {
      const local = flag;
      if (local) {
        log.push('yes');
        return Map;
      }
      log.push('no');
      return Map;
    })().groupBy([1, 2, 3], value => value % 2);
    assert.deepEqual(result.get(1), [1, 3]);
    assert.deepEqual(log, [flag ? 'yes' : 'no']);
    assert.deepEqual((() => {
      if (flag) return Array;
      // eslint-disable-next-line unicorn/no-useless-else, unicorn/no-duplicate-if-branches -- both return arms are the regression shape
      else return Array;
    })().of(4), [4]);
  }
});

QUnit.test('inline returns: local shadows and absent returns keep their values', assert => {
  const custom = { of: value => ['custom', value] };
  assert.deepEqual((() => {
    // eslint-disable-next-line sonarjs/prefer-immediate-return -- the local shadow must survive in the source
    const Array = custom;
    return Array;
  })().of(3), ['custom', 3]);
  assert.same((function Array() {
    const local = 1;
    if (local) return Array;
    return Array;
  })().of, undefined);
  let named;
  if (custom) named = function Array() {
    const local = 1;
    return local ? Array : null;
  };
  assert.same(named().of, undefined);
  for (const flag of [false, true]) {
    assert.deepEqual((() => {
      if (flag) return Array;
      return custom;
    })().of(6), flag ? [6] : ['custom', 6]);
    assert.same((() => {
      if (flag) return Array;
    })()?.of(8)?.[0], flag ? 8 : undefined);
  }
});

QUnit.test('inline returns: conditional container forwarders keep short circuits', assert => {
  for (const flag of [false, true]) {
    const log = [];
    let forward;
    if (flag) forward = () => ({ window: { Array } });
    const result = forward?.()?.window?.Array.of((log.push('arg'), 9));
    assert.deepEqual(result, flag ? [9] : undefined);
    assert.deepEqual(log, flag ? ['arg'] : []);
    const continuous = forward?.().window.Array.of((log.push('continuous'), 10));
    assert.deepEqual(continuous, flag ? [10] : undefined);
    const tail = forward?.().window.Array.of((log.push('tail'), 12)).at(0);
    assert.same(tail, flag ? 12 : undefined);
    // eslint-disable-next-line no-sequences -- the computed key observes the continuation's effect order
    const indexed = forward?.().window.Array.of((log.push('indexed'), 13))[log.push('key'), 0];
    assert.same(indexed, flag ? 13 : undefined);
    let sealed;
    try {
      // eslint-disable-next-line no-unsafe-optional-chaining -- the sealed chain must throw before evaluating the argument
      sealed = (forward?.()?.window).Array.of((log.push('sealed'), 11));
    } catch (error) {
      sealed = error.name;
    }
    assert.deepEqual(sealed, flag ? [11] : 'TypeError');
    assert.deepEqual(log, flag ? ['arg', 'continuous', 'tail', 'indexed', 'key', 'sealed'] : []);
  }
});

QUnit.test('inline returns: guarded raw calls keep this and getter order', assert => {
  for (const flag of [false, true]) {
    const log = [];
    const result = (() => {
      if (flag) return Array;
      return { marker: 'custom', of(value) { return [this.marker, value]; } };
    })().of(3);
    assert.deepEqual(result, flag ? [3] : ['custom', 3]);
    let called;
    try {
      called = (() => {
        if (flag) return Array;
        return {
          get of() {
            log.push('get');
            return undefined;
          },
        };
      })().of((log.push('arg'), 4));
    } catch (error) {
      called = error.name;
    }
    assert.deepEqual(called, flag ? [4] : 'TypeError');
    assert.deepEqual(log, flag ? ['arg'] : ['get', 'arg']);
  }
});

QUnit.test('inline returns: a destructuring parameter list still proves the returned value', assert => {
  const log = [];
  function viaObject({ p }) {
    log.push(p);
    return Array;
  }
  function viaArray([q]) {
    log.push(q);
    return Object;
  }
  const { of } = viaObject({ p: 'object' });
  const { fromEntries } = viaArray.call(null, ['array']);
  assert.deepEqual(of(1, 2), [1, 2]);
  assert.deepEqual(fromEntries([['k', 1]]), { k: 1 });
  // the parameter list runs where the source ran it: a dropped read would lose these
  assert.deepEqual(log, ['object', 'array']);
});

QUnit.test('inline returns: a container the callee builds pairs its destructured slots', assert => {
  // the init is a CALL: the slot pairs through the literal the callee returns - a factory, a body
  // with a statement ahead of its return, a parameter-filled slot, an IIFE - and the stripped
  // realm holds each static to its polyfill
  const log = [];
  // eslint-disable-next-line unicorn/consistent-function-style -- cover an identifier-bound arrow factory
  const factory = () => ({ M: Map });
  const { M } = factory();
  assert.deepEqual(M.groupBy([1, 2, 3], value => value % 2).get(1), [1, 3]);
  function block(tag) {
    log.push(tag);
    return { A: Array };
  }
  const { A } = block('block');
  assert.deepEqual(A.from(new Set([4])), [4]);
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a parameter-filled slot of an arrow factory
  const wrap = value => ({ P: value, tail: [value] });
  const { P, tail: [Q] } = wrap(Promise);
  assert.same(typeof P.withResolvers().resolve, 'function');
  assert.same(typeof Q.try, 'function');
  const { O } = (() => {
    return { O: Object };
  })();
  assert.deepEqual(O.groupBy([1, 2], value => value % 2)[1], [1]);
  // ... and the member forms: the inline call, a binding of the call, a binding of a slot off it
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a parameter-filled slot beside a literal one
  const build = value => ({ n: { M: value }, A: Array });
  assert.deepEqual(build(Map).A.from(new Set([5])), [5]);
  const nested = build(Map).n;
  assert.deepEqual(nested.M.groupBy([1, 2, 3], value => value % 2).get(0), [2]);
  // a slot value handed out carries the constructor out whole, statics included
  const kept = [];
  function keep(value) {
    kept.push(value);
  }
  const { M: handed } = factory();
  keep(handed);
  assert.same(typeof kept[0].groupBy, 'function');
  // the pattern ASSIGNMENT form pairs the same way
  let assigned;
  // eslint-disable-next-line prefer-const -- the pattern ASSIGNMENT form is the claim
  ({ M: assigned } = factory());
  assert.deepEqual(assigned.groupBy([4, 5], value => value % 2).get(0), [4]);
  // a for-of HEAD over a call element, flat and nested, and the assignment head
  for (const { M: headed } of [factory()]) assert.deepEqual(headed.groupBy([6, 7], value => value % 2).get(1), [7]);
  for (const { n: { M: deep } } of [build(Map)]) assert.deepEqual(deep.groupBy([8], value => value % 2).get(0), [8]);
  let assignedHead;
  for ({ M: assignedHead } of [factory()]) assert.deepEqual(assignedHead.groupBy([9], value => value % 2).get(1), [9]);
  // a computed KEY and a container reached through a pattern write over a call
  // eslint-disable-next-line unicorn/consistent-function-style -- cover an identifier-bound arrow factory
  const keyed = () => ({ key: 'groupBy' });
  let key;
  // eslint-disable-next-line prefer-const -- the pattern ASSIGNMENT form is the claim
  ({ key } = keyed());
  assert.deepEqual(Object[key]([1, 2], value => value % 2)[0], [2]);
  let box;
  // eslint-disable-next-line prefer-const -- the pattern ASSIGNMENT form is the claim
  ({ box } = (() => {
    return { box: { A: Array } };
  })());
  assert.deepEqual(box.A.from(new Set([10])), [10]);
  // an ARRAY wrapper over a call: the callee's literal, and a slot filled from a parameter
  const [{ A: wrappedA }] = (() => {
    return [{ A: Array }];
  })();
  assert.deepEqual(wrappedA.of(11), [11]);
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a parameter-filled wrapper slot
  const wrapArr = value => [value];
  const [{ from: wrappedFrom }] = wrapArr(Array);
  assert.deepEqual(wrappedFrom(new Set([12])), [12]);
  // a for-of ARRAY head over a bound container and over a call mirrors the whole level
  const held = [Array, 1];
  for (const [{ from: heldFrom }, beside] of [held]) assert.deepEqual(heldFrom(new Set([14])).concat(beside), [14, 1]);
  for (const [{ from: builtFrom }] of [(() => {
    return [Array];
  })()]) assert.deepEqual(builtFrom(new Set([15])), [15]);
  // ... the literal an IIFE returns is mirrored inside its body: the sibling slot and the effect stay
  let ticks = 0;
  for (const [{ from: bodyFrom }, tick] of [(() => {
    ticks++;
    return [Array, 1];
  })()]) assert.deepEqual(bodyFrom(new Set([16])).concat(tick, ticks), [16, 1, 1]);
  // a call element beside a bound sibling takes the slot's own default on both legs
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a call element beside a bound sibling
  const pairing = () => [Array, 1];
  for (const [{ from: pairedFrom }, side] of [pairing()]) assert.deepEqual(pairedFrom(new Set([17])).concat(side), [17, 1]);
  // an ARRAY pattern under a KEY descends after the key: a bound container, a call, a parameter slot,
  // a parameter default, a head
  const keyedHeld = { k: [Array] };
  const { k: [{ from: keyedFrom }] } = keyedHeld;
  assert.deepEqual(keyedFrom(new Set([18])), [18]);
  for (const { k: [{ from: keyedHeadFrom }] } of [keyedHeld]) assert.deepEqual(keyedHeadFrom(new Set([19])), [19]);
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a call yielding a keyed wrapper
  const keyedBuild = () => ({ k: [Array] });
  const { k: [{ from: keyedCallFrom }] } = keyedBuild();
  assert.deepEqual(keyedCallFrom(new Set([20])), [20]);
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a parameter-filled slot under a key
  const keyedWrap = value => ({ k: [1, value] });
  const { k: [, { from: keyedArgFrom }] } = keyedWrap(Array);
  assert.deepEqual(keyedArgFrom(new Set([21])), [21]);
  function keyedDefault({ k: [{ from }] } = keyedBuild()) { return from(new Set([22])); }
  assert.deepEqual(keyedDefault(), [22]);
  // ... and the level has to be an array: an object with a numeric key throws where the source does,
  // a truncated level throws, a repositioned level reads what the runtime holds
  assert.throws(() => {
    const keyedObject = { k: { 0: Array } };
    const { k: [{ from }] } = keyedObject;
    return from;
  }, TypeError);
  const truncated = [Array];
  truncated.length = 0;
  assert.throws(() => {
    const [{ from }] = truncated;
    return from;
  }, TypeError);
  const shifted = { k: [Array] };
  shifted.k.unshift({ from: () => 'shifted' });
  const { k: [{ from: shiftedFrom }] } = shifted;
  assert.same(shiftedFrom(), 'shifted');
  // a call with a PASSTHROUGH sibling runs once into a memo the sibling reads off: a head, a
  // parameter default, a call argument
  let calls = 0;
  // eslint-disable-next-line unicorn/consistent-function-style, no-sequences -- cover a call element beside a passthrough sibling
  const counted = () => (calls++, { k: Array, z: calls });
  for (const { k: { from: memoFrom }, z } of [counted()]) assert.deepEqual(memoFrom(new Set([23])).concat(z, calls), [23, 1, 1]);
  function memoDefault({ k: { from }, z } = counted()) { return from(new Set([24])).concat(z, calls); }
  assert.deepEqual(memoDefault(), [24, 2, 2]);
  assert.deepEqual(memoDefault({ k: { from: () => [] }, z: 0 }), [0, 2]);
  function memoArgument([{ from }, x]) { return from(new Set([25])).concat(x, calls); }
  // eslint-disable-next-line unicorn/consistent-function-style, no-sequences -- cover a call argument beside a passthrough sibling
  const pairCounted = () => (calls++, [Array, calls]);
  assert.deepEqual(memoArgument(pairCounted()), [25, 3, 3]);
  // a head over SEVERAL elements mirrors each of its own: a bound container beside a literal,
  // a call beside a literal
  const mixedHeld = [Array];
  const mixedSeen = [];
  for (const [{ from: mixedFrom }] of [mixedHeld, [Array]]) mixedSeen.push(mixedFrom(new Set([26]))[0]);
  assert.deepEqual(mixedSeen, [26, 26]);
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a call element beside a literal element
  const mixedBuild = () => [Array];
  for (const [{ from: mixedCallFrom }] of [mixedBuild(), [Array]]) mixedSeen.push(mixedCallFrom(new Set([27]))[0]);
  assert.deepEqual(mixedSeen, [26, 26, 27, 27]);
  // a parameter default over a bound container reads the sibling off the container by name
  const heldPair = [Array, 'pair'];
  function heldDefault([{ from }, tag] = heldPair) { return from(new Set([28])).concat(tag); }
  assert.deepEqual(heldDefault(), [28, 'pair']);
  // a NAME bound to the call pairs as the call does: a head, a parameter default, a call argument
  const boundBuilt = keyedBuild();
  for (const { k: [{ from: boundFrom }] } of [boundBuilt]) assert.deepEqual(boundFrom(new Set([29])), [29]);
  function boundDefault({ k: [{ from }] } = boundBuilt) { return from(new Set([30])); }
  assert.deepEqual(boundDefault(), [30]);
  function boundArgument({ k: [{ from }] }) { return from(new Set([31])); }
  assert.deepEqual(boundArgument(boundBuilt), [31]);
  // a head over several elements, transparent IIFEs and a parameter-filled slot among them
  const twoSeen = [];
  for (const { k: [{ from: twoFrom }] } of [(() => {
    return { k: [Array] };
  })(), keyedBuild()]) twoSeen.push(twoFrom(new Set([32]))[0]);
  assert.deepEqual(twoSeen, [32, 32]);
  // eslint-disable-next-line unicorn/consistent-function-style -- cover a parameter-filled slot under a nested level
  const keyedWrap2 = value => [{ k: value }];
  for (const [{ k: { from: mixedParamFrom } }] of [keyedWrap2(Array), [{ k: Array }]]) twoSeen.push(mixedParamFrom(new Set([33]))[0]);
  assert.deepEqual(twoSeen, [32, 32, 33, 33]);
  // the assignment form beside a bound sibling over a foreign wrapper
  let assignedFrom;
  let assignedBeside;
  // eslint-disable-next-line prefer-const -- the pattern ASSIGNMENT form is the claim
  [{ from: assignedFrom }, assignedBeside] = heldPair;
  assert.deepEqual(assignedFrom(new Set([34])).concat(assignedBeside), [34, 'pair']);
  // a SEQUENCE return keeps its effect in the callee, and the value still pairs
  // eslint-disable-next-line unicorn/consistent-function-style, no-sequences -- cover a sequence-returning arrow factory
  const seq = () => (log.push('seq'), { M: Map });
  const { M: viaSeq } = seq();
  assert.deepEqual(viaSeq.groupBy([13], value => value % 2).get(1), [13]);
  assert.deepEqual(log, ['block', 'seq']);
});

QUnit.test('inline returns: a running parameter list keeps the read it owes', assert => {
  const log = [];
  // concise body, effect-free argument: the LIST is the only thing that runs, and what it runs is
  // observable twice over - the slot's own read, and the throw an absent source owes
  // eslint-disable-next-line no-unused-vars -- the body reading NO bound name is the claim
  const { of } = (({ p }) => Array)({
    get p() {
      log.push('getter');
      return 1;
    },
  });
  assert.deepEqual(of(1, 2), [1, 2]);
  assert.deepEqual(log, ['getter']);
  assert.throws(() => {
    // eslint-disable-next-line no-unused-vars -- same claim, over a source the slot cannot read
    const { from } = (({ q }) => Array)(undefined);
    return from;
  }, TypeError);
});

QUnit.test('unknown container selections keep named statics available', assert => {
  function box(value) { return [value]; }
  const key = [0].pop();
  const nested = { values: [Promise] };
  assert.deepEqual(box(Array)[key].from([1, 2]), [1, 2]);
  const grouped = [Object][key].groupBy([1, 2], value => value % 2);
  assert.deepEqual([grouped[0], grouped[1]], [[2], [1]]);
  assert.same(Object.getPrototypeOf(grouped), null);
  const result = nested.values[key].withResolvers();
  assert.same(typeof result.resolve, 'function');
  assert.same(typeof result.reject, 'function');
  assert.same(typeof result.promise.then, 'function');
});

QUnit.test('a namesake parameter and a handed-out literal elsewhere keep a returned slot read', assert => {
  // the test above reads `box(Array)[key].from` through its local `box`. this one binds `box` as
  // the parameter of another function and hands a callback-carrying literal out: the pair once
  // made the census decide that callee's caller set on names alone, which left the read above on
  // the native static - the stripped realm holds it to the polyfill
  function relabel(box) { return box; }
  const key = [0].pop();
  const handout = { of: () => key };
  assert.deepEqual(relabel(handout), { of: handout.of });
  assert.same(relabel(handout).of(), 0);
});

QUnit.test('a container a call returns keeps the writes through its binding and runs its call once', assert => {
  let hits = 0;
  function make() {
    hits++;
    return [Array, Map];
  }
  // a slot write, a truncation and a handout through the binding replace what the literal spelled
  const written = make();
  written[0] = {};
  const [{ from: viaWritten } = {}] = written;
  assert.same(viaWritten, undefined);
  const truncated = make();
  truncated.length = 0;
  const [{ of: viaTruncated } = {}] = truncated;
  assert.same(viaTruncated, undefined);
  function hand(target) {
    target[0] = {};
  }
  const handed = make();
  hand(handed);
  const [{ from: viaHanded } = {}] = handed;
  assert.same(viaHanded, undefined);
  assert.same(hits, 3);
  // the untouched binding still reads the literal's static, and the call ran exactly once
  const kept = make();
  const [{ from: viaKept } = {}] = kept;
  assert.deepEqual(viaKept([1, 2]), [1, 2]);
  assert.same(hits, 4);
  // a keyed element read off the call runs it once, and so does a callee returning another call
  const { 0: { of: viaKeyed } = {} } = make();
  assert.deepEqual(viaKeyed(1, 2), [1, 2]);
  assert.same(hits, 5);
  function outer() {
    return make();
  }
  // eslint-disable-next-line no-unused-vars -- the call count is the claim
  const [{ from: viaNested } = {}] = outer();
  assert.same(hits, 6);
});

QUnit.test('a call runs before the bindings its destructure writes, and a named callee keeps its body', assert => {
  const log = [];
  function make() {
    log.push('make');
    return [Array];
  }
  // eslint-disable-next-line no-unused-vars -- the evaluation order is the claim
  const [{ from } = {}] = (log.push('prefix'), make());
  assert.deepEqual(log, ['prefix', 'make']);
  const seen = [];
  function read() {
    // the callee reads the hoisted binding the destructure writes
    seen.push(typeof early);
    return [Array, 7];
  }
  // eslint-disable-next-line no-var -- a hoisted binding the callee reads before the write
  var { 0: { of: early } = {}, 1: tail } = read();
  assert.deepEqual(seen, ['undefined']);
  assert.same(tail, 7);
  function realm() {
    return globalThis;
  }
  // eslint-disable-next-line no-unused-vars -- the callee's body is the claim
  const { Array: { of } } = realm() || globalThis;
  assert.same(realm(), globalThis);
});

QUnit.test('invocation slots: a parameter or a local named like a global holds its own value', assert => {
  const replacement = { from: () => 'OWN' };
  const seen = [];
  function log(value) {
    seen.push(value);
  }
  // a parameter read beside its slot proves nothing about the slot, and its name reads no global
  function beside(Array) {
    log(Array);
    return [Array];
  }
  const [{ from: viaParam } = {}] = beside(replacement);
  assert.same(viaParam([1]), 'OWN');
  assert.same(beside(replacement)[0].from([1]), 'OWN');
  // a body local spelled in the returned literal is the local, not the global
  function local(x) {
    const Array = replacement;
    return [Array, x];
  }
  const [{ from: viaLocal } = {}] = local(1);
  assert.same(viaLocal([1]), 'OWN');
  assert.same(local(1)[0].from([1]), 'OWN');
  // a slot whose argument the call omits holds undefined, so the default answers
  function slot(x) {
    return [x];
  }
  const [{ from: missing } = {}] = slot();
  assert.same(missing, undefined);
  assert.same(seen.length, 2);
});

QUnit.test('invocation slots: every spelling yields the container its callee builds', assert => {
  function make() {
    return [Array];
  }
  function Make() {
    return [Array];
  }
  const [{ from: viaTag }] = make`x`;
  assert.deepEqual(viaTag([1]), [1]);
  const [{ of: viaNew }] = new Make();
  assert.deepEqual(viaNew(2), [2]);
  const [A] = new Make();
  assert.deepEqual(A.from([3]), [3]);
  // a pattern over an ALIAS of the call reads the same slot
  const held = make();
  const [B] = held;
  assert.deepEqual(B.of(4), [4]);
});

QUnit.test('invocation slots: an await yields the callee container unless it is a thenable', assert => {
  const done = assert.async();
  function make() {
    return [Array];
  }
  function thenable() {
    // eslint-disable-next-line unicorn/no-thenable -- an awaited thenable is the claim
    return { then(resolve) { resolve({ k: { from: () => 'THEN' } }); }, k: Array };
  }
  // eslint-disable-next-line es/no-async-functions -- safe
  (async () => {
    const [{ from }] = await make();
    assert.deepEqual(from([1]), [1]);
    const { k: { from: viaThen } } = await thenable();
    assert.same(viaThen([1]), 'THEN');
    assert.same((await thenable()).k.from([1]), 'THEN');
    done();
  })();
});

// a method destructured off a literal is the callee a call of the name runs - unless the file wrote
// that slot before the capture: the name then holds the written function, and its result's static
// is read off what that returns
QUnit.test('inline returns: a destructured method written before the capture is the written one', assert => {
  const early = { make() { return Map; } };
  early.make = () => Set;
  const { make } = early;
  assert.same(typeof make().groupBy, 'undefined');
  const late = { build() { return Promise; } };
  const { build } = late;
  late.build = () => Set;
  assert.same(typeof build().try, 'function');
});
