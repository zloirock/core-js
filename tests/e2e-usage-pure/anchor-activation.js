// Foreign slot values keep the source default observable without declaring a source mutation.
import { withTemporaryProperty } from '../helpers/restore-property.cjs';
import { withChangingWindow, withWindowPresence } from './unbacked-window-host.cjs';

QUnit.test('an unclaimed realm pattern keeps its default and receiver effects', assert => {
  const events = [];
  let held;
  const value = withTemporaryProperty(globalThis, 'Array', undefined, () => {
    const { Array: { unknown } = (events.push('default'), { unknown: 31 }) } = (events.push('prefix'), held = globalThis);
    return unknown;
  });
  assert.same(value, 31);
  assert.same(held, globalThis);
  assert.deepEqual(events, ['prefix', 'default']);
});

QUnit.test('an unclaimed assignment and for-init retain the source slot', assert => {
  const events = [];
  function fallback() {
    events.push('default');
    return { get unknown() {
      events.push('read');
      return 23;
    } };
  }
  let value;
  const result = withTemporaryProperty(globalThis, 'Array', undefined, () => {
    ({ Array: { unknown: value } = fallback() } = globalThis);
    let iterations = 0;
    let seen;
    for (const { Array: { unknown } = fallback() } = globalThis; iterations < 1; iterations++) seen = unknown;
    return seen;
  });
  assert.same(value, 23);
  assert.same(result, 23);
  assert.deepEqual(events, ['default', 'read', 'default', 'read']);
});

QUnit.test('each computed realm hop keeps its own key and fallback', assert => {
  const proxy = 'globalThis';
  const ctor = 'Promise';
  const key = 'userSlotKey';
  const { [proxy]: { [ctor]: { prototype } } } = globalThis;
  assert.isFunction(prototype.then);
  let at;
  withTemporaryProperty(globalThis, key, undefined, () => {
    ({ globalThis: { [key]: { at } = [1, 2] } } = globalThis);
    assert.same(at.call([6]), 6);
  });
  withTemporaryProperty(globalThis, key, { groupBy: 'own' }, () => {
    const { globalThis: { [key]: { groupBy } = Map } } = globalThis;
    assert.same(groupBy, 'own');
  });
});

QUnit.test('a consumed assignment result stays the original realm', assert => {
  const proxy = 'self';
  const ctor = 'Map';
  let prototype;
  const result = withTemporaryProperty(globalThis, proxy, globalThis,
    () => ({ [proxy]: { [ctor]: { prototype } } } = globalThis));
  assert.same(result, globalThis);
  assert.isFunction(prototype.get);
});

// Effectful computed hops are locked before lowering in anchor-activation-runtime.mjs.
// This form also has a supported member spelling in the post-only lane.
QUnit.test('a consumed realm assignment serves nested constructors without native proxies', assert => {
  const events = [];
  let prototype;
  let unknown;
  const result = { self: { Promise: { prototype } } } = (events.push('init'), globalThis);
  assert.same(result, globalThis);
  assert.isFunction(prototype.then);
  assert.deepEqual(events, ['init']);
  const kept = { globalThis: { Array: { unknown } } } = globalThis;
  assert.same(kept, globalThis);
  assert.same(unknown, undefined);
});

QUnit.test('a surviving claim reads the stored guarded receiver once', assert => {
  withChangingWindow(() => {
    let saved;
    let name;
    // eslint-disable-next-line prefer-const, @stylistic/no-extra-parens -- The assignment and stored source are the forms under test.
    ({ Map: { name } } = (saved = globalThis.window?.self));
    assert.same(saved, globalThis);
    assert.same(typeof name, 'string');
  });
  for (const requested of [false, true]) withWindowPresence(requested, present => {
    const effects = [];
    let saved;
    let result;
    try {
      const { Map: { name } } = (effects.push('prefix'), saved = globalThis.window?.self);
      result = typeof name;
    } catch (error) {
      result = error.name;
    }
    assert.same(result, present ? 'string' : 'TypeError');
    assert.same(saved, present ? globalThis : undefined);
    assert.deepEqual(effects, ['prefix']);
  });
});

QUnit.test('a binding-free constructor property still coerces its value', assert => {
  const log = [];
  assert.throws(() => {
    // eslint-disable-next-line no-empty-pattern -- the child still coerces its value
    const { Promise: { absent: {} } } = globalThis;
    log.push('after');
  }, TypeError);
  assert.throws(() => {
    // eslint-disable-next-line no-empty-pattern -- the child must acquire an iterator
    for (let { Promise: { absent: [] } } = globalThis, i = 0; i < 1; i++) log.push('loop');
  }, TypeError);
  assert.deepEqual(log, []);
});
