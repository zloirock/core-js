import { STRICT } from '../helpers/constants';

QUnit.test('Array#filter', assert => {
  const { filter } = core.Array;
  assert.isFunction(filter);
  const array = [1];
  const context = {};
  filter(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], filter([1, 2, 3, 'q', {}, 4, true, 5], it => typeof it === 'number'));
  if (STRICT) {
    assert.throws(() => {
      return filter(null, () => { /* empty */ });
    }, TypeError);
    assert.throws(() => {
      return filter(undefined, () => { /* empty */ });
    }, TypeError);
  }
});
