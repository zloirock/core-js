import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.with', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { with: withAt } = TypedArray.prototype;

    assert.isFunction(withAt, `${ name }::with is function`);
    assert.arity(withAt, 2, `${ name }::with arity is 0`);
    // assert.name(withAt, 'with', `${ name }::with name is 'with'`);
    assert.looksNative(withAt, `${ name }::with looks native`);

    const array = new TypedArray([1, 2, 3, 4, 5]);
    assert.notSame(array.with(2, 1), array, 'immutable');

    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).with(2, 6), new TypedArray([1, 2, 6, 4, 5]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).with(-2, 6), new TypedArray([1, 2, 3, 6, 5]));

    assert.throws(() => new TypedArray([1, 2, 3, 4, 5]).with(5, 6), RangeError);
    assert.throws(() => new TypedArray([1, 2, 3, 4, 5]).with(-6, 6), RangeError);
    assert.throws(() => new TypedArray([1, 2, 3, 4, 5]).with('1', 6), RangeError);

    assert.throws(() => withAt.call(null, 1, 2), TypeError, "isn't generic #1");
    assert.throws(() => withAt.call(undefined, 1, 2), TypeError, "isn't generic #2");
    assert.throws(() => withAt.call([1, 2], 1, 3), TypeError, "isn't generic #3");
  }
});
