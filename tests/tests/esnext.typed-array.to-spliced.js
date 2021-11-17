import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.toSpliced', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { toSpliced } = TypedArray.prototype;

    assert.isFunction(toSpliced, `${ name }::toSpliced is function`);
    assert.arity(toSpliced, 2, `${ name }::toSpliced arity is 1`);
    assert.name(toSpliced, 'toSpliced', `${ name }::toSpliced name is 'toSpliced'`);
    assert.looksNative(toSpliced, `${ name }::toSpliced looks native`);

    const array = new TypedArray([1, 2, 3, 4, 5]);
    assert.notStrictEqual(array.toSpliced(2), array, 'immutable');

    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).toSpliced(2), new TypedArray([1, 2]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).toSpliced(-2), new TypedArray([1, 2, 3]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).toSpliced(2, 2), new TypedArray([1, 2, 5]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).toSpliced(2, -2), new TypedArray([1, 2, 3, 4, 5]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).toSpliced(2, 2, 6, 7), new TypedArray([1, 2, 6, 7, 5]));

    assert.throws(() => toSpliced.call(null), TypeError, "isn't generic #1");
    assert.throws(() => toSpliced.call(undefined), TypeError, "isn't generic #2");
    assert.throws(() => toSpliced.call([1, 2]), TypeError, "isn't generic #3");
  }
});
