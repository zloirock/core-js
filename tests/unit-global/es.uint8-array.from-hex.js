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

  // Test262
  // Copyright 2024 Kevin Gibbons. All rights reserved.
  // This code is governed by the BSD license found in the https://github.com/tc39/test262/blob/main/LICENSE file.
  [
    'a.a',
    'aa^',
    'a a',
    'a\ta',
    'a\u000Aa',
    'a\u000Ca',
    'a\u000Da',
    'a\u00A0a', // nbsp
    'a\u2009a', // thin space
    'a\u2028a', // line separator
  ].forEach(value => assert.throws(() => Uint8Array.fromHex(value), SyntaxError));

  assert.throws(() => Uint8Array.fromHex('a'), SyntaxError);

  [
    ['', []],
    ['66', [102]],
    ['666f', [102, 111]],
    ['666F', [102, 111]],
    ['666f6f', [102, 111, 111]],
    ['666F6f', [102, 111, 111]],
    ['666f6f62', [102, 111, 111, 98]],
    ['666f6f6261', [102, 111, 111, 98, 97]],
    ['666f6f626172', [102, 111, 111, 98, 97, 114]],
  ].forEach(([string, bytes]) => {
    const arr = Uint8Array.fromHex(string);
    assert.same(Object.getPrototypeOf(arr), Uint8Array.prototype, `decoding ${ string }`);
    assert.same(arr.length, bytes.length, `decoding ${ string }`);
    assert.same(arr.buffer.byteLength, bytes.length, `decoding ${ string }`);
    assert.arrayEqual(arr, bytes, `decoding ${ string }`);
  });
});
