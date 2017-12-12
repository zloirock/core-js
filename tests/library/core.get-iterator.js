import { createIterable } from '../helpers/helpers';

QUnit.test('core.getIterator', assert => {
  const { getIterator } = core;
  assert.isFunction(getIterator);
  assert.isIterator(getIterator([]));
  assert.isIterator(getIterator(function () {
    return arguments;
  }()));
  assert.isIterator(getIterator(createIterable([])));
  assert.throws(() => getIterator({}), TypeError);
});
