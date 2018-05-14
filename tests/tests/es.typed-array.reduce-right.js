import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.reduceRight', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { reduceRight } = TypedArray.prototype;
    assert.isFunction(reduceRight, `${ name }::reduceRight is function`);
    assert.arity(reduceRight, 1, `${ name }::reduceRight arity is 1`);
    assert.name(reduceRight, 'reduceRight', `${ name }::reduceRight name is 'reduceRight'`);
    assert.looksNative(reduceRight, `${ name }::reduceRight looks native`);
    const array = new TypedArray([1]);
    const accumulator = {};
    array.reduceRight(function (memo, value, key, that) {
      assert.same(arguments.length, 4, 'correct number of callback arguments');
      assert.same(memo, accumulator, 'correct callback accumulator');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
    }, accumulator);
    assert.same(new TypedArray([1, 2, 3]).reduceRight(((a, b) => a + b), 1), 7, 'works with initial accumulator');
    new TypedArray([1, 2]).reduceRight((memo, value, key) => {
      assert.same(memo, 2, 'correct default accumulator');
      assert.same(value, 1, 'correct start value without initial accumulator');
      assert.same(key, 0, 'correct start index without initial accumulator');
    });
    assert.same(new TypedArray([1, 2, 3]).reduceRight((a, b) => a + b), 6, 'works without initial accumulator');
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).reduceRight((memo, value, key) => {
      values += value;
      keys += key;
    }, 0);
    assert.same(values, '321', 'correct order #1');
    assert.same(keys, '210', 'correct order #2');
    assert.throws(() => reduceRight.call([0], () => { /* empty */ }), "isn't generic");
  }
});
