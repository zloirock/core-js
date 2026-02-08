import create from '@core-js/pure/es/object/create';
import getOwnPropertyNames from '@core-js/pure/es/object/get-own-property-names';
import getOwnPropertySymbols from '@core-js/pure/es/object/get-own-property-symbols';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Object.getOwnPropertySymbols', assert => {
  assert.isFunction(getOwnPropertySymbols);
  const prototype = { q: 1, w: 2, e: 3 };
  prototype[Symbol('getOwnPropertySymbols test 1')] = 42;
  prototype[Symbol('getOwnPropertySymbols test 2')] = 43;
  assert.deepEqual(getOwnPropertyNames(prototype).sort(), ['e', 'q', 'w']);
  assert.same(getOwnPropertySymbols(prototype).length, 2);
  const object = create(prototype);
  object.a = 1;
  object.s = 2;
  object.d = 3;
  object[Symbol('getOwnPropertySymbols test 3')] = 44;
  assert.deepEqual(getOwnPropertyNames(object).sort(), ['a', 'd', 's']);
  assert.same(getOwnPropertySymbols(object).length, 1);
  assert.same(getOwnPropertySymbols(Object.prototype).length, 0);
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => getOwnPropertySymbols(value), `accept ${ typeof value }`);
  }
});
