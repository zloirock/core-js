import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.withAt', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { withAt } = TypedArray.prototype;

    assert.isFunction(withAt, `${ name }::withAt is function`);
    assert.arity(withAt, 2, `${ name }::withAt arity is 0`);
    assert.name(withAt, 'withAt', `${ name }::withAt name is 'withAt'`);
    assert.looksNative(withAt, `${ name }::withAt looks native`);

    const array = new TypedArray([1, 2, 3, 4, 5]);
    assert.ok(array.withAt(2, 1) !== array, 'immutable');

    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).withAt(2, 6), new TypedArray([1, 2, 6, 4, 5]));
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5]).withAt(-2, 6), new TypedArray([1, 2, 3, 6, 5]));

    assert.throws(() => new TypedArray([1, 2, 3, 4, 5]).withAt(5, 6), RangeError);
    assert.throws(() => new TypedArray([1, 2, 3, 4, 5]).withAt(-6, 6), RangeError);
    assert.throws(() => new TypedArray([1, 2, 3, 4, 5]).withAt('1', 6), RangeError);

    assert.throws(() => withAt.call(null, 1, 2), TypeError, "isn't generic #1");
    assert.throws(() => withAt.call(undefined, 1, 2), TypeError, "isn't generic #2");
    assert.throws(() => withAt.call([1, 2], 1, 3), TypeError, "isn't generic #3");
  }
});
