/* global UserUndefined -- a user global another script declares, installed below for each run */
import { withTemporaryProperty } from '../helpers/restore-property.cjs';
import { withRealmSelf, withRealmSlot } from './window-without-self-host.js';

// a realm key that names no built-in is an unknown slot, capitalised or not: where the realm leaves
// it empty the pattern's inner default supplies the value, and where another script put the user's
// own object there, that object is read. neither the capital letter nor the realm root proves the
// slot, so every host keeps both arms - one host per test, so no host's failure hides another's
QUnit.test('realm slot defaults: an absent runtime global keeps its literal default', assert => {
  const { Deno: { env } = {} } = globalThis;
  assert.same(env, undefined);
});

QUnit.test('realm slot defaults: a declaration falls back to the default', assert => {
  const { UserMaps: { groupBy } = Map } = globalThis;
  assert.deepEqual(groupBy([1, 2, 3], x => x % 2).get(1), [1, 3]);
});

QUnit.test('realm slot defaults: an assignment falls back to the default', assert => {
  let from;
  // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
  ({ UserArrays: { from } = Array } = globalThis);
  assert.deepEqual(from('ab'), ['a', 'b']);
});

QUnit.test('realm slot defaults: a for-of head falls back to the default', assert => {
  for (const { UserObjects: { fromEntries } = Object } of [globalThis]) {
    assert.deepEqual(fromEntries([['a', 1]]), { a: 1 });
  }
});

QUnit.test('realm slot defaults: an array wrapper falls back to the default', assert => {
  const [{ UserNumbers: { isInteger } = Number }] = [globalThis];
  assert.true(isInteger(5));
});

QUnit.test('realm slot defaults: a realm alias falls back to the default', assert => {
  const realm = globalThis;
  const { UserLists: { of } = Array } = realm;
  assert.deepEqual(of(1, 2), [1, 2]);
});

QUnit.test('realm slot defaults: a computed key falls back to the default', assert => {
  const key = 'UserOwners';
  const { [key]: { hasOwn } = Object } = globalThis;
  assert.true(hasOwn({ a: 1 }, 'a'));
});

QUnit.test('realm slot defaults: a proxy hop falls back to the default', assert => {
  const { self: { UserGroups: { groupBy } = Object } = {} } = globalThis;
  assert.deepEqual(groupBy([1, 2, 3], x => x % 2 ? 'odd' : 'even').odd, [1, 3]);
});

QUnit.test('realm slot defaults: an instance leaf falls back to the default', assert => {
  const { UserRanges: { at } = [1, 2] } = globalThis;
  assert.same(at.call([5, 6], -1), 6);
});

QUnit.test('realm slot defaults: a lowercase key falls back to the default', assert => {
  const { userLists: { of } = Array } = globalThis;
  assert.deepEqual(of(3), [3]);
});

// a proxy hop under an array wrapper reads the live `self` slot, native as written, so the realm is
// given one from outside for the run (Node has none)
QUnit.test('realm slot defaults: an instance leaf under a wrapper and a proxy hop falls back to the default', assert => {
  withRealmSelf(() => {
    const [{ self: { userFinders: { includes } = [1, 2] } }] = [globalThis];
    assert.true(includes.call([5, 6], 6));
  });
});

// a name read unbound is a realm slot too, and one another script declared may hold `undefined`:
// the argument or element it pairs with then leaves the default to answer
QUnit.test('realm slot defaults: an argument naming an undefined user global keeps the default live', assert => {
  withRealmSlot('UserUndefined', undefined, () => {
    const groupBy = (({ groupBy: fromDefault } = Map) => fromDefault)(UserUndefined);
    assert.deepEqual(groupBy([1, 2, 3], x => x % 2).get(1), [1, 3]);
  });
});

QUnit.test('realm slot defaults: an array element naming an undefined user global keeps the default live', assert => {
  withRealmSlot('UserUndefined', undefined, () => {
    const [{ groupBy } = Map] = [UserUndefined];
    assert.deepEqual(groupBy([1, 2, 3], x => x % 2).get(1), [1, 3]);
  });
});

QUnit.test('realm slot defaults: an installed capitalised global keeps its members', assert => {
  withTemporaryProperty(globalThis, 'UserInstalled', { groupBy: () => 'own' }, () => {
    const { UserInstalled: { groupBy } = Map } = globalThis;
    assert.same(groupBy(), 'own', 'declaration');
    let assigned;
    // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
    ({ UserInstalled: { groupBy: assigned } = Map } = globalThis);
    assert.same(assigned(), 'own', 'assignment');
  });
});

QUnit.test('realm slot defaults: an installed lowercase global keeps its members in a declaration', assert => {
  withTemporaryProperty(globalThis, 'userInstalled', { groupBy: () => 'own' }, () => {
    const { userInstalled: { groupBy } = Map } = globalThis;
    assert.same(groupBy(), 'own');
  });
});

QUnit.test('realm slot defaults: an installed lowercase global keeps its members in an assignment', assert => {
  withTemporaryProperty(globalThis, 'userInstalled', { groupBy: () => 'own' }, () => {
    let groupBy;
    // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
    ({ userInstalled: { groupBy } = Map } = globalThis);
    assert.same(groupBy(), 'own');
  });
});

QUnit.test('realm slot defaults: an installed lowercase global keeps its members under a computed key', assert => {
  withTemporaryProperty(globalThis, 'userInstalled', { groupBy: () => 'own' }, () => {
    const key = 'userInstalled';
    const { [key]: { groupBy } = Map } = globalThis;
    assert.same(groupBy(), 'own');
  });
});

// a KNOWN name core-js implements nothing of is a slot an engine may leave empty too (`WeakRef` on
// IE11): its level's default stays live and answers through its own polyfill. the slot is emptied
// for the run, as such an engine has it, and restored after
/* eslint-disable es/no-weakrefs -- the unfilled-slot claim is the shape under test; the slot is only
   read, and emptied for the run, so `WeakRef` itself is never invoked */
QUnit.test('realm slot defaults: an unfilled built-in slot falls back to the default in a declaration', assert => {
  withTemporaryProperty(globalThis, 'WeakRef', undefined, () => {
    const { WeakRef: { of } = Array } = globalThis;
    assert.deepEqual(of(1, 2), [1, 2]);
  });
});

QUnit.test('realm slot defaults: an unfilled built-in slot falls back to the default in an assignment', assert => {
  withTemporaryProperty(globalThis, 'WeakRef', undefined, () => {
    let from;
    // eslint-disable-next-line prefer-const -- the assignment pattern is the tested host
    ({ WeakRef: { from } = Array } = globalThis);
    assert.deepEqual(from('ab'), ['a', 'b']);
  });
});

QUnit.test('realm slot defaults: an unfilled built-in slot under a proxy hop falls back to the default', assert => {
  withRealmSelf(() => withTemporaryProperty(globalThis, 'WeakRef', undefined, () => {
    const { self: { WeakRef: { of } = Array } } = globalThis;
    assert.deepEqual(of(3), [3]);
  }));
});
/* eslint-enable es/no-weakrefs -- end of the unfilled-slot forms */
