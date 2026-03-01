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

  if (ArrayBuffer.prototype.transfer) {
    const array = new Uint8Array(16);
    array.buffer.transfer();

    assert.throws(() => array.setFromBase64('SGVsbG8gV29ybGQ='), TypeError, 'detached');
  }

  // Test262
  // Copyright 2024 Kevin Gibbons. All rights reserved.
  // This code is governed by the BSD license found in the https://github.com/tc39/test262/blob/main/LICENSE file.
  let target = new Uint8Array([255, 255, 255, 255]);
  let result = target.setFromBase64('x+/y');
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [199, 239, 242, 255]);

  target = new Uint8Array([255, 255, 255, 255]);
  result = target.setFromBase64('x+/y', { alphabet: 'base64' });
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [199, 239, 242, 255]);

  assert.throws(() => new Uint8Array([255, 255, 255, 255]).setFromBase64('x+/y', { alphabet: 'base64url' }), SyntaxError);

  target = new Uint8Array([255, 255, 255, 255]);
  result = target.setFromBase64('x-_y', { alphabet: 'base64url' });
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [199, 239, 242, 255]);

  assert.throws(() => new Uint8Array([255, 255, 255, 255]).setFromBase64('x-_y'), SyntaxError);
  assert.throws(() => new Uint8Array([255, 255, 255, 255]).setFromBase64('x-_y', { alphabet: 'base64' }), SyntaxError);

  [
    'Zm.9v',
    'Zm9v^',
    'Zg==&',
    'Z−==', // U+2212 'Minus Sign'
    'Z＋==', // U+FF0B 'Fullwidth Plus Sign'
    'Zg\u00A0==', // nbsp
    'Zg\u2009==', // thin space
    'Zg\u2028==', // line separator
  ].forEach(value => assert.throws(() => new Uint8Array([255, 255, 255, 255, 255]).setFromBase64(value), SyntaxError));

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg==');
  assert.same(result.read, 8);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg==', { lastChunkHandling: 'loose' });
  assert.same(result.read, 8);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg==', { lastChunkHandling: 'stop-before-partial' });
  assert.same(result.read, 8);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg==', { lastChunkHandling: 'strict' });
  assert.same(result.read, 8);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  // no padding
  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg');
  assert.same(result.read, 6);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg', { lastChunkHandling: 'loose' });
  assert.same(result.read, 6);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg', { lastChunkHandling: 'stop-before-partial' });
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [101, 120, 97, 255, 255, 255]);

  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg', { lastChunkHandling: 'strict' }), SyntaxError);

  // non-zero padding bits
  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZh==');
  assert.same(result.read, 8);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZh==', { lastChunkHandling: 'loose' });
  assert.same(result.read, 8);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZh==', { lastChunkHandling: 'stop-before-partial' });
  assert.same(result.read, 8);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZh==', { lastChunkHandling: 'strict' }), SyntaxError);

  // non-zero padding bits, no padding
  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZh');
  assert.same(result.read, 6);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZh', { lastChunkHandling: 'loose' });
  assert.same(result.read, 6);
  assert.same(result.written, 4);
  assert.arrayEqual(target, [101, 120, 97, 102, 255, 255]);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZh', { lastChunkHandling: 'stop-before-partial' });
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [101, 120, 97, 255, 255, 255]);

  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZh', { lastChunkHandling: 'strict' }), SyntaxError);

  // partial padding
  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg='), SyntaxError);
  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg=', { lastChunkHandling: 'loose' }), SyntaxError);

  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('ZXhhZg=', { lastChunkHandling: 'stop-before-partial' });
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [101, 120, 97, 255, 255, 255]);

  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg=', { lastChunkHandling: 'strict' }), SyntaxError);

  // excess padding
  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg==='), SyntaxError);
  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg===', { lastChunkHandling: 'loose' }), SyntaxError);
  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg===', { lastChunkHandling: 'stop-before-partial' }), SyntaxError);
  assert.throws(() => new Uint8Array([255, 255, 255, 255, 255, 255]).setFromBase64('ZXhhZg===', { lastChunkHandling: 'strict' }), SyntaxError);

  // standard test vectors from https://datatracker.ietf.org/doc/html/rfc4648#section-10
  [
    ['', []],
    ['Zg==', [102]],
    ['Zm8=', [102, 111]],
    ['Zm9v', [102, 111, 111]],
    ['Zm9vYg==', [102, 111, 111, 98]],
    ['Zm9vYmE=', [102, 111, 111, 98, 97]],
    ['Zm9vYmFy', [102, 111, 111, 98, 97, 114]],
  ].forEach(([string, bytes]) => {
    const allFF = [255, 255, 255, 255, 255, 255, 255, 255];
    target = new Uint8Array(allFF);
    result = target.setFromBase64(string);
    assert.same(result.read, string.length);
    assert.same(result.written, bytes.length);

    const expected = bytes.concat(allFF.slice(bytes.length));
    assert.arrayEqual(target, expected, `decoding ${ string }`);
  });

  const base = new Uint8Array([255, 255, 255, 255, 255, 255, 255]);
  const subarray = base.subarray(2, 5);

  result = subarray.setFromBase64('Zm9vYmFy');
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(subarray, [102, 111, 111]);
  assert.arrayEqual(base, [255, 255, 102, 111, 111, 255, 255]);

  // buffer too small
  target = new Uint8Array([255, 255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmFy');
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [102, 111, 111, 255, 255]);

  // buffer too small, padded
  target = new Uint8Array([255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmE=');
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [102, 111, 111, 255]);

  // buffer exact
  target = new Uint8Array([255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmFy');
  assert.same(result.read, 8);
  assert.same(result.written, 6);
  assert.arrayEqual(target, [102, 111, 111, 98, 97, 114]);

  // buffer exact, padded
  target = new Uint8Array([255, 255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmE=');
  assert.same(result.read, 8);
  assert.same(result.written, 5);
  assert.arrayEqual(target, [102, 111, 111, 98, 97]);

  // buffer exact, not padded
  target = new Uint8Array([255, 255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmE');
  assert.same(result.read, 7);
  assert.same(result.written, 5);
  assert.arrayEqual(target, [102, 111, 111, 98, 97]);

  // buffer exact, padded, stop-before-partial
  target = new Uint8Array([255, 255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmE=', { lastChunkHandling: 'stop-before-partial' });
  assert.same(result.read, 8);
  assert.same(result.written, 5);
  assert.arrayEqual(target, [102, 111, 111, 98, 97]);

  // buffer exact, not padded, stop-before-partial
  target = new Uint8Array([255, 255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmE', { lastChunkHandling: 'stop-before-partial' });
  assert.same(result.read, 4);
  assert.same(result.written, 3);
  assert.arrayEqual(target, [102, 111, 111, 255, 255]);

  // buffer too large
  target = new Uint8Array([255, 255, 255, 255, 255, 255, 255]);
  result = target.setFromBase64('Zm9vYmFy');
  assert.same(result.read, 8);
  assert.same(result.written, 6);
  assert.arrayEqual(target, [102, 111, 111, 98, 97, 114, 255]);

  [
    ['Z g==', 'space'],
    ['Z\tg==', 'tab'],
    ['Z\u000Ag==', 'LF'],
    ['Z\u000Cg==', 'FF'],
    ['Z\u000Dg==', 'CR'],
  ].forEach(([string, name]) => {
    target = new Uint8Array([255, 255, 255]);
    result = target.setFromBase64(string);
    assert.same(result.read, 5);
    assert.same(result.written, 1);
    assert.arrayEqual(target, [102, 255, 255], `ascii whitespace: ${ name }`);
  });

  target = new Uint8Array([255, 255, 255, 255, 255]);
  assert.throws(() => target.setFromBase64('MjYyZm.9v'), SyntaxError, 'illegal character in second chunk');
  assert.arrayEqual(target, [50, 54, 50, 255, 255], 'decoding from MjYyZm.9v should only write the valid chunks');

  target = new Uint8Array([255, 255, 255, 255, 255]);
  assert.throws(() => target.setFromBase64('MjYyZg', { lastChunkHandling: 'strict' }), SyntaxError, 'padding omitted with lastChunkHandling: strict');
  assert.arrayEqual(target, [50, 54, 50, 255, 255], 'decoding from MjYyZg should only write the valid chunks');

  target = new Uint8Array([255, 255, 255, 255, 255]);
  assert.throws(() => target.setFromBase64('MjYyZg==='), SyntaxError, 'extra characters after padding');
  assert.arrayEqual(target, [50, 54, 50, 255, 255], 'decoding from MjYyZg=== should not write the last chunk because it has extra padding');

  target = new Uint8Array([255, 255, 255, 255, 255]);
  assert.throws(() => target.setFromBase64('a'), SyntaxError, 'throws error on incorrect length of base64 string');
});
