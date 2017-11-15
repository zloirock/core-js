import { NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#reduce', assert => {
  const { reduce } = Array.prototype;
  assert.isFunction(reduce);
  assert.arity(reduce, 1);
  assert.name(reduce, 'reduce');
  assert.looksNative(reduce);
  assert.nonEnumerable(Array.prototype, 'reduce');
  const array = [1];
  const accumulator = {};
  array.reduce(function (memo, value, key, that) {
    assert.same(arguments.length, 4, 'correct number of callback arguments');
    assert.same(memo, accumulator, 'correct callback accumulator');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
  }, accumulator);
  assert.same([1, 2, 3].reduce(((a, b) => a + b), 1), 7, 'works with initial accumulator');
  [1, 2].reduce((memo, value, key) => {
    assert.same(memo, 1, 'correct default accumulator');
    assert.same(value, 2, 'correct start value without initial accumulator');
    assert.same(key, 1, 'correct start index without initial accumulator');
  });
  assert.same([1, 2, 3].reduce((a, b) => a + b), 6, 'works without initial accumulator');
  let values = '';
  let keys = '';
  [1, 2, 3].reduce((memo, value, key) => {
    values += value;
    keys += key;
  }, 0);
  assert.same(values, '123', 'correct order #1');
  assert.same(keys, '012', 'correct order #2');
  assert.same(reduce.call({
    0: 1,
    1: 2,
    length: 2
  }, (a, b) => a + b), 3, 'generic');
  if (STRICT) {
    assert.throws(() => {
      return reduce.call(null, () => { /* empty */ }, 1);
    }, TypeError);
    assert.throws(() => {
      return reduce.call(undefined, () => { /* empty */ }, 1);
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok((() => {
      try {
        return reduce.call({
          length: -1,
          0: 1
        }, () => {
          throw new Error();
        }, 1);
      } catch (e) { /* empty */ }
    })(), 'uses ToLength');
  }
});
