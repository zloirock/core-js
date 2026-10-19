import { createIterable } from '../helpers/helpers.js';

import isIterable from '@core-js/pure/full/is-iterable';
import Symbol from '@core-js/pure/es/symbol';

// an engine may have a native array iterator, but no own `@@iterator` on `arguments` (like Firefox < 46)
function argumentsWithoutIterator() {
  // eslint-disable-next-line prefer-rest-params -- required for testing
  const object = function () { return arguments; }(1);
  delete object[Symbol.iterator];
  return object;
}

QUnit.test('isIterable helper', assert => {
  assert.isFunction(isIterable);
  assert.true(isIterable(createIterable([])));
  assert.true(isIterable([]));
  assert.true(isIterable(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.true(isIterable(argumentsWithoutIterator()), 'arguments without an own @@iterator');
  assert.true(isIterable(Array.prototype));
  assert.false(isIterable({}));
});
