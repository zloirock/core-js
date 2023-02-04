/* eslint-disable es/no-shared-array-buffer -- testing */
import { GLOBAL } from '../helpers/constants';
import { arrayToBuffer, bufferToArray } from '../helpers/helpers';

const transferToFixedLength = GLOBAL?.ArrayBuffer?.prototype?.transferToFixedLength;

if (transferToFixedLength) QUnit.test('ArrayBuffer#transferToFixedLength', assert => {
  assert.isFunction(transferToFixedLength);
  assert.arity(transferToFixedLength, 0);
  assert.name(transferToFixedLength, 'transferToFixedLength');
  assert.looksNative(transferToFixedLength);
  assert.nonEnumerable(ArrayBuffer.prototype, 'transferToFixedLength');

  const DETACHED = 'detached' in ArrayBuffer.prototype;

  const array = [1, 2, 3, 4, 5, 6, 7, 8];

  let buffer = arrayToBuffer(array);
  let transferred = buffer.transferToFixedLength();
  assert.notSame(transferred, buffer, 'returns new buffer 1');
  assert.true(transferred instanceof ArrayBuffer, 'returns ArrayBuffer 1');
  assert.same(buffer.byteLength, 0, 'original array length 1');
  if (DETACHED) assert.true(buffer.detached, 'original array detached 1');
  assert.same(transferred.byteLength, 8, 'proper transferred byteLength 1');
  assert.arrayEqual(bufferToArray(transferred), array, 'properly copied 1');

  buffer = arrayToBuffer(array);
  transferred = buffer.transferToFixedLength(5);
  assert.notSame(transferred, buffer, 'returns new buffer 2');
  assert.true(transferred instanceof ArrayBuffer, 'returns ArrayBuffer 2');
  assert.same(buffer.byteLength, 0, 'original array length 2');
  if (DETACHED) assert.true(buffer.detached, 'original array detached 2');
  assert.same(transferred.byteLength, 5, 'proper transferred byteLength 2');
  assert.arrayEqual(bufferToArray(transferred), [1, 2, 3, 4, 5], 'properly copied 2');

  buffer = arrayToBuffer(array);
  transferred = buffer.transferToFixedLength(16.7);
  assert.notSame(transferred, buffer, 'returns new buffer 3');
  assert.true(transferred instanceof ArrayBuffer, 'returns ArrayBuffer 3');
  assert.same(buffer.byteLength, 0, 'original array length 3');
  if (DETACHED) assert.true(buffer.detached, 'original array detached 3');
  assert.same(transferred.byteLength, 8, 'proper transferred byteLength 3');
  assert.arrayEqual(bufferToArray(transferred), array, 'properly copied 3');

  assert.throws(() => arrayToBuffer(array).transferToFixedLength(-1), RangeError, 'negative length');
  assert.throws(() => transferToFixedLength.call({}), TypeError, 'non-generic-1');
  if (typeof SharedArrayBuffer == 'function') {
    assert.throws(() => transferToFixedLength.call(new SharedArrayBuffer(8)), TypeError, 'non-generic-2');
  }
});
