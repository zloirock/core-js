QUnit.test('Uint8Array.prototype.toHex', assert => {
  const { toHex } = Uint8Array.prototype;
  assert.isFunction(toHex);
  assert.arity(toHex, 0);
  assert.name(toHex, 'toHex');
  assert.looksNative(toHex);

  assert.same(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]).toHex(), '48656c6c6f20576f726c64', 'proper result #1');
  assert.same(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]).toHex(), 'ffffffffffffffff', 'proper result #2');

  if (ArrayBuffer.prototype.transfer) {
    const array = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
    array.buffer.transfer();

    assert.throws(() => array.toHex(), TypeError, 'detached');
  }

  assert.throws(() => toHex.call(null), TypeError, "isn't generic #1");
  assert.throws(() => toHex.call(undefined), TypeError, "isn't generic #2");
  assert.throws(() => toHex.call(new Int16Array([1])), TypeError, "isn't generic #3");
  assert.throws(() => toHex.call([1]), TypeError, "isn't generic #4");

  // Test262
  // Copyright 2024 Kevin Gibbons. All rights reserved.
  // This code is governed by the BSD license found in the https://github.com/tc39/test262/blob/main/LICENSE file.
  assert.same(new Uint8Array([]).toHex(), '');
  assert.same(new Uint8Array([102]).toHex(), '66');
  assert.same(new Uint8Array([102, 111]).toHex(), '666f');
  assert.same(new Uint8Array([102, 111, 111]).toHex(), '666f6f');
  assert.same(new Uint8Array([102, 111, 111, 98]).toHex(), '666f6f62');
  assert.same(new Uint8Array([102, 111, 111, 98, 97]).toHex(), '666f6f6261');
  assert.same(new Uint8Array([102, 111, 111, 98, 97, 114]).toHex(), '666f6f626172');
});
