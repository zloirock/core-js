import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.withSpliced', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { withSpliced } = TypedArray.prototype;

    assert.isFunction(withSpliced, `${ name }::withSpliced is function`);
    assert.arity(withSpliced, 2, `${ name }::withSpliced arity is 1`);
    assert.name(withSpliced, 'withSpliced', `${ name }::withSpliced name is 'withSpliced'`);
    assert.looksNative(withSpliced, `${ name }::withSpliced looks native`);

    const array = new TypedArray([1, 2, 3, 4, 5]);
    assert.ok(array.withSpliced(2) !== array, 'immutable');

    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).withSpliced(2), new TypedArray([1, 2]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).withSpliced(-2), new TypedArray([1, 2, 3]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).withSpliced(2, 2), new TypedArray([1, 2, 5]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).withSpliced(2, -2), new TypedArray([1, 2, 3, 4, 5]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).withSpliced(2, 2, 6, 7), new TypedArray([1, 2, 6, 7, 5]));

    assert.throws(() => withSpliced.call(null), TypeError, "isn't generic #1");
    assert.throws(() => withSpliced.call(undefined), TypeError, "isn't generic #2");
    assert.throws(() => withSpliced.call([1, 2]), TypeError, "isn't generic #3");
  }
});
