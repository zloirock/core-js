/* eslint-disable @stylistic/no-extra-parens -- Explicit source parentheses are part of the guard contract. */
import { withWindowPresence } from './unbacked-window-host.cjs';
import { withTemporaryProperty } from '../helpers/restore-property.cjs';

declare global {
  var optionalWrapperValue: number;
}

QUnit.test('erased assertions retain the stored optional receiver guard', assert => {
  withTemporaryProperty(Function('return this')(), 'optionalWrapperValue', 23, () => {
    for (const requested of [false, true]) withWindowPresence(requested, present => {
      const effects = [];
      let held;
      const value = (effects.push('prefix'), held = globalThis.window)?.self![(effects.push('key'), 'optionalWrapperValue')];
      assert.strictEqual(value, present ? 23 : undefined);
      assert.deepEqual(effects, present ? ['prefix', 'key'] : ['prefix']);
      assert.strictEqual(held, present ? globalThis : undefined);
      function sealed() {
        return ((held = globalThis.window)?.self)!.optionalWrapperValue;
      }
      if (present) assert.strictEqual(sealed(), 23);
      else assert.throws(sealed, TypeError);
    });
  });
});

QUnit.test('source realm aliases retain their optional window probe', assert => {
  withTemporaryProperty(Function('return this')(), 'optionalWrapperValue', 23, () => {
    for (const requested of [false, true]) withWindowPresence(requested, present => {
      const first = globalThis;
      const realm = first;
      assert.strictEqual(realm?.window?.self.optionalWrapperValue, present ? 23 : undefined);
      assert.strictEqual(realm?.window?.self?.optionalWrapperValue, present ? 23 : undefined);
    });
  });
});

QUnit.test('parenthesized static receivers keep the guard and argument order', assert => {
  for (const absent of [false, true]) {
    let realm: any = globalThis;
    if (absent) realm = null;
    const effects = [];
    const value = ((realm))?.Array.of((effects.push('argument'), 3))!.length;
    assert.strictEqual(value, absent ? undefined : 1);
    assert.deepEqual(effects, absent ? [] : ['argument']);
    function sealed() {
      return (realm?.Array.of(3))!.length;
    }
    if (absent) assert.throws(sealed, TypeError);
    else assert.strictEqual(sealed(), 1);
  }
});
