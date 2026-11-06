import { createTypedArraySortCases } from '../helpers/helpers.js';
import { DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.toSorted', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { toSorted } = TypedArray.prototype;

    assert.isFunction(toSorted, `${ name }::toSorted is function`);
    assert.arity(toSorted, 1, `${ name }::toSorted arity is 1`);
    assert.name(toSorted, 'toSorted', `${ name }::toSorted name is 'toSorted'`);
    assert.looksNative(toSorted, `${ name }::toSorted looks native`);

    const original = new TypedArray([1]);
    assert.notSame(original.toSorted(), original, 'immutable');

    if (name.indexOf('Float') === 0) {
      assert.deepEqual(new TypedArray([1, -1, 3, NaN, 2, 0, 11, -0]).toSorted(), new TypedArray([-1, -0, 0, 1, 2, 3, 11, NaN]), '#1');
      assert.true(1 / new TypedArray([0, -0]).toSorted()[0] < 0, '-0');
      assert.deepEqual(new TypedArray([NaN, 1, NaN]).toSorted(), new TypedArray([1, NaN, NaN]), 'NaN');
    }

    if (name.indexOf('8') === -1) {
      for (const { input, compare, expected, label } of createTypedArraySortCases()) {
        const array = new TypedArray(input);
        assert.arrayEqual(array.toSorted(compare), expected, label);
        assert.arrayEqual(array, input, 'preserves the receiver');
      }
    }

    assert.returns(() => new TypedArray([1, 2, 3]).toSorted(undefined).length, 3, 'works with undefined');
    assert.throws(() => new TypedArray([1, 2, 3]).toSorted(null), TypeError, 'throws on null');
    assert.throws(() => new TypedArray([1, 2, 3]).toSorted({}), TypeError, 'throws on {}');

    assert.throws(() => toSorted.call(null), TypeError, "isn't generic #1");
    assert.throws(() => toSorted.call(undefined), TypeError, "isn't generic #2");
    assert.throws(() => toSorted.call([1, 2]), TypeError, "isn't generic #3");
  }
});
