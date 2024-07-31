import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('Uint8Array.prototype.setFromBase64', assert => {
  const { setFromBase64 } = Uint8Array.prototype;
  assert.isFunction(setFromBase64);
  assert.arity(setFromBase64, 1);
  assert.name(setFromBase64, 'setFromBase64');
  assert.looksNative(setFromBase64);

  const template = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 0, 0, 0, 0, 0]);

  const array1 = new Uint8Array(16);
  const result1 = array1.setFromBase64('SGVsbG8gV29ybGQ=');

  assert.deepEqual(array1, template, 'proper result array #1');
  assert.deepEqual(result1, { read: 16, written: 11 }, 'proper result #1');

  assert.throws(() => setFromBase64.call(Array(16), 'SGVsbG8gV29ybGQ='), TypeError, "isn't generic, this #1");
  assert.throws(() => setFromBase64.call(new Int8Array(16), 'SGVsbG8gV29ybGQ='), TypeError, "isn't generic, this #2");
  assert.throws(() => new Uint8Array(16).setFromBase64(null), TypeError, "isn't generic, arg #1");
  assert.throws(() => new Uint8Array(16).setFromBase64(undefined), TypeError, "isn't generic, arg #2");
  assert.throws(() => new Uint8Array(16).setFromBase64(1234), TypeError, "isn't generic, arg #3");
  assert.throws(() => new Uint8Array(16).setFromBase64(Object('SGVsbG8gV29ybGQ=')), TypeError, "isn't generic, arg #4");
  assert.throws(() => new Uint8Array(16).setFromBase64('^'), SyntaxError, 'throws on invalid #1');
  assert.throws(() => new Uint8Array(16).setFromBase64('SGVsbG8gV29ybGQ=', null), TypeError, 'incorrect options argument #1');
  assert.throws(() => new Uint8Array(16).setFromBase64('SGVsbG8gV29ybGQ=', 1), TypeError, 'incorrect options argument #2');
  assert.throws(() => new Uint8Array(16).setFromBase64('SGVsbG8gV29ybGQ=', { alphabet: 'base32' }), TypeError, 'incorrect encoding');
  assert.throws(() => new Uint8Array(16).setFromBase64('SGVsbG8gV29ybGQ=', { lastChunkHandling: 'fff' }), TypeError, 'incorrect lastChunkHandling');
});
