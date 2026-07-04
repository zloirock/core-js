import { GLOBAL } from '../helpers/constants.js';
import Symbol from '@core-js/pure/es/symbol';
import Reflect from '@core-js/pure/actual/reflect';

QUnit.test('Reflect[@@toStringTag]', assert => {
  // no `Object.prototype.toString` brand assertion: pure does not patch it, so whether the
  // native `toString` respects the (possibly polyfilled) symbol is the engine's business
  assert.same(Reflect[Symbol.toStringTag], 'Reflect', 'Reflect[@@toStringTag] is `Reflect`');
  assert.notSame(Reflect, GLOBAL.Reflect, 'own namespace object, not the native one');
});
