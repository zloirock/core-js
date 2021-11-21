import { createIterable } from '../helpers/helpers';

import isIterable from 'core-js-pure/features/is-iterable';

QUnit.test('isIterable helper', assert => {
  assert.isFunction(isIterable);
  assert.true(isIterable(createIterable([])));
  assert.true(isIterable([]));
  assert.true(isIterable(function () {
    return arguments;
  }()));
  assert.true(isIterable(Array.prototype));
  assert.true(isIterable({}));
});
