import { createConversionChecker } from '../helpers/helpers.js';
import { TYPED_ARRAYS_WITH_BIG_INT } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.with', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray, $ } of TYPED_ARRAYS_WITH_BIG_INT) {
    const { with: withAt } = TypedArray.prototype;

    assert.isFunction(withAt, `${ name }::with is function`);
    assert.arity(withAt, 2, `${ name }::with arity is 2`);
    // assert.name(withAt, 'with', `${ name }::with name is 'with'`);
    assert.looksNative(withAt, `${ name }::with looks native`);

    const array = new TypedArray([$(1), $(2), $(3), $(4), $(5)]);
    assert.notSame(array.with(2, $(1)), array, 'immutable');

    assert.deepEqual(new TypedArray([$(1), $(2), $(3), $(4), $(5)]).with(2, $(6)), new TypedArray([$(1), $(2), $(6), $(4), $(5)]));
    assert.deepEqual(new TypedArray([$(1), $(2), $(3), $(4), $(5)]).with(-2, $(6)), new TypedArray([$(1), $(2), $(3), $(6), $(5)]));
    assert.deepEqual(new TypedArray([$(1), $(2), $(3), $(4), $(5)]).with('1', $(6)), new TypedArray([$(1), $(6), $(3), $(4), $(5)]));

    assert.throws(() => new TypedArray([$(1), $(2), $(3), $(4), $(5)]).with(5, $(6)), RangeError);
    assert.throws(() => new TypedArray([$(1), $(2), $(3), $(4), $(5)]).with(-6, $(6)), RangeError);

    assert.throws(() => withAt.call(null, 1, $(2)), TypeError, "isn't generic #1");
    assert.throws(() => withAt.call(undefined, 1, $(2)), TypeError, "isn't generic #2");
    assert.throws(() => withAt.call([1, 2], 1, $(3)), TypeError, "isn't generic #3");

    const checker = createConversionChecker($(10));
    assert.same(new TypedArray(5).with(2, checker)[2], $(10));
    assert.same(checker.$valueOf, 1, 'valueOf calls');
    assert.same(checker.$toString, 0, 'toString calls');

    assert.true(!!function () {
      try {
        new TypedArray(1).with(2, { valueOf() { throw 8; } });
      } catch (error) {
        // some early implementations, like WebKit, does not follow the final semantic
        // https://github.com/tc39/proposal-change-array-by-copy/pull/86
        return error === 8;
      }
    }(), 'proper order of operations');

    // WebKit doesn't handle this correctly. It should truncate a negative fractional index to zero, but instead throws an error
    assert.same(new TypedArray(1).with(-0.5, $(1))[0], $(1));
  }
});
