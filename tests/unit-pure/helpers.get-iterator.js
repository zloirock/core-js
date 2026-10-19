import { createIterable } from '../helpers/helpers.js';

import getIterator from '@core-js/pure/full/get-iterator';
import Symbol from '@core-js/pure/es/symbol';

// an engine may have a native array iterator, but no own `@@iterator` on `arguments` (like Firefox < 46)
function argumentsWithoutIterator() {
  // eslint-disable-next-line prefer-rest-params -- required for testing
  const object = function () { return arguments; }(1);
  delete object[Symbol.iterator];
  return object;
}

QUnit.test('getIterator helper', assert => {
  assert.isFunction(getIterator);
  assert.isIterator(getIterator([]));
  assert.isIterator(getIterator(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.isIterator(getIterator(argumentsWithoutIterator()), 'arguments without an own @@iterator');
  assert.isIterator(getIterator(createIterable([])));
  assert.throws(() => getIterator({}), TypeError);
});
