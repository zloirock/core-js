import { createIterable } from '../helpers/helpers.js';

import getIteratorMethod from '@core-js/pure/full/get-iterator-method';

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
  assert.isFunction(getIteratorMethod(Array.prototype));
  assert.same(getIteratorMethod({}), undefined);
});
