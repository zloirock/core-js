import { STRICT } from '../helpers/constants';

QUnit.test('Array#sort', assert => {
  const { sort } = core.Array;
  assert.isFunction(sort);
  assert.notThrows(() => sort([1, 2, 3], undefined), 'works with undefined');
  assert.throws(() => sort([1, 2, 3], null), 'throws on null');
  assert.throws(() => sort([1, 2, 3], {}), 'throws on {}');
  if (STRICT) {
    assert.throws(() => sort(null), TypeError, 'ToObject(this)');
    assert.throws(() => sort(undefined), TypeError, 'ToObject(this)');
  }
});
