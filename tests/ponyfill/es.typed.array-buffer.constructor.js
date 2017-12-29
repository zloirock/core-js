import { DESCRIPTORS } from '../helpers/constants';

import { ArrayBuffer, Symbol } from '../../ponyfill';

QUnit.test('ArrayBuffer', assert => {
  assert.same(ArrayBuffer, Object(ArrayBuffer), 'is object');
  assert.same(new ArrayBuffer(123).byteLength, 123, 'length');
  assert.throws(() => new ArrayBuffer(-1), RangeError, 'negative length');
  assert.notThrows(() => new ArrayBuffer(0.5), 'fractional length');
  assert.notThrows(() => new ArrayBuffer(), 'missed length');
  if (DESCRIPTORS) assert.same(ArrayBuffer[Symbol.species], ArrayBuffer, '@@species');
});
