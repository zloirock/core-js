import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.withReversed', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { withReversed } = TypedArray.prototype;

    assert.isFunction(withReversed, `${ name }::withReversed is function`);
    assert.arity(withReversed, 0, `${ name }::withReversed arity is 0`);
    assert.name(withReversed, 'withReversed', `${ name }::withReversed name is 'withReversed'`);
    assert.looksNative(withReversed, `${ name }::withReversed looks native`);

    const array = new TypedArray([1, 2]);
    assert.ok(array.withReversed() !== array, 'immutable');
    assert.arrayEqual(new TypedArray([1, 2, 3, 4]).withReversed(), [4, 3, 2, 1], 'works #1');
    assert.arrayEqual(new TypedArray([1, 2, 3]).withReversed(), [3, 2, 1], 'works #2');

    assert.throws(() => withReversed.call(null), TypeError, "isn't generic #1");
    assert.throws(() => withReversed.call(undefined), TypeError, "isn't generic #2");
    assert.throws(() => withReversed.call([1, 2]), TypeError, "isn't generic #3");
  }
});
