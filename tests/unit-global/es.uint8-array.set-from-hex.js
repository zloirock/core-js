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

  // Should not throw an error with an empty string being set.  This verifies that
  // we aren't using the result of segments = stringMatch(string, /.{2}/g) unsafely
  // in cases where no matches are found, since it returns null instead of []
  const arrayEmpty = new Uint8Array(4);
  const resultEmpty = array1.setFromHex('');

  assert.deepEqual(arrayEmpty, new Uint8Array([0, 0, 0, 0]), 'array empty string test');
  assert.deepEqual(resultEmpty, { read: 0, written: 0 }, 'result empty string test');

  // Should not throw an error on length-tracking views over ResizableArrayBuffer
  // https://issues.chromium.org/issues/454630441
  assert.notThrows(() => {
    const rab = new ArrayBuffer(16, { maxByteLength: 1024 });
    new Uint8Array(rab).setFromHex('cafed00d');
  }, 'not throw an error on ResizableArrayBuffer');

  assert.throws(() => setFromHex.call(Array(11), '48656c6c6f20576f726c64'), TypeError, "isn't generic, this #1");
  assert.throws(() => setFromHex.call(new Int8Array(11), '48656c6c6f20576f726c64'), TypeError, "isn't generic, this #2");
  assert.throws(() => new Uint8Array(11).setFromHex(null), TypeError, "isn't generic, arg #1");
  assert.throws(() => new Uint8Array(11).setFromHex(undefined), TypeError, "isn't generic, arg #2");
  assert.throws(() => new Uint8Array(11).setFromHex(1234), TypeError, "isn't generic, arg #3");
  assert.throws(() => new Uint8Array(11).setFromHex(Object('48656c6c6f20576f726c64')), TypeError, "isn't generic, arg #4");
  assert.throws(() => new Uint8Array(11).setFromHex('48656c6c6f20576f726c641'), SyntaxError, 'throws on invalid #2');
  assert.throws(() => new Uint8Array(11).setFromHex('48656c6c6f20576f726c64 '), SyntaxError, 'throws on invalid #3');
  assert.throws(() => new Uint8Array(11).setFromHex('48656c6c6f20576f726c64\n'), SyntaxError, 'throws on invalid #4');

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
  ].forEach(value => assert.throws(() => new Uint8Array([255, 255, 255, 255, 255]).setFromHex(value), SyntaxError));

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
    const allFF = [255, 255, 255, 255, 255, 255, 255, 255];
    const target = new Uint8Array(allFF);
    const result = target.setFromHex(string);
    assert.same(result.read, string.length);
    assert.same(result.written, bytes.length);

    const expected = bytes.concat(allFF.slice(bytes.length));
    assert.arrayEqual(target, expected, `decoding ${ string }`);
  });

  const base = new Uint8Array([255, 255, 255, 255, 255, 255, 255]);
  const subarray = base.subarray(2, 5);

  let result = subarray.setFromHex('aabbcc');
  assert.same(result.read, 6);
  assert.same(result.written, 3);
  assert.arrayEqual(subarray, [170, 187, 204]);
  assert.arrayEqual(base, [255, 255, 170, 187, 204, 255, 255]);

  // buffer too small
  let target = new Uint8Array([255, 255]);
  result = target.setFromHex('aabbcc');
  assert.same(result.read, 4);
  assert.same(result.written, 2);
  assert.arrayEqual(target, [170, 187]);

  // buffer exact
  target = new Uint8Array([255, 255, 255]);
  result = target.setFromHex('aabbcc');
  assert.same(result.read, 6);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [170, 187, 204]);

  // buffer too large
  target = new Uint8Array([255, 255, 255, 255]);
  result = target.setFromHex('aabbcc');
  assert.same(result.read, 6);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [170, 187, 204, 255]);

  [
    'aaa ',
    'aaag',
  ].forEach(value => {
    target = new Uint8Array([255, 255, 255, 255, 255]);
    assert.throws(() => target.setFromHex(value), SyntaxError);
    assert.arrayEqual(target, [170, 255, 255, 255, 255], `decoding from ${ value }`);
  });

  target = new Uint8Array([255, 255, 255, 255, 255]);
  assert.throws(() => target.setFromHex('aaa'), SyntaxError);
  assert.arrayEqual(target, [255, 255, 255, 255, 255], 'when length is odd no data is written');
});
