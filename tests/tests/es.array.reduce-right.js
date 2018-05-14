import { NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#reduceRight', assert => {
  const { reduceRight } = Array.prototype;
  assert.isFunction(reduceRight);
  assert.arity(reduceRight, 1);
  assert.name(reduceRight, 'reduceRight');
  assert.looksNative(reduceRight);
  assert.nonEnumerable(Array.prototype, 'reduceRight');
  const array = [1];
  const accumulator = {};
  array.reduceRight(function (memo, value, key, that) {
    assert.same(arguments.length, 4, 'correct number of callback arguments');
    assert.same(memo, accumulator, 'correct callback accumulator');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
  }, accumulator);
  assert.same([1, 2, 3].reduceRight(((a, b) => a + b), 1), 7, 'works with initial accumulator');
  [1, 2].reduceRight((memo, value, key) => {
    assert.same(memo, 2, 'correct default accumulator');
    assert.same(value, 1, 'correct start value without initial accumulator');
    assert.same(key, 0, 'correct start index without initial accumulator');
  });
  assert.same([1, 2, 3].reduceRight((a, b) => a + b), 6, 'works without initial accumulator');
  let values = '';
  let keys = '';
  [1, 2, 3].reduceRight((memo, value, key) => {
    values += value;
    keys += key;
  }, 0);
  assert.same(values, '321', 'correct order #1');
  assert.same(keys, '210', 'correct order #2');
  assert.same(reduceRight.call({
    0: 1,
    1: 2,
    length: 2,
  }, (a, b) => a + b), 3, 'generic');
  if (STRICT) {
    assert.throws(() => reduceRight.call(null, () => { /* empty */ }, 1), TypeError);
    assert.throws(() => reduceRight.call(undefined, () => { /* empty */ }, 1), TypeError);
  }
  if (NATIVE) {
    assert.notThrows(() => reduceRight.call({
      length: -1,
      2147483646: 0,
      4294967294: 0,
    }, () => {
      throw new Error();
    }, 1) === undefined, 'uses ToLength');
  }
});
