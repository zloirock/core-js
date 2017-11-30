import { STRICT } from '../helpers/constants';

QUnit.test('Array#reduce', assert => {
  const { reduce } = core.Array;
  assert.isFunction(reduce);
  const array = [1];
  const accumulator = {};
  reduce(array, function (memo, value, key, that) {
    assert.same(arguments.length, 4, 'correct number of callback arguments');
    assert.same(memo, accumulator, 'correct callback accumulator');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
  }, accumulator);
  assert.same(reduce([1, 2, 3], ((a, b) => a + b), 1), 7, 'works with initial accumulator');
  reduce([1, 2], (memo, value, key) => {
    assert.same(memo, 1, 'correct default accumulator');
    assert.same(value, 2, 'correct start value without initial accumulator');
    assert.same(key, 1, 'correct start index without initial accumulator');
  });
  assert.same(reduce([1, 2, 3], (a, b) => a + b), 6, 'works without initial accumulator');
  let values = '';
  let keys = '';
  reduce([1, 2, 3], (memo, value, key) => {
    values += value;
    keys += key;
  }, 0);
  assert.same(values, '123', 'correct order #1');
  assert.same(keys, '012', 'correct order #2');
  assert.same(reduce({
    0: 1,
    1: 2,
    length: 2,
  }, (a, b) => a + b), 3, 'generic');
  if (STRICT) {
    assert.throws(() => {
      return reduce(null, () => { /* empty */ }, 1);
    }, TypeError);
    assert.throws(() => {
      return reduce(undefined, () => { /* empty */ }, 1);
    }, TypeError);
  }
});
