import { createIterable } from '../helpers/helpers';

import getIteratorMethod from '../../packages/core-js-pure/fn/get-iterator-method';

QUnit.test('getIteratorMethod helper', assert => {
  assert.isFunction(getIteratorMethod);
  const iterable = createIterable([]);
  const iterFn = getIteratorMethod(iterable);
  assert.isFunction(iterFn);
  assert.isIterator(iterFn.call(iterable));
  assert.isFunction(getIteratorMethod([]));
  assert.isFunction(getIteratorMethod(function () {
    return arguments;
  }()));
  assert.isFunction(getIteratorMethod(Array.prototype));
  assert.strictEqual(getIteratorMethod({}), undefined);
});
