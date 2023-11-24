import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('Uint8Array.fromBase64', assert => {
  const { fromBase64 } = Uint8Array;
  assert.isFunction(fromBase64);
  assert.arity(fromBase64, 1);
  assert.name(fromBase64, 'fromBase64');
  assert.looksNative(fromBase64);

  const array = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);

  assert.true(fromBase64('SGVsbG8gV29ybGQ=') instanceof Uint8Array, 'returns Uint8Array instance #1');
  assert.true(fromBase64.call(Int16Array, 'SGVsbG8gV29ybGQ=') instanceof Uint8Array, 'returns Uint8Array instance #2');

  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ='), array, 'proper result');

  assert.throws(() => fromBase64('1234', { alphabet: 'base32' }), TypeError, 'incorrect encoding');

  assert.deepEqual(fromBase64('12/3'), new Uint8Array([215, 111, 247]), 'encoding #1');
  assert.throws(() => fromBase64('12_3'), SyntaxError, 'encoding #2');
  assert.deepEqual(fromBase64('12+3'), new Uint8Array([215, 111, 183]), 'encoding #3');
  assert.throws(() => fromBase64('12-3'), SyntaxError, 'encoding #4');
  assert.deepEqual(fromBase64('12/3', { alphabet: 'base64' }), new Uint8Array([215, 111, 247]), 'encoding #5');
  assert.throws(() => fromBase64('12_3', { alphabet: 'base64' }), SyntaxError, 'encoding #6');
  assert.deepEqual(fromBase64('12+3', { alphabet: 'base64' }), new Uint8Array([215, 111, 183]), 'encoding #7');
  assert.throws(() => fromBase64('12-3', { alphabet: 'base64' }), SyntaxError, 'encoding #8');
  assert.deepEqual(fromBase64('12_3', { alphabet: 'base64url' }), new Uint8Array([215, 111, 247]), 'encoding #9');
  assert.throws(() => fromBase64('12/3', { alphabet: 'base64url' }), SyntaxError, 'encoding #10');
  assert.deepEqual(fromBase64('12-3', { alphabet: 'base64url' }), new Uint8Array([215, 111, 183]), 'encoding #11');
  assert.throws(() => fromBase64('12+3', { alphabet: 'base64url' }), SyntaxError, 'encoding #12');

  assert.throws(() => fromBase64(null), TypeError, "isn't generic #1");
  assert.throws(() => fromBase64(undefined), TypeError, "isn't generic #2");
  assert.throws(() => fromBase64(1234), TypeError, "isn't generic #3");
  assert.throws(() => fromBase64(Object('SGVsbG8gV29ybGQ=')), TypeError, "isn't generic #4");
  assert.throws(() => fromBase64('SGVsbG8gV29ybG%='), SyntaxError, 'throws on invalid #1');
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ1='), SyntaxError, 'throws on invalid #2');

  assert.deepEqual(fromBase64('BBB'), new Uint8Array([4, 16]), 'ending #1');
  assert.deepEqual(fromBase64('BBB', { strict: false }), new Uint8Array([4, 16]), 'ending #2');
  assert.throws(() => fromBase64('BBB', { strict: true }), SyntaxError, 'ending #3');

  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ= '), array, 'spaces #1');
  assert.deepEqual(fromBase64('SGVsbG8gV2 9ybGQ='), array, 'spaces #2');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ=\n'), array, 'spaces #3');
  assert.deepEqual(fromBase64('SGVsbG8gV2\n9ybGQ='), array, 'spaces #4');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ= ', { strict: false }), array, 'spaces #5');
  assert.deepEqual(fromBase64('SGVsbG8gV2 9ybGQ=', { strict: false }), array, 'spaces #6');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ=\n', { strict: false }), array, 'spaces #7');
  assert.deepEqual(fromBase64('SGVsbG8gV2\n9ybGQ=', { strict: false }), array, 'spaces #8');
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ= ', { strict: true }), SyntaxError, 'spaces #9');
  assert.throws(() => fromBase64('SGVsbG8gV2 9ybGQ=', { strict: true }), SyntaxError, 'spaces #10');
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ=\n', { strict: true }), SyntaxError, 'spaces #11');
  assert.throws(() => fromBase64('SGVsbG8gV2\n9ybGQ=', { strict: true }), SyntaxError, 'spaces #12');
});
