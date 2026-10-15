// Public readers keep their supplied receivers outside the closed caller census.
export function readEffectfulSlots(source, effect) {
  const { y: { at } } = { y: source.y, z: effect() };
  return at;
}

export function assignEffectfulSlots(source, effect) {
  let at;
  // eslint-disable-next-line prefer-const -- the assignment host is under test
  ({ y: { at } } = { z: effect(), y: source.y });
  return at;
}

export function readSpreadSlot(source, choose) {
  const { y: { at } } = { ...source, y: choose ? [5, 6] : [7, 8] };
  return at;
}

export function readForwardDefault(factory, key) {
  const { [(key(), 'values')]: value = after, after } = factory();
  return [value, after];
}

export function readForwardAt(factory, key) {
  const { [(key(), 'at')]: value = after, after } = factory();
  return [value, after];
}

export function readMissingSourceKey(factory) {
  // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- the source key must throw before the property is read
  const { [(unboundDestructureKey, 'at')]: value = after, after } = factory();
  return [value, after];
}

export function readConditionalSourceKey(factory, choose) {
  const row = factory();
  // eslint-disable-next-line no-undef, prefer-template -- the folded concatenation must preserve its selected prefix
  return row[(choose ? (unboundDestructureKey, 'a') : 'a') + 't'];
}

export function readGuardedRealmPrototype(Constructor) {
  let realm = globalThis;
  function rebind() {
    realm = {};
    // eslint-disable-next-line unicorn/no-typeof-undefined -- the presence-guard spelling is under test
    if (typeof Constructor === 'undefined') realm = { Array: { prototype: 'ab' } };
  }
  rebind();
  const { Array: { prototype: { includes } } } = realm;
  return includes;
}

QUnit.test('destructuring: literal slots finish before their instance method is read', assert => {
  const events = [];
  const row = [1, 2];
  const source = {
    get y() { events.push('y'); return row; },
    get z() { events.push('z'); return 1; },
  };
  const { y: { at } } = { y: source.y, z: source.z };
  assert.same(at.call(row, -1), 2);
  assert.deepEqual(events, ['y', 'z']);
  events.length = 0;
  /* eslint-disable block-scoped-var, no-var, no-unreachable-loop, no-unmodified-loop-condition -- the var initializer and its surviving bindings are the hosts under test */
  for (var { y: { includes } } = { y: source.y, z: source.z }; !includes;) break;
  assert.true(includes.call(row, 2));
  assert.deepEqual(events, ['y', 'z']);
  let effects = 0;
  for (var { y: { flat } } = { y: [1, [2]], z: effects++ }; !flat;) break;
  assert.deepEqual(flat.call([1, [2]]), [1, 2]);
  /* eslint-enable block-scoped-var, no-var, no-unreachable-loop, no-unmodified-loop-condition -- the loop initializer cases end here */
  assert.same(effects, 1);
  const custom = {
    get at() { events.push('at'); return 7; },
  };
  assert.same(readEffectfulSlots({ y: custom }, () => events.push('effect')), 7);
  assert.deepEqual(events, ['y', 'z', 'effect', 'at'], 'all initializer effects precede the claimed getter');
  assert.same(assignEffectfulSlots(source, () => events.push('assignment')).call(row, -1), 2);
  assert.deepEqual(events, ['y', 'z', 'effect', 'at', 'assignment', 'y']);
});

QUnit.test('destructuring: a prefixed array alias serves present elements and keeps defaults', assert => {
  const row = [5, 6];
  const wrapper = [row];
  let effects = 0;
  let defaults = 0;
  let at;
  [{ at } = (defaults++, {})] = (effects++, wrapper);
  assert.same(at.call(row, -1), 6);
  assert.deepEqual([effects, defaults], [1, 0]);
  [{ at } = (defaults++, [7, 8])] = (effects++, []);
  assert.same(at.call([7, 8], -1), 8);
  assert.deepEqual([effects, defaults], [2, 1]);
});

QUnit.test('destructuring: a spread finishes before a selecting slot is read', assert => {
  let effects = 0;
  const source = {
    get z() { effects++; return 1; },
  };
  assert.same(readSpreadSlot(source, true).call([5, 6], -1), 6);
  assert.same(readSpreadSlot(source, false).call([7, 8], -1), 8);
  assert.same(effects, 2);
});

QUnit.test('destructuring: prefixed realm selections serve each prototype slot', assert => {
  const events = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- the getter is the selection prefix under test
  class Source {
    static get effect() { events.push('effect'); return 0; }
  }
  const { Array: { prototype: { at } } } = (Source.effect, globalThis) ?? {};
  assert.same(at.call([5, 6], -1), 6);
  const { Array: { prototype: { includes, flat } } } = (Source.effect, globalThis) ?? {};
  assert.true(includes.call([5, 6], 6));
  assert.deepEqual(flat.call([1, [2]]), [1, 2]);
  const { String: { prototype: { includes: stringIncludes } } } = (events.push('call'), globalThis) || {};
  assert.true(stringIncludes.call('ab', 'b'));
  assert.deepEqual(events, ['effect', 'effect', 'call']);
});

QUnit.test('destructuring: a forward default stays behind the instance read', assert => {
  const events = [];
  const row = [5, 6];
  const [values, after] = readForwardDefault(() => {
    events.push('init');
    return row;
  }, () => events.push('key'));
  assert.same(values.call(row).next().value, 5);
  assert.same(after, undefined);
  assert.deepEqual(events, ['init', 'key']);
  const [at] = readForwardAt(() => row, () => events.push('at-key'));
  assert.same(at.call(row, -1), 6, 'the stripped method is served before its forward default');
  const custom = {
    get values() { events.push('values'); return 7; },
    get after() { events.push('after'); return 9; },
  };
  assert.deepEqual(readForwardDefault(() => custom, () => events.push('key')), [7, 9]);
  assert.deepEqual(events, ['init', 'key', 'at-key', 'key', 'values', 'after']);
  // Every e2e bundle lowers the later binding to var. The differential also checks the source TDZ.
  assert.deepEqual(readForwardDefault(() => ({ values: undefined, after: 9 }), () => 0), [undefined, 9]);
});

QUnit.test('destructuring: a reused split receiver retains its initializer prefix', assert => {
  const events = [];
  const source = { row: [5, 6], other: 1 };
  const { [(events.push('key'), 'row')]: { at }, other } = (events.push('prefix'), source);
  assert.same(at.call([5, 6], -1), 6);
  assert.same(other, 1);
  assert.deepEqual(events, ['prefix', 'key']);
  let step;
  const missing = { row: {}, tail: 1 };
  const { [(events.push('default-key'), 'row')]: { includes = step }, tail } = (step = 9, missing);
  assert.deepEqual([includes, tail], [9, 1]);
  assert.same(step, 9, 'the initializer write stays observable');
});

QUnit.test('destructuring: a source key read throws before its method read', assert => {
  let reads = 0;
  const source = {
    get at() { reads++; return 7; },
    after: 9,
  };
  assert.throws(() => readMissingSourceKey(() => source), ReferenceError);
  assert.same(reads, 0);
  assert.throws(() => readConditionalSourceKey(() => [5, 6], true), ReferenceError);
  assert.same(readConditionalSourceKey(() => [5, 6], false).call([5, 6], -1), 6);
});

QUnit.test('destructuring: bound defaults and reassignable realm names keep instance claims', assert => {
  const { x = [5, [6]] } = {};
  const { w: { at, flat } = [1, [2]] } = { w: x };
  assert.deepEqual(at.call(x, -1), [6]);
  assert.deepEqual(flat.call(x), [5, 6]);
  let effects = 0;
  let realm = globalThis;
  function rebind() { realm = {}; }
  const { Array: { prototype: { includes, values } } } = (effects++, realm);
  assert.true(includes.call([5, 6], 6));
  assert.same(values.call([5, 6]).next().value, 5);
  assert.same(effects, 1);
  rebind();
  assert.throws(() => {
    const { Array: { prototype: { at: missing } } } = realm;
    return missing;
  }, TypeError, 'an absent intermediate slot still throws');
  let mixedRealm = globalThis;
  function writeString() { mixedRealm = { Array: { prototype: 'ab' } }; }
  writeString();
  const { Array: { prototype: { at: stringAt } } } = (effects++, mixedRealm);
  assert.same(stringAt.call('ab', -1), 'b', 'a real string alternative keeps its dispatcher family');
  assert.same(effects, 2);
  assert.true(readGuardedRealmPrototype(undefined).call('ab', 'b'), 'an undecided guard keeps the string alternative');
  assert.throws(() => readGuardedRealmPrototype(Array), TypeError, 'the other guard arm leaves a missing intermediate slot');
});
