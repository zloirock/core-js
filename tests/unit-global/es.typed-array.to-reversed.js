import { TYPED_ARRAYS_WITH_BIG_INT } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.toReversed', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray, $ } of TYPED_ARRAYS_WITH_BIG_INT) {
    const { toReversed } = TypedArray.prototype;

    assert.isFunction(toReversed, `${ name }::toReversed is function`);
    assert.arity(toReversed, 0, `${ name }::toReversed arity is 0`);
    assert.name(toReversed, 'toReversed', `${ name }::toReversed name is 'toReversed'`);
    assert.looksNative(toReversed, `${ name }::toReversed looks native`);

    const array = new TypedArray([$(1), $(2)]);
    assert.notSame(array.toReversed(), array, 'immutable');
    assert.deepEqual(new TypedArray([$(1), $(2), $(3), $(4)]).toReversed(), new TypedArray([$(4), $(3), $(2), $(1)]), 'works #1');
    assert.deepEqual(new TypedArray([$(1), $(2), $(3)]).toReversed(), new TypedArray([$(3), $(2), $(1)]), 'works #2');

    assert.throws(() => toReversed.call(null), TypeError, "isn't generic #1");
    assert.throws(() => toReversed.call(undefined), TypeError, "isn't generic #2");
    assert.throws(() => toReversed.call([$(1), $(2)]), TypeError, "isn't generic #3");
  }
});
