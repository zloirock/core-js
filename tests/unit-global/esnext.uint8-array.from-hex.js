import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('Uint8Array.fromHex', assert => {
  const { fromHex } = Uint8Array;
  assert.isFunction(fromHex);
  assert.arity(fromHex, 1);
  assert.name(fromHex, 'fromHex');
  assert.looksNative(fromHex);

  assert.true(fromHex('48656c6c6f20576f726c64') instanceof Uint8Array, 'returns Uint8Array instance #1');
  assert.true(fromHex.call(Int16Array, '48656c6c6f20576f726c64') instanceof Uint8Array, 'returns Uint8Array instance #2');

  assert.deepEqual(fromHex('48656c6c6f20576f726c64'), new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]), 'proper result');

  assert.throws(() => fromHex(null), TypeError, "isn't generic #1");
  assert.throws(() => fromHex(undefined), TypeError, "isn't generic #2");
  assert.throws(() => fromHex(1234), TypeError, "isn't generic #3");
  assert.throws(() => fromHex(Object('48656c6c6f20576f726c64')), TypeError, "isn't generic #4");
  assert.throws(() => fromHex('4865gc6c6f20576f726c64'), SyntaxError, 'throws on invalid #1');
  assert.throws(() => fromHex('48656c6c6f20576f726c641'), SyntaxError, 'throws on invalid #2');
  assert.throws(() => fromHex('48656c6c6f20576f726c64 '), SyntaxError, 'throws on invalid #3');
  assert.throws(() => fromHex('48656c6c6f20576f726c64\n'), SyntaxError, 'throws on invalid #4');
});
