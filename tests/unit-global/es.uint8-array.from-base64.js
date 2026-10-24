QUnit.test('Uint8Array.fromBase64', assert => {
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

  // Test262
  // Copyright 2024 Kevin Gibbons. All rights reserved.
  // This code is governed by the BSD license found in the https://github.com/tc39/test262/blob/main/LICENSE file.
  assert.arrayEqual(Uint8Array.fromBase64('x+/y'), [199, 239, 242]);
  assert.arrayEqual(Uint8Array.fromBase64('x+/y', { alphabet: 'base64' }), [199, 239, 242]);
  assert.throws(() => Uint8Array.fromBase64('x+/y', { alphabet: 'base64url' }), SyntaxError);
  assert.arrayEqual(Uint8Array.fromBase64('x-_y', { alphabet: 'base64url' }), [199, 239, 242]);
  assert.throws(() => Uint8Array.fromBase64('x-_y'), SyntaxError);
  assert.throws(() => Uint8Array.fromBase64('x-_y', { alphabet: 'base64' }), SyntaxError);

  [
    'Zm.9v',
    'Zm9v^',
    'Zg==&',
    'Z−==', // U+2212 'Minus Sign'
    'Z＋==', // U+FF0B 'Fullwidth Plus Sign'
    'Zg\u00A0==', // nbsp
    'Zg\u2009==', // thin space
    'Zg\u2028==', // line separator
  ].forEach(value => assert.throws(() => Uint8Array.fromBase64(value), SyntaxError));

  // padding
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg=='), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg==', { lastChunkHandling: 'loose' }), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg==', { lastChunkHandling: 'stop-before-partial' }), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg==', { lastChunkHandling: 'strict' }), [101, 120, 97, 102]);

  // no padding
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg'), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg', { lastChunkHandling: 'loose' }), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg', { lastChunkHandling: 'stop-before-partial' }), [101, 120, 97]);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg', { lastChunkHandling: 'strict' }), SyntaxError);

  // non-zero padding bits
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZh=='), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZh==', { lastChunkHandling: 'loose' }), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZh==', { lastChunkHandling: 'stop-before-partial' }), [101, 120, 97, 102]);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZh==', { lastChunkHandling: 'strict' }), SyntaxError);

  // non-zero padding bits, no padding
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZh'), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZh', { lastChunkHandling: 'loose' }), [101, 120, 97, 102]);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZh', { lastChunkHandling: 'stop-before-partial' }), [101, 120, 97]);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZh', { lastChunkHandling: 'strict' }), SyntaxError);

  // partial padding
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg='), SyntaxError);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg=', { lastChunkHandling: 'loose' }), SyntaxError);
  assert.arrayEqual(Uint8Array.fromBase64('ZXhhZg=', { lastChunkHandling: 'stop-before-partial' }), [101, 120, 97]);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg=', { lastChunkHandling: 'strict' }), SyntaxError);

  // excess padding
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg==='), SyntaxError);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg===', { lastChunkHandling: 'loose' }), SyntaxError);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg===', { lastChunkHandling: 'stop-before-partial' }), SyntaxError);
  assert.throws(() => Uint8Array.fromBase64('ZXhhZg===', { lastChunkHandling: 'strict' }), SyntaxError);

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
    const result = Uint8Array.fromBase64(string);
    assert.same(Object.getPrototypeOf(result), Uint8Array.prototype, `decoding ${ string }`);
    assert.same(result.length, bytes.length, `decoding ${ string }`);
    assert.same(result.buffer.byteLength, bytes.length, `decoding ${ string }`);
    assert.arrayEqual(result, bytes, `decoding ${ string }`);
  });

  [
    ['Z g==', 'space'],
    ['Z\tg==', 'tab'],
    ['Z\u000Ag==', 'LF'],
    ['Z\u000Cg==', 'FF'],
    ['Z\u000Dg==', 'CR'],
  ].forEach(([string, name]) => {
    const arr = Uint8Array.fromBase64(string);
    assert.same(arr.length, 1);
    assert.same(arr.buffer.byteLength, 1);
    assert.arrayEqual(arr, [102], `ascii whitespace: ${ name }`);
  });

  assert.throws(() => Uint8Array.fromBase64('a'), SyntaxError, 'throws error on incorrect length of base64 string');
});
