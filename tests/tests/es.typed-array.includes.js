import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.includes', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { includes } = TypedArray.prototype;
    assert.isFunction(includes, `${ name }::includes is function`);
    assert.arity(includes, 1, `${ name }::includes arity is 1`);
    assert.name(includes, 'includes', `${ name }::includes name is 'includes'`);
    assert.looksNative(includes, `${ name }::includes looks native`);
    assert.same(new TypedArray([1, 1, 1]).includes(1), true);
    assert.same(new TypedArray([1, 2, 3]).includes(1, 1), false);
    assert.same(new TypedArray([1, 2, 3]).includes(2, 1), true);
    assert.same(new TypedArray([1, 2, 3]).includes(2, -1), false);
    assert.same(new TypedArray([1, 2, 3]).includes(2, -2), true);
    assert.throws(() => includes.call([1], 1), "isn't generic");
  }
});
