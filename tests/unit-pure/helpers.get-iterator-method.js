import { createIterable } from '../helpers/helpers.js';

import getIteratorMethod from '@core-js/pure/full/get-iterator-method';
import Symbol from '@core-js/pure/es/symbol';

// an engine may have a native array iterator, but no own `@@iterator` on `arguments` (like Firefox < 46)
function argumentsWithoutIterator() {
  // eslint-disable-next-line prefer-rest-params -- required for testing
  const object = function () { return arguments; }(1);
  delete object[Symbol.iterator];
  return object;
}

QUnit.test('getIteratorMethod helper', assert => {
  assert.isFunction(getIteratorMethod);
  const iterable = createIterable([]);
  const iterFn = getIteratorMethod(iterable);
  assert.isFunction(iterFn);
  assert.isIterator(iterFn.call(iterable));
  assert.isFunction(getIteratorMethod([]));
  assert.isFunction(getIteratorMethod(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.isFunction(getIteratorMethod(argumentsWithoutIterator()), 'arguments without an own @@iterator');
  assert.isFunction(getIteratorMethod(Array.prototype));
  assert.same(getIteratorMethod({}), undefined);
});
