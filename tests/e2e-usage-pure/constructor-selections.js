import { withTemporaryProperty } from '../helpers/restore-property.cjs';

QUnit.test('constructor selections: conditional pattern aliases retain raw static reads', assert => {
  let M;
  if (assert) ({ Map: M } = globalThis);
  assert.true('groupBy' in M);

  let P;
  if (assert) ({ Promise: P } = globalThis);
  function read({ try: method } = P) { return typeof method; }
  assert.same(read(), 'function');

  let S;
  if (assert) ({ Symbol: S } = globalThis);
  const { iterator: value = 'fallback' } = S;
  // Symbol is object-backed on engines without native symbols.
  assert.same(value, Symbol.iterator);
});

QUnit.test('constructor selections: a closure before its realm initializer keeps statics', assert => {
  function read() { return realm.Promise.resolve(7); }
  // eslint-disable-next-line no-var -- the pre-initializer closure exercises a hoisted binding
  var realm = globalThis;
  return read().then(value => assert.same(value, 7));
});

QUnit.test('constructor selections: captured intrinsic sibling keeps the static and identity', assert => {
  function read(source) {
    let name, groupBy;
    const host = { name, groupBy } = source || Map;
    return [host, typeof name, groupBy];
  }
  const builtin = read(null);
  assert.same(builtin[0], Map);
  assert.same(builtin[1], 'string');
  assert.same(typeof builtin[2], 'function');
  assert.deepEqual(builtin[2]([7], value => value).get(7), [7]);
  const user = { name: 'user', groupBy: 9 };
  assert.deepEqual(read(user), [user, 'string', 9]);
});

QUnit.test('constructor selections: opaque keys keep native statics as an accepted pure boundary', assert => {
  function read(array, key) {
    let C = Object;
    if (array) C = Array;
    return C[key];
  }
  assert.same(read(true, 'from'), Object.getOwnPropertyDescriptor(Array, 'from')?.value);
  assert.same(read(false, 'groupBy'), Object.getOwnPropertyDescriptor(Object, 'groupBy')?.value);
});

QUnit.test('constructor selections: captured realm assignments keep the realm and polyfill the alias', assert => {
  function read(enabled) {
    let C;
    const realm = enabled && ({ Map: C } = globalThis);
    if (!enabled) return [realm, C];
    const { groupBy: method = 'fallback' } = C;
    return [realm, method];
  }
  const [realm, method] = read(true);
  assert.same(realm, globalThis);
  assert.deepEqual(method([7], value => value).get(7), [7]);
  assert.deepEqual(read(false), [false, undefined]);
});

QUnit.test('constructor selections: aliases keep separate receiver cache domains', assert => {
  function read(flag) {
    const { Map: M } = globalThis;
    const box = { x: flag ? M : Math };
    const first = 'groupBy' in box.x;
    let C = M;
    if (flag) C = Math;
    return [first, 'groupBy' in C];
  }
  assert.deepEqual(read(true), [true, false]);
  assert.deepEqual(read(false), [false, true]);
});

QUnit.test('constructor selections: an opaque selected source can replace the realm', assert => {
  function read(flag, factory) {
    // eslint-disable-next-line no-useless-assignment -- the initial realm must not prove an opaque later value
    let realm = globalThis;
    ({ value: realm } = flag ? { value: globalThis } : factory());
    return [realm === globalThis, realm.Array.from([7])[0]];
  }
  function makeUserRealm() { return { value: { Array: { from: () => [9] } } }; }
  assert.deepEqual(read(true, makeUserRealm), [true, 7]);
  assert.deepEqual(read(false, makeUserRealm), [false, 9]);
});

QUnit.test('constructor selections: a fallback its constructor left decides reads that left statics', assert => {
  let effects = 0;
  let calls = 0;
  function make() {
    calls++;
    return Promise;
  }
  assert.deepEqual((Array ?? WeakSet).from('ab'), ['a', 'b']);
  assert.deepEqual(((effects++, Object) || WeakMap).fromEntries([['k', 1]]), { k: 1 });
  assert.same(effects, 1);
  assert.same(typeof (make() || Set).withResolvers, 'function');
  assert.same(calls, 1);
  let stored;
  assert.deepEqual(((stored = Map) || Set).groupBy([1, 2], value => value % 2).get(1), [1]);
  assert.same(stored, Map);
  const { of } = (effects++, Array) || WeakSet;
  assert.deepEqual(of(3), [3]);
  assert.same(effects, 2);
});

QUnit.test('constructor selections: a global core-js extends in place decides off the realm too', assert => {
  // every engine carries it, so the member read over the selection takes the polyfilled static
  let effects = 0;
  assert.deepEqual((globalThis.Array || WeakSet).from('cd'), ['c', 'd']);
  assert.same((globalThis.Math || (effects++, WeakMap)).sumPrecise([1, 2]), 3);
  assert.same(effects, 0);
  const { fromEntries } = globalThis.Object || (effects++, Set);
  assert.deepEqual(fromEntries([['k', 2]]), { k: 2 });
  assert.same(effects, 0);
  // ... and so does one it patches in place and ships no pure replacement of
  assert.true((globalThis.Number || (effects++, WeakMap)).isInteger(5));
  assert.same(typeof (globalThis.RegExp || (effects++, Set)).escape, 'function');
  assert.true((globalThis.TypeError || (effects++, Map)).isError(new TypeError('x')));
  const { isSafeInteger } = globalThis.Number || (effects++, WeakSet);
  assert.true(isSafeInteger(7));
  assert.same(effects, 0);
});

QUnit.test('constructor selections: a left read off the realm decides only where the build serves it', assert => {
  // a realm read of a global the engine lacks is `undefined`, so the right runs and needs its own polyfill
  withTemporaryProperty(Function('return this')(), 'Document', undefined, () => {
    const { of } = globalThis.Document || Array;
    assert.deepEqual(of(1, 2), [1, 2]);
    let effects = 0;
    const { from } = (effects++, globalThis.Document) ?? Array;
    assert.deepEqual(from('ab'), ['a', 'b']);
    assert.same(effects, 1);
    // ... and so is an alias holding that read
    const Doc = globalThis.Document;
    const { from: viaAlias } = Doc || Array;
    assert.deepEqual(viaAlias('cd'), ['c', 'd']);
    // ... and a call returning it
    function getDocument() {
      return globalThis.Document;
    }
    const { from: viaCall } = getDocument() || Array;
    assert.deepEqual(viaCall('ef'), ['e', 'f']);
  });
});

QUnit.test('constructor selections: a right static named like an instance method keeps its own entry', assert => {
  // `entries` / `values` name instance methods too, and that must not hand the claim to a left the engine
  // lacks: the right runs, and its static is the polyfill, on every spelling of the left and every host
  withTemporaryProperty(Function('return this')(), 'Document', undefined, () => {
    const source = { a: 1 };
    const { entries } = globalThis.Document || Object;
    assert.deepEqual(entries(source), [['a', 1]]);
    const { values } = globalThis.Document ?? Object;
    assert.deepEqual(values(source), [1]);
    const Doc = globalThis.Document;
    const { entries: viaAlias } = Doc || Object;
    assert.deepEqual(viaAlias(source), [['a', 1]]);
    const { Document: Bound } = globalThis;
    const { values: viaBinding } = Bound ?? Object;
    assert.deepEqual(viaBinding(source), [1]);
    function getDocument() {
      return globalThis.Document;
    }
    const { entries: viaCall } = getDocument() || Object;
    assert.deepEqual(viaCall(source), [['a', 1]]);
    let viaAssignment;
    if (assert) ({ values: viaAssignment } = globalThis.Document || Object);
    assert.deepEqual(viaAssignment(source), [1]);
    function read({ entries: viaDefault } = globalThis.Document ?? Object) {
      return viaDefault(source);
    }
    assert.deepEqual(read(), [['a', 1]]);
  });
});

QUnit.test('constructor selections: a member read over an undecided selection serves its native-owner arm', assert => {
  // the selection is captured once and the value that arrived picks the read: an arm naming a constructor
  // core-js ships no replacement of reads its static through the polyfill - an engine lacking the native
  // one included - and any other value reads its own member
  function from(source) {
    return (source || Array).from('ab');
  }
  assert.deepEqual(from(undefined), ['a', 'b']);
  assert.same(from({ from: () => 'own' }), 'own');
  let effects = 0;
  function fromEntries(source) {
    return (source ?? (effects++, Object)).fromEntries([['k', 1]]);
  }
  assert.deepEqual(fromEntries(null), { k: 1 });
  assert.same(effects, 1);
  function isInteger(flag, user) {
    return (flag ? Number : user).isInteger(7);
  }
  assert.true(isInteger(true, null));
  assert.same(isInteger(false, { isInteger: () => 'own' }), 'own');
  // ... and a realm read of a global the engine lacks hands the read to the right arm
  withTemporaryProperty(Function('return this')(), 'Document', undefined, () => {
    assert.deepEqual((globalThis.Document || Array).of(1, 2), [1, 2]);
  });
});

QUnit.test('constructor selections: a key other receivers carry as an instance method dispatches on them', assert => {
  // the constructor arm reads its static through the polyfill, any other value the instance method its
  // own dispatch finds - invoked on that value, and an absorbed `?.()` asking the method itself
  function entries(source) {
    return (source ?? Object).entries({ k: 1 });
  }
  assert.deepEqual(entries(null), [['k', 1]]);
  assert.deepEqual(Array.from(entries([7])), [[0, 7]]);
  function values(source) {
    return (source ?? Object).values?.({ k: 2 });
  }
  assert.deepEqual(values(undefined), [2]);
  assert.same(values({}), undefined);
});
