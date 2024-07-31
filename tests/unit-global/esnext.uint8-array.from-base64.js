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
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ1=', null), TypeError, 'incorrect options argument #1');
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ1=', 1), TypeError, 'incorrect options argument #2');
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ1=', { alphabet: 'base32' }), TypeError, 'incorrect encoding');
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ1=', { lastChunkHandling: 'fff' }), TypeError, 'incorrect lastChunkHandling');

  assert.deepEqual(fromBase64('BBB'), new Uint8Array([4, 16]), 'ending #1');
  assert.deepEqual(fromBase64('BBB', { lastChunkHandling: 'loose' }), new Uint8Array([4, 16]), 'ending #2');
  assert.deepEqual(fromBase64('BBB', { lastChunkHandling: 'stop-before-partial' }), new Uint8Array([]), 'ending #3');
  assert.throws(() => fromBase64('BBB', { lastChunkHandling: 'strict' }), SyntaxError, 'ending #4');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ'), array, 'ending #5');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ', { lastChunkHandling: 'loose' }), array, 'ending #6');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ', { lastChunkHandling: 'stop-before-partial' }), array.slice(0, -2), 'ending #7');
  assert.throws(() => fromBase64('SGVsbG8gV29ybGQ', { lastChunkHandling: 'strict' }), SyntaxError, 'ending #8');

  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ= '), array, 'spaces #1');
  assert.deepEqual(fromBase64('SGVsbG8gV2 9ybGQ='), array, 'spaces #2');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ=\n'), array, 'spaces #3');
  assert.deepEqual(fromBase64('SGVsbG8gV2\n9ybGQ='), array, 'spaces #4');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ= ', { lastChunkHandling: 'loose' }), array, 'spaces #5');
  assert.deepEqual(fromBase64('SGVsbG8gV2 9ybGQ=', { lastChunkHandling: 'loose' }), array, 'spaces #6');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ=\n', { lastChunkHandling: 'loose' }), array, 'spaces #7');
  assert.deepEqual(fromBase64('SGVsbG8gV2\n9ybGQ=', { lastChunkHandling: 'loose' }), array, 'spaces #8');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ= ', { lastChunkHandling: 'stop-before-partial' }), array, 'spaces #9');
  assert.deepEqual(fromBase64('SGVsbG8gV2 9ybGQ=', { lastChunkHandling: 'stop-before-partial' }), array, 'spaces #10');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ=\n', { lastChunkHandling: 'stop-before-partial' }), array, 'spaces #11');
  assert.deepEqual(fromBase64('SGVsbG8gV2\n9ybGQ=', { lastChunkHandling: 'stop-before-partial' }), array, 'spaces #12');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ= ', { lastChunkHandling: 'strict' }), array, 'spaces #13');
  assert.deepEqual(fromBase64('SGVsbG8gV2 9ybGQ=', { lastChunkHandling: 'strict' }), array, 'spaces #14');
  assert.deepEqual(fromBase64('SGVsbG8gV29ybGQ=\n', { lastChunkHandling: 'strict' }), array, 'spaces #15');
  assert.deepEqual(fromBase64('SGVsbG8gV2\n9ybGQ=', { lastChunkHandling: 'strict' }), array, 'spaces #16');
});
