import { STRICT } from '../helpers/constants';

QUnit.test('Array#flatMap', assert => {
  const { flatMap } = core.Array;
  assert.isFunction(flatMap);
  assert.deepEqual(flatMap([], it => it), []);
  assert.deepEqual(flatMap([1, 2, 3], it => it), [1, 2, 3]);
  assert.deepEqual(flatMap([1, 2, 3], it => [it, it]), [1, 1, 2, 2, 3, 3]);
  assert.deepEqual(flatMap([1, 2, 3], it => [[it], [it]]), [[1], [1], [2], [2], [3], [3]]);
  assert.deepEqual(flatMap([1, [2, 3]], () => 1), [1, 1]);
  const array = [1];
  const context = {};
  flatMap(array, function (value, index, that) {
    assert.same(value, 1);
    assert.same(index, 0);
    assert.same(that, array);
    assert.same(this, context);
  }, context);
  if (STRICT) {
    assert.throws(() => {
      return flatMap(null, it => it);
    }, TypeError);
    assert.throws(() => {
      return flatMap(undefined, it => it);
    }, TypeError);
  }
  assert.ok((() => {
    try {
      return flatMap({ length: -1 }, () => {
        throw new Error();
      }).length === 0;
    } catch (e) { /* empty */ }
  })(), 'uses ToLength');
});
