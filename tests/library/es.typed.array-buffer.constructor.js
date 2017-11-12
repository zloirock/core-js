import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('ArrayBuffer', function (assert) {
  var ArrayBuffer = core.ArrayBuffer;
  var Symbol = core.Symbol;
  assert.same(ArrayBuffer, Object(ArrayBuffer), 'is object');
  assert.same(new ArrayBuffer(123).byteLength, 123, 'length');
  assert.throws(function () {
    new ArrayBuffer(-1);
  }, RangeError, 'negative length');
  assert.ok(function () {
    try {
      return new ArrayBuffer(0.5);
    } catch (e) { /* empty */ }
  }(), 'fractional length');
  assert.ok(function () {
    try {
      return new ArrayBuffer();
    } catch (e) { /* empty */ }
  }(), 'missed length');
  if (DESCRIPTORS) assert.same(ArrayBuffer[Symbol.species], ArrayBuffer, '@@species');
});
