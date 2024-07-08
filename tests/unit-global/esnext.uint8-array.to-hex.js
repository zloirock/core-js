import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('Uint8Array.prototype.toHex', assert => {
  const { toHex } = Uint8Array.prototype;
  assert.isFunction(toHex);
  assert.arity(toHex, 0);
  assert.name(toHex, 'toHex');
  assert.looksNative(toHex);

  assert.same(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]).toHex(), '48656c6c6f20576f726c64', 'proper result');

  if (ArrayBuffer.prototype.transfer) {
    const array = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
    array.buffer.transfer();

    assert.throws(() => array.toHex(), TypeError, 'detached');
  }

  assert.throws(() => toHex.call(null), TypeError, "isn't generic #1");
  assert.throws(() => toHex.call(undefined), TypeError, "isn't generic #2");
  assert.throws(() => toHex.call(new Int16Array([1])), TypeError, "isn't generic #3");
  assert.throws(() => toHex.call([1]), TypeError, "isn't generic #4");
});
