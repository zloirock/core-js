import { createConversionChecker } from '../helpers/helpers.js';
import { TYPED_ARRAYS } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.fill', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { fill } = TypedArray.prototype;
    assert.isFunction(fill, `${ name }::fill is function`);
    assert.arity(fill, 1, `${ name }::fill arity is 1`);
    assert.name(fill, 'fill', `${ name }::fill name is 'fill'`);
    assert.looksNative(fill, `${ name }::fill looks native`);
    const array = new TypedArray(5);
    assert.same(array.fill(5), array, 'return this');
    assert.arrayEqual(new TypedArray(5).fill(5), [5, 5, 5, 5, 5], 'basic');
    assert.arrayEqual(new TypedArray(5).fill(5, 1), [0, 5, 5, 5, 5], 'start index');
    assert.arrayEqual(new TypedArray(5).fill(5, 1, 4), [0, 5, 5, 5, 0], 'end index');
    assert.arrayEqual(new TypedArray(5).fill(5, 6, 1), [0, 0, 0, 0, 0], 'start > end');
    assert.arrayEqual(new TypedArray(5).fill(5, -3, 4), [0, 0, 5, 5, 0], 'negative start index');
    assert.throws(() => fill.call([0], 1), "isn't generic");

    const checker = createConversionChecker(10);
    assert.same(new TypedArray(5).fill(checker)[2], 10);
    assert.same(checker.$valueOf, 1, 'valueOf calls');
    assert.same(checker.$toString, 0, 'toString calls');
  }
});
