import { createIterable } from '../helpers/helpers';

import getIterator from 'core-js-pure/fn/get-iterator';

QUnit.test('getIterator helper', assert => {
  assert.isFunction(getIterator);
  assert.isIterator(getIterator([]));
  assert.isIterator(getIterator(function () {
    return arguments;
  }()));
  assert.isIterator(getIterator(createIterable([])));
  assert.throws(() => getIterator({}), TypeError);
});
