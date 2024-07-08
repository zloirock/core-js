import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('Uint8Array.prototype.setFromHex', assert => {
  const { setFromHex } = Uint8Array.prototype;
  assert.isFunction(setFromHex);
  assert.arity(setFromHex, 1);
  assert.name(setFromHex, 'setFromHex');
  assert.looksNative(setFromHex);

  const array1 = new Uint8Array(11);
  const result1 = array1.setFromHex('48656c6c6f20576f726c64');

  assert.deepEqual(array1, new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]), 'array #1');
  assert.deepEqual(result1, { read: 22, written: 11 }, 'result #1');

  const array2 = new Uint8Array(10);
  const result2 = array2.setFromHex('48656c6c6f20576f726c64');

  assert.deepEqual(array2, new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108]), 'array #2');
  assert.deepEqual(result2, { read: 20, written: 10 }, 'result #2');

  const array3 = new Uint8Array(12);
  const result3 = array3.setFromHex('48656c6c6f20576f726c64');

  assert.deepEqual(array3, new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 0]), 'array #3');
  assert.deepEqual(result3, { read: 22, written: 11 }, 'result #3');

  const array4 = new Uint8Array(11);

  assert.throws(() => array4.setFromHex('4865gc6c6f20576f726c64'), SyntaxError, 'throws on invalid #1');
  assert.deepEqual(array4, new Uint8Array([72, 101, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 'array #4');

  if (ArrayBuffer.prototype.transfer) {
    const array5 = new Uint8Array(11);
    array5.buffer.transfer();

    assert.throws(() => array5.setFromHex('48656c6c6f20576f726c64'), TypeError, 'detached');
  }

  assert.throws(() => setFromHex.call(Array(11), '48656c6c6f20576f726c64'), TypeError, "isn't generic, this #1");
  assert.throws(() => setFromHex.call(new Int8Array(11), '48656c6c6f20576f726c64'), TypeError, "isn't generic, this #2");
  assert.throws(() => new Uint8Array(11).setFromHex(null), TypeError, "isn't generic, arg #1");
  assert.throws(() => new Uint8Array(11).setFromHex(undefined), TypeError, "isn't generic, arg #2");
  assert.throws(() => new Uint8Array(11).setFromHex(1234), TypeError, "isn't generic, arg #3");
  assert.throws(() => new Uint8Array(11).setFromHex(Object('48656c6c6f20576f726c64')), TypeError, "isn't generic, arg #4");
  assert.throws(() => new Uint8Array(11).setFromHex('48656c6c6f20576f726c641'), SyntaxError, 'throws on invalid #2');
  assert.throws(() => new Uint8Array(11).setFromHex('48656c6c6f20576f726c64 '), SyntaxError, 'throws on invalid #3');
  assert.throws(() => new Uint8Array(11).setFromHex('48656c6c6f20576f726c64\n'), SyntaxError, 'throws on invalid #4');
});
