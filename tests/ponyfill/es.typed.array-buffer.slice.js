import { ArrayBuffer, DataView } from '../../ponyfill';

QUnit.test('ArrayBuffer#slice', assert => {
  function arrayToBuffer(it) {
    const buffer = new ArrayBuffer(it.length);
    const view = new DataView(buffer);
    for (let i = 0, { length } = it; i < length; ++i) {
      view.setUint8(i, it[i]);
    }
    return buffer;
  }

  function bufferToArray(it) {
    const results = [];
    const view = new DataView(it);
    for (let i = 0, { byteLength } = view; i < byteLength; ++i) {
      results.push(view.getUint8(i));
    }
    return results;
  }

  const { slice } = ArrayBuffer;
  assert.isFunction(slice);
  const buffer = arrayToBuffer([1, 2, 3, 4, 5]);
  assert.ok(buffer instanceof ArrayBuffer, 'correct buffer');
  assert.ok(slice(buffer) !== buffer, 'returns new buffer');
  assert.ok(slice(buffer) instanceof ArrayBuffer, 'correct instance');
  assert.arrayEqual(bufferToArray(slice(buffer)), [1, 2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(slice(buffer, 1, 3)), [2, 3]);
  assert.arrayEqual(bufferToArray(slice(buffer, 1, undefined)), [2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(slice(buffer, 1, -1)), [2, 3, 4]);
  assert.arrayEqual(bufferToArray(slice(buffer, -2, -1)), [4]);
  assert.arrayEqual(bufferToArray(slice(buffer, -2, -3)), []);
});
