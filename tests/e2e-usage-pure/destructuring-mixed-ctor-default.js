// Constructor defaults must select the ponyfill even beside a claim-free nested pattern.
// Exported functions and supplied objects must keep the default and caller arms independent.
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

export function readMixedCtor({ Math: { floor }, Set: Ctor } = globalThis) {
  return [floor(1.9), Ctor];
}

QUnit.test('mixed constructor default: exported function and supplied receiver', assert => {
  const defaulted = readMixedCtor();
  assert.same(defaulted[0], 1);
  // Standalone post sees an arguments-based union after Babel removes the parameter pattern.
  // The source-pattern legs, including both stripped bundles, own this constructor selection.
  if (typeof E2E_DETECT_LOWERED === 'undefined') {
    assert.same(defaulted[1], Set, 'the default binds the pure constructor, including over a native');
  }
  assert.same(new defaulted[1]([7]).has(7), true);
  function Custom() { /* empty */ }
  const supplied = readMixedCtor({ Math: { floor: () => 9 }, Set: Custom });
  assert.deepEqual(supplied, [9, Custom], 'a supplied constructor and nested method stay native');
});

QUnit.test('mixed constructor mirror: a native getter runs after the preceding write', assert => {
  let ctor = 0;
  let value;
  withTemporaryProperty(globalThis, 'mixedCtorProbe', { get x() { return typeof ctor; } }, () => {
    ({ Set: ctor, mixedCtorProbe: { x: value } } = globalThis);
    assert.same(value, 'function');
  });
});

QUnit.test('mixed constructor default: expression body and nested wrappers', assert => {
  const first = (({ Promise: Ctor, Array: { at } } = globalThis) => [Ctor, at])();
  const last = (({ Array: { at }, Set: Ctor } = globalThis) => [Ctor, at])();
  const nested = (([[{ WeakSet: Ctor, Array: { at } } = globalThis]]) => [Ctor, at])([[]]);
  if (typeof E2E_DETECT_LOWERED === 'undefined') {
    assert.same(first[0], Promise, 'an expression body still replaces a present native');
    assert.same(last[0], Set, 'a preceding nested pattern does not suppress the constructor');
    assert.same(nested[0], WeakSet, 'array wrappers retain the constructor mirror');
  }
  assert.same(typeof first[0].resolve, 'function');
  assert.same(new last[0]([7]).has(7), true);
  const key = {};
  assert.same(new nested[0]([key]).has(key), true);
  assert.deepEqual([first[1], last[1], nested[1]], [undefined, undefined, undefined]);
});

QUnit.test('constructor pattern: a decided realm alias keeps its source leaf default', assert => {
  const events = [];
  /* eslint-disable no-var, block-scoped-var -- the conditional hoisted alias is the source form under test */
  function read(enabled) {
    if (enabled) { var realm = globalThis; }
    const { Promise: { missing = (events.push('default'), Array.of(7)) } } = realm;
    return missing;
  }
  function skipped(enabled) {
    if (enabled) { var realm = globalThis; }
    const { Promise: { missing = (events.push('skipped-default'), Array.of(9)) } } = realm;
    return missing;
  }
  /* eslint-enable no-var, block-scoped-var -- both source aliases end here */
  // A neighbouring constructor import must not hide a native read of realm.Promise.
  withTemporaryProperty(globalThis, 'Promise', undefined, () => {
    assert.deepEqual(read(true), [7], 'the retained pattern reads the served constructor');
    assert.throws(() => skipped(false), TypeError, 'a skipped initialization still rejects before its default');
  });
  assert.deepEqual(events, ['default'], 'the original leaf default runs once, after the constructor read');
});
