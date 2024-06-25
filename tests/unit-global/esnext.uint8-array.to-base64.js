import { DESCRIPTORS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('Uint8Array.prototype.toBase64', assert => {
  const { toBase64 } = Uint8Array.prototype;
  assert.isFunction(toBase64);
  assert.arity(toBase64, 0);
  assert.name(toBase64, 'toBase64');
  assert.looksNative(toBase64);

  const array = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);

  assert.same(array.toBase64(), 'SGVsbG8gV29ybGQ=', 'proper result');
  assert.same(array.toBase64({ alphabet: 'base64' }), 'SGVsbG8gV29ybGQ=', 'proper result, base64');
  assert.same(array.toBase64({ alphabet: 'base64url' }), 'SGVsbG8gV29ybGQ=', 'proper result, base64url');
  assert.same(array.toBase64({ omitPadding: true }), 'SGVsbG8gV29ybGQ', 'proper result');
  assert.same(array.toBase64({ omitPadding: false }), 'SGVsbG8gV29ybGQ=', 'proper result');

  assert.throws(() => array.toBase64(null), TypeError, 'incorrect options argument #1');
  assert.throws(() => array.toBase64(1), TypeError, 'incorrect options argument #2');

  assert.throws(() => array.toBase64({ alphabet: 'base32' }), TypeError, 'incorrect encoding');

  assert.same(new Uint8Array([215, 111, 247]).toBase64(), '12/3', 'encoding #1');
  assert.same(new Uint8Array([215, 111, 247]).toBase64({ alphabet: 'base64' }), '12/3', 'encoding #2');
  assert.same(new Uint8Array([215, 111, 247]).toBase64({ alphabet: 'base64url' }), '12_3', 'encoding #3');
  assert.same(new Uint8Array([215, 111, 183]).toBase64(), '12+3', 'encoding #4');
  assert.same(new Uint8Array([215, 111, 183]).toBase64({ alphabet: 'base64' }), '12+3', 'encoding #5');
  assert.same(new Uint8Array([215, 111, 183]).toBase64({ alphabet: 'base64url' }), '12-3', 'encoding #6');

  assert.throws(() => toBase64.call(null), TypeError, "isn't generic #1");
  assert.throws(() => toBase64.call(undefined), TypeError, "isn't generic #2");
  assert.throws(() => toBase64.call(new Int16Array([1])), TypeError, "isn't generic #3");
  assert.throws(() => toBase64.call([1]), TypeError, "isn't generic #4");
});
