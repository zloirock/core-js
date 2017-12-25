import { createIterable } from '../helpers/helpers';

QUnit.test('core.isIterable', assert => {
  const { isIterable } = core;
  assert.isFunction(isIterable);
  assert.ok(isIterable(createIterable([])));
  assert.ok(isIterable([]));
  assert.ok(isIterable(function () {
    return arguments;
  }()));
  assert.ok(isIterable(Array.prototype));
  assert.ok(!isIterable({}));
});
