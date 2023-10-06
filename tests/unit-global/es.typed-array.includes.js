import { TYPED_ARRAYS } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.includes', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { includes } = TypedArray.prototype;
    assert.isFunction(includes, `${ name }::includes is function`);
    assert.arity(includes, 1, `${ name }::includes arity is 1`);
    assert.name(includes, 'includes', `${ name }::includes name is 'includes'`);
    assert.looksNative(includes, `${ name }::includes looks native`);
    assert.true(new TypedArray([1, 1, 1]).includes(1));
    assert.false(new TypedArray([1, 2, 3]).includes(1, 1));
    assert.true(new TypedArray([1, 2, 3]).includes(2, 1));
    assert.false(new TypedArray([1, 2, 3]).includes(2, -1));
    assert.true(new TypedArray([1, 2, 3]).includes(2, -2));
    assert.throws(() => includes.call([1], 1), "isn't generic");
  }
});
