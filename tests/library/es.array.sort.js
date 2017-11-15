import { STRICT } from '../helpers/constants';

QUnit.test('Array#sort', assert => {
  const { sort } = core.Array;
  assert.isFunction(sort);
  assert.ok(!!(() => {
    try {
      return sort([1, 2, 3], undefined);
    } catch (e) { /* empty */ }
  })(), 'works with undefined');
  assert.throws(() => {
    return sort([1, 2, 3], null);
  }, 'throws on null');
  assert.throws(() => {
    return sort([1, 2, 3], {});
  }, 'throws on {}');
  if (STRICT) {
    assert.throws(() => {
      return sort(null);
    }, TypeError, 'ToObject(this)');
    assert.throws(() => {
      return sort(undefined);
    }, TypeError, 'ToObject(this)');
  }
});
