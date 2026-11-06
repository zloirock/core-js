/* eslint-disable es/no-shared-array-buffer -- testing */
import { GLOBAL } from '../helpers/constants.js';
import { arrayToBuffer, bufferToArray } from '../helpers/helpers.js';

const transferToFixedLength = GLOBAL?.ArrayBuffer?.prototype?.transferToFixedLength;
// V8 6.7 -> 67, in Chromium browsers their own version is the same number
const v8 = (GLOBAL.process?.versions?.v8 ?? GLOBAL.Deno?.version?.v8)?.split('.');
const V8_VERSION = v8 ? +(v8[0] + v8[1]) : +(/Chrome\/(\d+)/.exec(GLOBAL.navigator?.userAgent ?? '')?.[1] ?? 0);

if (transferToFixedLength) QUnit.test('ArrayBuffer#transferToFixedLength', assert => {
  assert.isFunction(transferToFixedLength);
  assert.arity(transferToFixedLength, 0);
  assert.name(transferToFixedLength, 'transferToFixedLength');
  assert.looksNative(transferToFixedLength);
  assert.nonEnumerable(ArrayBuffer.prototype, 'transferToFixedLength');

  const DETACHED = 'detached' in ArrayBuffer.prototype;

  const array = [0, 1, 2, 3, 4, 5, 6, 7];

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
  assert.arrayEqual(bufferToArray(transferred), array.slice(0, 5), 'properly copied 2');

  buffer = arrayToBuffer(array);
  transferred = buffer.transferToFixedLength(16.7);
  assert.notSame(transferred, buffer, 'returns new buffer 3');
  assert.true(transferred instanceof ArrayBuffer, 'returns ArrayBuffer 3');
  assert.same(buffer.byteLength, 0, 'original array length 3');
  if (DETACHED) assert.true(buffer.detached, 'original array detached 3');
  assert.same(transferred.byteLength, 16, 'proper transferred byteLength 3');
  assert.arrayEqual(bufferToArray(transferred), [...array, 0, 0, 0, 0, 0, 0, 0, 0], 'properly copied 3');

  assert.throws(() => arrayToBuffer(array).transferToFixedLength(-1), RangeError, 'negative length');
  assert.throws(() => transferToFixedLength.call({}), TypeError, 'non-generic-1');
  if (typeof SharedArrayBuffer == 'function') {
    assert.throws(() => transferToFixedLength.call(new SharedArrayBuffer(8)), TypeError, 'non-generic-2');
  }

  if ('resizable' in ArrayBuffer.prototype) {
    assert.false(arrayToBuffer(array).transferToFixedLength().resizable, 'non-resizable-1');
    assert.false(arrayToBuffer(array).transferToFixedLength(5).resizable, 'non-resizable-2');

    buffer = new ArrayBuffer(8, { maxByteLength: 16 });
    new Int8Array(buffer).set(array);
    transferred = buffer.transferToFixedLength();
    assert.arrayEqual(bufferToArray(transferred), array, 'resizable-1');
    assert.false(transferred.resizable, 'resizable-2');

    buffer = new ArrayBuffer(8, { maxByteLength: 16 });
    new Int8Array(buffer).set(array);
    transferred = buffer.transferToFixedLength(5);
    assert.arrayEqual(bufferToArray(transferred), array.slice(0, 5), 'resizable-3');
    assert.false(transferred.resizable, 'resizable-4');
  }
});

if (transferToFixedLength) QUnit.test('ArrayBuffer#transferToFixedLength, transfer invariants', assert => {
  let buffer = arrayToBuffer([1, 2, 3, 4]);
  assert.throws(() => buffer.transferToFixedLength(Number.MAX_SAFE_INTEGER), RangeError, 'allocation fails');
  assert.same(buffer.byteLength, 4, 'failed allocation preserves the source');
  assert.arrayEqual(bufferToArray(buffer), [1, 2, 3, 4], 'failed allocation preserves data');

  Object.defineProperty(buffer, 'constructor', { get() { throw new Error('species must not be read'); } });
  const clone = buffer.transferToFixedLength(2);
  assert.same(Object.getPrototypeOf(clone), ArrayBuffer.prototype, 'plain ArrayBuffer');
  assert.arrayEqual(bufferToArray(clone), [1, 2], 'truncated data');
  assert.throws(() => buffer.transferToFixedLength(), TypeError, 'already detached');
  assert.same(new ArrayBuffer(0).transferToFixedLength().byteLength, 0, 'empty buffer');

  if (GLOBAL.WebAssembly?.Memory) {
    for (const initial of [0, 1]) {
      // Empty WebAssembly memory transfers can crash V8 6.7-6.8.
      if (initial === 0 && (V8_VERSION === 67 || V8_VERSION === 68)) continue;
      const memory = new GLOBAL.WebAssembly.Memory({ initial });
      assert.throws(() => memory.buffer.transferToFixedLength(), TypeError, 'WebAssembly memory cannot be detached');
      assert.same(memory.buffer.byteLength, initial * 65536, 'WebAssembly memory preserved');
    }
  }

  if ('resizable' in ArrayBuffer.prototype) {
    buffer = new ArrayBuffer(8, { maxByteLength: 16 });
    new Uint8Array(buffer).set([1, 2, 3, 4]);
    const resized = buffer.transferToFixedLength({ valueOf() {
      buffer.resize(2);
      return 8;
    } });
    assert.same(resized.byteLength, 8, 'requested length after coercion resizes the source');
    assert.arrayEqual(bufferToArray(resized), [1, 2, 0, 0, 0, 0, 0, 0], 'only current source bytes copied');
    buffer = new ArrayBuffer(4, { maxByteLength: 8 });
    assert.same(buffer.transferToFixedLength(9).byteLength, 9, 'fixed transfer can exceed the old maximum');
  }
});
