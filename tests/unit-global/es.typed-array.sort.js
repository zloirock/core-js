import { createTypedArraySortCases } from '../helpers/helpers.js';
import { DESCRIPTORS, STRICT, TYPED_ARRAYS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.sort', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { sort } = TypedArray.prototype;
    assert.isFunction(sort, `${ name }::sort is function`);
    assert.arity(sort, 1, `${ name }::sort arity is 1`);
    assert.name(sort, 'sort', `${ name }::sort name is 'sort'`);
    assert.looksNative(sort, `${ name }::sort looks native`);

    if (name.indexOf('Float') === 0) {
      assert.deepEqual(new TypedArray([1, -1, 3, NaN, 2, 0, 11, -0]).sort(), new TypedArray([-1, -0, 0, 1, 2, 3, 11, NaN]), '#1');
      assert.true(1 / new TypedArray([0, -0]).sort()[0] < 0, '-0');
      assert.deepEqual(new TypedArray([NaN, 1, NaN]).sort(), new TypedArray([1, NaN, NaN]), 'NaN');
    }

    if (name.indexOf('8') === -1) {
      for (const { input, compare, expected, label } of createTypedArraySortCases()) {
        const array = new TypedArray(input);
        assert.same(array.sort(compare), array, 'returns the receiver');
        assert.arrayEqual(array, expected, label);
      }
    }

    assert.throws(() => sort.call([0], () => { /* empty */ }), "isn't generic");
    assert.returns(() => new TypedArray([1, 2, 3]).sort(undefined).length, 3, 'works with undefined');
    assert.throws(() => new TypedArray([1, 2, 3]).sort(null), TypeError, 'throws on null');
    assert.throws(() => new TypedArray([1, 2, 3]).sort({}), TypeError, 'throws on {}');
    if (STRICT) {
      assert.throws(() => sort.call(null), TypeError, 'ToObject(this)');
      assert.throws(() => sort.call(undefined), TypeError, 'ToObject(this)');
    }
  }
});
