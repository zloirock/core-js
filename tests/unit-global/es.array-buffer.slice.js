import { NODE_EMPTY_DATA_VIEW_BUG } from '../helpers/constants.js';
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
});
