import { createIterable } from '../helpers/helpers.js';

import isIterable from '@core-js/pure/full/is-iterable';

QUnit.test('isIterable helper', assert => {
  assert.isFunction(isIterable);
  assert.true(isIterable(createIterable([])));
  assert.true(isIterable([]));
  assert.true(isIterable(function () {
    // eslint-disable-next-line prefer-rest-params -- required for testing
    return arguments;
  }()));
  assert.true(isIterable(Array.prototype));
  assert.false(isIterable({}));
});
