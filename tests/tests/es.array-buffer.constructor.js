import { DESCRIPTORS, GLOBAL, NATIVE } from '../helpers/constants';

QUnit.test('ArrayBuffer', assert => {
  const Symbol = GLOBAL.Symbol || {};
  // in Safari 5 typeof ArrayBuffer is 'object'
  assert.same(ArrayBuffer, Object(ArrayBuffer), 'is object');
  // 0 in V8 ~ Chromium 27-
  assert.arity(ArrayBuffer, 1);
  // Safari 5 bug
  assert.name(ArrayBuffer, 'ArrayBuffer');
  // Safari 5 bug
  if (NATIVE) assert.looksNative(ArrayBuffer);
  assert.same(new ArrayBuffer(123).byteLength, 123, 'length');
  // fails in Safari
  assert.throws(() => new ArrayBuffer(-1), RangeError, 'negative length');
  assert.notThrows(() => new ArrayBuffer(0.5), 'fractional length');
  assert.notThrows(() => new ArrayBuffer(), 'missed length');
  if (DESCRIPTORS) assert.same(ArrayBuffer[Symbol.species], ArrayBuffer, '@@species');
});
