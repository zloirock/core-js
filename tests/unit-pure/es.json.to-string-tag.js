import { GLOBAL } from '../helpers/constants.js';
import Symbol from '@core-js/pure/es/symbol';
import JSON from '@core-js/pure/actual/json';

QUnit.test('JSON[@@toStringTag]', assert => {
  // no `Object.prototype.toString` brand assertion: pure does not patch it, so whether the
  // native `toString` respects the (possibly polyfilled) symbol is the engine's business
  assert.same(JSON[Symbol.toStringTag], 'JSON', 'JSON[@@toStringTag] is `JSON`');
  assert.notSame(JSON, GLOBAL.JSON, 'own namespace object, not the native one');
  assert.isFunction(JSON.parse, 'native namespace properties are copied onto the own object');
});
