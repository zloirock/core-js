import { STRICT } from '../helpers/constants';

QUnit.test('Array#some', assert => {
  const { some } = core.Array;
  assert.isFunction(some);
  let array = [1];
  const context = {};
  some(array, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.ok(some([1, '2', 3], it => typeof it === 'number'));
  assert.ok(some([1, 2, 3], it => it < 3));
  assert.ok(!some([1, 2, 3], it => it < 0));
  assert.ok(!some([1, 2, 3], it => typeof it === 'string'));
  assert.ok(!some([1, 2, 3], function () {
    return +this !== 1;
  }, 1));
  let result = '';
  some([1, 2, 3], (value, key) => {
    result += key;
    return false;
  });
  assert.ok(result === '012');
  array = [1, 2, 3];
  assert.ok(!some(array, (value, key, that) => that !== array));
  if (STRICT) {
    assert.throws(() => {
      return some(null, () => { /* empty */ });
    }, TypeError);
    assert.throws(() => {
      return some(undefined, () => { /* empty */ });
    }, TypeError);
  }
});
