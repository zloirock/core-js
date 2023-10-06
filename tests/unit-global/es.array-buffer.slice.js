/* eslint-disable es/no-shared-array-buffer -- testing */
import { NODE_ARRAY_BUFFER_SLICE_OWN_LENGTH_BUG, NODE_EMPTY_DATA_VIEW_BUG } from '../helpers/constants.js';
import { arrayToBuffer, bufferToArray } from '../helpers/helpers.js';

QUnit.test('ArrayBuffer#slice', assert => {
  const { slice } = ArrayBuffer.prototype;

  assert.isFunction(slice);
  assert.arity(slice, 2);
  assert.name(slice, 'slice');
  assert.looksNative(slice);
  // assert.nonEnumerable(ArrayBuffer.prototype, 'slice');
  const buffer = arrayToBuffer([1, 2, 3, 4, 5]);
  assert.true(buffer instanceof ArrayBuffer, 'correct buffer');
  assert.notSame(buffer.slice(), buffer, 'returns new buffer');
  assert.true(buffer.slice() instanceof ArrayBuffer, 'correct instance');
  assert.arrayEqual(bufferToArray(buffer.slice()), [1, 2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(buffer.slice(1, 3)), [2, 3]);
  assert.arrayEqual(bufferToArray(buffer.slice(1, undefined)), [2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(buffer.slice(1, -1)), [2, 3, 4]);
  assert.arrayEqual(bufferToArray(buffer.slice(-2, -1)), [4]);
  // eslint-disable-next-line unicorn/no-unnecessary-slice-end -- testing
  assert.arrayEqual(bufferToArray(buffer.slice(0, Infinity)), [1, 2, 3, 4, 5]);
  // the helper reads a buffer through a `DataView`
  if (!NODE_EMPTY_DATA_VIEW_BUG) assert.arrayEqual(bufferToArray(buffer.slice(-2, -3)), []);

  assert.throws(() => slice.call({}), TypeError, 'non-buffer receiver');
  assert.throws(() => slice.call({ byteLength: 8 }, 0, 2), TypeError, 'receiver with a byteLength only');
  let converted = false;
  assert.throws(() => slice.call({}, { valueOf() { return converted = true; } }), TypeError, 'non-buffer receiver with an argument');
  assert.false(converted, 'the receiver is checked before the conversion of arguments');
  if (typeof SharedArrayBuffer == 'function') {
    assert.throws(() => slice.call(new SharedArrayBuffer(4), 0, 2), TypeError, 'SharedArrayBuffer receiver');
  }
  const detached = new ArrayBuffer(8);
  try {
    structuredClone(detached, { transfer: [detached] });
  } catch { /* empty */ }
  // old Firefox does not allow to recognize a detached buffer
  if (detached.byteLength === 0 && detached.detached) {
    converted = false;
    assert.throws(() => detached.slice({ valueOf() { return converted = true; } }), TypeError, 'detached receiver');
    assert.false(converted, 'the detachment is checked before the conversion of arguments');
  }
  const shadowed = arrayToBuffer([1, 2, 3, 4]);
  try {
    // the length is an own non-configurable property in some old engines
    Object.defineProperty(shadowed, 'byteLength', { value: 2 });
  } catch { /* empty */ }
  if (shadowed.byteLength === 2 && !NODE_ARRAY_BUFFER_SLICE_OWN_LENGTH_BUG) {
    assert.arrayEqual(bufferToArray(shadowed.slice(0, 4)), [1, 2, 3, 4], 'own byteLength does not replace the length');
  }
});
