/* eslint-disable es/no-shared-array-buffer -- testing */
import { GLOBAL } from '../helpers/constants.js';
import { fromSource } from '../helpers/helpers.js';

QUnit.test('ArrayBuffer#detached', assert => {
  assert.same(new ArrayBuffer(8).detached, false, 'default');
  assert.false(new ArrayBuffer(0).detached, 'an empty buffer is attached');
  if (GLOBAL.WebAssembly?.Memory) {
    const memory = new GLOBAL.WebAssembly.Memory({ initial: 0 });
    const { buffer } = memory;
    assert.false(buffer.detached, 'empty WebAssembly memory is attached');
    // Node 10.24 and Chrome 67-73 keep the old empty buffer usable after growth.
    // Check detachment after growing non-empty memory instead.
    memory.grow(1);
    const nonEmptyBuffer = memory.buffer;
    memory.grow(1);
    assert.true(nonEmptyBuffer.detached, 'growing WebAssembly memory detaches the old buffer');
  }

  const detached = new ArrayBuffer(8);
  try {
    structuredClone(detached, { transfer: [detached] });
  } catch { /* empty */ }

  if (detached.byteLength === 0) {
    assert.true(detached.detached, 'detached');
    const empty = new ArrayBuffer(0);
    structuredClone(empty, { transfer: [empty] });
    assert.true(empty.detached, 'detached empty buffer');
  }

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
  if (fromSource('ArrayBuffer.prototype.byteLength') === 0) {
    // In IE10-11 the prototype itself is an empty ArrayBuffer.
    assert.false(get.call(ArrayBuffer.prototype), 'attached prototype buffer');
  } else {
    assert.throws(() => get.call(ArrayBuffer.prototype), TypeError, 'non-generic prototype');
  }
  assert.throws(() => get.call(Object.create(ArrayBuffer.prototype)), TypeError, 'non-generic inherited prototype');
  assert.throws(() => get.call(new DataView(new ArrayBuffer(8))), TypeError, 'non-generic view');
  if (typeof SharedArrayBuffer == 'function') {
    assert.throws(() => get.call(new SharedArrayBuffer(8)), TypeError, 'non-generic-7');
  }
});
