import { GLOBAL, NATIVE } from '../helpers/constants.js';

QUnit.test('ArrayBuffer', assert => {
  const Symbol = GLOBAL.Symbol || {};
  assert.same(ArrayBuffer, Object(ArrayBuffer), 'is object');
  assert.arity(ArrayBuffer, 1);
  assert.name(ArrayBuffer, 'ArrayBuffer');
  if (NATIVE) assert.looksNative(ArrayBuffer);
  assert.same(new ArrayBuffer(123).byteLength, 123, 'length');
  // fails in Safari
  assert.throws(() => new ArrayBuffer(-1), RangeError, 'negative length');
  assert.notThrows(() => new ArrayBuffer(0.5), 'fractional length');
  assert.notThrows(() => new ArrayBuffer(), 'missed length');
  assert.same(ArrayBuffer[Symbol.species], ArrayBuffer, '@@species');
});

QUnit.test('ArrayBuffer.prototype[@@toStringTag]', assert => {
  assert.same(ArrayBuffer.prototype[Symbol.toStringTag], 'ArrayBuffer', 'ArrayBuffer.prototype[@@toStringTag] is `ArrayBuffer`');
});

QUnit.test('ArrayBuffer[@@species]', assert => {
  assert.same(ArrayBuffer[Symbol.species], ArrayBuffer, 'ArrayBuffer[@@species] is ArrayBuffer');
});
