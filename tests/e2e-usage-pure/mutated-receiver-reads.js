/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- The written self slot is the receiver under test. */
import { restoreProperty } from '../helpers/restore-property.cjs';

QUnit.test('written realm roots supply nested instance receivers once', assert => {
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'self');
  const effects = [];
  try {
    globalThis.self = { get Array() {
      effects.push('Array');
      return { get prototype() {
        effects.push('prototype');
        return Array.prototype;
      } };
    } };
    const { prototype: { at } } = self.Array;
    assert.same(at.call([3, 4], -1), 4);
    assert.deepEqual(effects, ['Array', 'prototype']);
    effects.length = 0;
    let method;
    ({ prototype: { at: method } } = self.Array);
    assert.same(method.call([5, 6], 0), 5);
    assert.deepEqual(effects, ['Array', 'prototype']);
    effects.length = 0;
    if (at) ({ prototype: { at: method } } = self.Array);
    assert.same(method.call([7, 8], -1), 8);
    assert.deepEqual(effects, ['Array', 'prototype']);
  } finally {
    restoreProperty(globalThis, 'self', saved);
  }
});
