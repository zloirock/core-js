/* eslint-disable es/no-shared-array-buffer -- testing */
import { GLOBAL } from '../helpers/constants';
import { arrayToBuffer, bufferToArray } from '../helpers/helpers';

const transfer = GLOBAL?.ArrayBuffer?.prototype?.transfer;

if (transfer) QUnit.test('ArrayBuffer#transfer', assert => {
  assert.isFunction(transfer);
  assert.arity(transfer, 0);
  assert.name(transfer, 'transfer');
  assert.looksNative(transfer);
  assert.nonEnumerable(ArrayBuffer.prototype, 'transfer');

  const DETACHED = 'detached' in ArrayBuffer.prototype;

  const array = [1, 2, 3, 4, 5, 6, 7, 8];

  let buffer = arrayToBuffer(array);
  let transferred = buffer.transfer();
  assert.notSame(transferred, buffer, 'returns new buffer 1');
  assert.true(transferred instanceof ArrayBuffer, 'returns ArrayBuffer 1');
  assert.same(buffer.byteLength, 0, 'original array length 1');
  if (DETACHED) assert.true(buffer.detached, 'original array detached 1');
  assert.same(transferred.byteLength, 8, 'proper transferred byteLength 1');
  assert.arrayEqual(bufferToArray(transferred), array, 'properly copied 1');

  buffer = arrayToBuffer(array);
  transferred = buffer.transfer(5);
  assert.notSame(transferred, buffer, 'returns new buffer 2');
  assert.true(transferred instanceof ArrayBuffer, 'returns ArrayBuffer 2');
  assert.same(buffer.byteLength, 0, 'original array length 2');
  if (DETACHED) assert.true(buffer.detached, 'original array detached 2');
  assert.same(transferred.byteLength, 5, 'proper transferred byteLength 2');
  assert.arrayEqual(bufferToArray(transferred), [1, 2, 3, 4, 5], 'properly copied 2');

  buffer = arrayToBuffer(array);
  transferred = buffer.transfer(16.7);
  assert.notSame(transferred, buffer, 'returns new buffer 3');
  assert.true(transferred instanceof ArrayBuffer, 'returns ArrayBuffer 3');
  assert.same(buffer.byteLength, 0, 'original array length 3');
  if (DETACHED) assert.true(buffer.detached, 'original array detached 3');
  assert.same(transferred.byteLength, 8, 'proper transferred byteLength 3');
  assert.arrayEqual(bufferToArray(transferred), array, 'properly copied 3');

  assert.throws(() => arrayToBuffer(array).transfer(-1), RangeError, 'negative length');
  assert.throws(() => transfer.call({}), TypeError, 'non-generic-1');
  if (typeof SharedArrayBuffer == 'function') {
    assert.throws(() => transfer.call(new SharedArrayBuffer(8)), TypeError, 'non-generic-2');
  }
});
