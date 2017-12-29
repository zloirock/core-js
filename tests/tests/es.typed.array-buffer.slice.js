QUnit.test('ArrayBuffer#slice', assert => {
  const { slice } = ArrayBuffer.prototype;

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

  assert.isFunction(slice);
  assert.arity(slice, 2);
  assert.name(slice, 'slice');
  assert.looksNative(slice);
  // assert.nonEnumerable(ArrayBuffer.prototype, 'slice');
  const buffer = arrayToBuffer([1, 2, 3, 4, 5]);
  assert.ok(buffer instanceof ArrayBuffer, 'correct buffer');
  assert.ok(buffer.slice() !== buffer, 'returns new buffer');
  assert.ok(buffer.slice() instanceof ArrayBuffer, 'correct instance');
  assert.arrayEqual(bufferToArray(buffer.slice()), [1, 2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(buffer.slice(1, 3)), [2, 3]);
  assert.arrayEqual(bufferToArray(buffer.slice(1, undefined)), [2, 3, 4, 5]);
  assert.arrayEqual(bufferToArray(buffer.slice(1, -1)), [2, 3, 4]);
  assert.arrayEqual(bufferToArray(buffer.slice(-2, -1)), [4]);
  assert.arrayEqual(bufferToArray(buffer.slice(-2, -3)), []);
});
