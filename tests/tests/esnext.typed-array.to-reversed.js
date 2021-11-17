import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.toReversed', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { toReversed } = TypedArray.prototype;

    assert.isFunction(toReversed, `${ name }::toReversed is function`);
    assert.arity(toReversed, 0, `${ name }::toReversed arity is 0`);
    assert.name(toReversed, 'toReversed', `${ name }::toReversed name is 'toReversed'`);
    assert.looksNative(toReversed, `${ name }::toReversed looks native`);

    const array = new TypedArray([1, 2]);
    assert.notStrictEqual(array.toReversed(), array, 'immutable');
    assert.arrayEqual(new TypedArray([1, 2, 3, 4]).toReversed(), [4, 3, 2, 1], 'works #1');
    assert.arrayEqual(new TypedArray([1, 2, 3]).toReversed(), [3, 2, 1], 'works #2');

    assert.throws(() => toReversed.call(null), TypeError, "isn't generic #1");
    assert.throws(() => toReversed.call(undefined), TypeError, "isn't generic #2");
    assert.throws(() => toReversed.call([1, 2]), TypeError, "isn't generic #3");
  }
});
