/* eslint-disable es/no-shared-array-buffer -- testing */
import { DESCRIPTORS } from '../helpers/constants.js';

QUnit.test('ArrayBuffer#detached', assert => {
  assert.same(new ArrayBuffer(8).detached, false, 'default');

  const detached = new ArrayBuffer(8);
  try {
    structuredClone(detached, { transfer: [detached] });
  } catch { /* empty */ }

  if (detached.byteLength === 0) {
    // works incorrectly in ancient WebKit
    assert.skip.true(detached.detached, 'detached');
  }

  if (DESCRIPTORS) {
    const { get, configurable, enumerable } = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'detached');
    assert.same(configurable, true, 'configurable');
    assert.same(enumerable, false, 'non-enumerable');
    assert.isFunction(get);
    assert.looksNative(get);
    assert.throws(() => get.call(null), TypeError, 'non-generic-1');
    assert.throws(() => get(), TypeError, 'non-generic-2');
    assert.throws(() => get.call(1), TypeError, 'non-generic-3');
    assert.throws(() => get.call(true), TypeError, 'non-generic-4');
    assert.throws(() => get.call(''), TypeError, 'non-generic-5');
    assert.throws(() => get.call({}), TypeError, 'non-generic-6');
    if (typeof SharedArrayBuffer == 'function') {
      assert.throws(() => get.call(new SharedArrayBuffer(8)), TypeError, 'non-generic-7');
    }
  }
});
