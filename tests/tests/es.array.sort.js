import { STRICT } from '../helpers/constants';

QUnit.test('Array#sort', assert => {
  const { sort } = Array.prototype;
  assert.isFunction(sort);
  assert.arity(sort, 1);
  assert.name(sort, 'sort');
  assert.looksNative(sort);
  assert.nonEnumerable(Array.prototype, 'sort');
  assert.notThrows(() => [1, 2, 3].sort(undefined).length === 3, 'works with undefined');
  assert.throws(() => [1, 2, 3].sort(null), 'throws on null');
  assert.throws(() => [1, 2, 3].sort({}), 'throws on {}');
  if (STRICT) {
    assert.throws(() => sort.call(null), TypeError, 'ToObject(this)');
    assert.throws(() => sort.call(undefined), TypeError, 'ToObject(this)');
  }
});
