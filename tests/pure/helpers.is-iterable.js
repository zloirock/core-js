import { createIterable } from '../helpers/helpers';

import isIterable from 'core-js-pure/features/is-iterable';

QUnit.test('isIterable helper', assert => {
  assert.isFunction(isIterable);
  assert.ok(isIterable(createIterable([])));
  assert.ok(isIterable([]));
  assert.ok(isIterable(function () {
    return arguments;
  }()));
  assert.ok(isIterable(Array.prototype));
  assert.ok(!isIterable({}));
});
