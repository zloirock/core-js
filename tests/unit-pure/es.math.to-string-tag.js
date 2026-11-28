import { GLOBAL } from '../helpers/constants.js';
import getOwnPropertyDescriptor from '@core-js/pure/es/object/get-own-property-descriptor';
import getOwnPropertyNames from '@core-js/pure/es/object/get-own-property-names';
import Symbol from '@core-js/pure/es/symbol';
import Math from '@core-js/pure/actual/math';

QUnit.test('Math[@@toStringTag]', assert => {
  // no `Object.prototype.toString` brand assertion: pure does not patch it, so whether the
  // native `toString` respects the (possibly polyfilled) symbol is the engine's business
  assert.same(Math[Symbol.toStringTag], 'Math', 'Math[@@toStringTag] is `Math`');
  assert.notSame(Math, GLOBAL.Math, 'own namespace object, not the native one');
  assert.isFunction(Math.cos, 'native namespace properties are copied onto the own object');
  const nativeKeys = getOwnPropertyNames(GLOBAL.Math);
  assert.deepEqual(getOwnPropertyNames(Math).slice(0, nativeKeys.length), nativeKeys, 'native property order');
  for (const key of ['cos', 'PI']) {
    assert.deepEqual(getOwnPropertyDescriptor(Math, key), getOwnPropertyDescriptor(GLOBAL.Math, key), `Math.${ key } descriptor`);
  }
});
