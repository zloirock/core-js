import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.indexOf', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { item } = TypedArray.prototype;
    assert.isFunction(item);
    assert.arity(item, 1);
    assert.name(item, 'item');
    assert.looksNative(item);
    assert.same(1, new TypedArray([1, 2, 3]).item(0));
    assert.same(2, new TypedArray([1, 2, 3]).item(1));
    assert.same(3, new TypedArray([1, 2, 3]).item(2));
    assert.same(undefined, new TypedArray([1, 2, 3]).item(3));
    assert.same(3, new TypedArray([1, 2, 3]).item(-1));
    assert.same(2, new TypedArray([1, 2, 3]).item(-2));
    assert.same(1, new TypedArray([1, 2, 3]).item(-3));
    assert.same(undefined, new TypedArray([1, 2, 3]).item(-4));
    assert.same(1, new TypedArray([1, 2, 3]).item(0.4));
    assert.same(1, new TypedArray([1, 2, 3]).item(0.5));
    assert.same(1, new TypedArray([1, 2, 3]).item(0.6));
    assert.same(1, new TypedArray([1]).item(NaN));
    assert.same(1, new TypedArray([1]).item());
    assert.same(1, new TypedArray([1, 2, 3]).item(-0));
    assert.throws(() => item.call({ 0: 1, length: 1 }, 0), TypeError);
    assert.throws(() => item.call(null, 0), TypeError);
    assert.throws(() => item.call(undefined, 0), TypeError);
  }
});
