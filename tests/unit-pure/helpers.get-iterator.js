import { createIterable } from '../helpers/helpers.js';

import getIterator from '@core-js/pure/full/get-iterator';

QUnit.test('getIterator helper', assert => {
  assert.isFunction(getIterator);
  assert.isIterator(getIterator([]));
  assert.isIterator(getIterator(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.isIterator(getIterator(createIterable([])));
  assert.throws(() => getIterator({}), TypeError);
});

QUnit.test('getIterator helper, arguments', assert => {
  const args = function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }(1, 2);
  const iterator = getIterator(args);
  assert.deepEqual(iterator.next(), { value: 1, done: false });
  assert.deepEqual(iterator.next(), { value: 2, done: false });
  assert.deepEqual(iterator.next(), { value: undefined, done: true });
});
