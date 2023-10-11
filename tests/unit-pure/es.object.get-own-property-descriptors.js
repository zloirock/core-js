import Symbol from '@core-js/pure/es/symbol';
import create from '@core-js/pure/es/object/create';
import getOwnPropertyDescriptors from '@core-js/pure/es/object/get-own-property-descriptors';

QUnit.test('Object.getOwnPropertyDescriptors', assert => {
  assert.isFunction(getOwnPropertyDescriptors);
  const object = create({ q: 1 }, { e: { value: 3 } });
  object.w = 2;
  const symbol = Symbol('4');
  object[symbol] = 4;
  const descriptors = getOwnPropertyDescriptors(object);
  assert.same(descriptors.q, undefined);
  assert.deepEqual(descriptors.w, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2,
  });
  assert.deepEqual(descriptors.e, {
    enumerable: false,
    configurable: false,
    writable: false,
    value: 3,
  });
  assert.same(descriptors[symbol].value, 4);
});
