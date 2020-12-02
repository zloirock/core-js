import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.indexOf', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { at } = TypedArray.prototype;
    assert.isFunction(at);
    assert.arity(at, 1);
    assert.name(at, 'at');
    assert.looksNative(at);
    assert.same(1, new TypedArray([1, 2, 3]).at(0));
    assert.same(2, new TypedArray([1, 2, 3]).at(1));
    assert.same(3, new TypedArray([1, 2, 3]).at(2));
    assert.same(undefined, new TypedArray([1, 2, 3]).at(3));
    assert.same(3, new TypedArray([1, 2, 3]).at(-1));
    assert.same(2, new TypedArray([1, 2, 3]).at(-2));
    assert.same(1, new TypedArray([1, 2, 3]).at(-3));
    assert.same(undefined, new TypedArray([1, 2, 3]).at(-4));
    assert.same(1, new TypedArray([1, 2, 3]).at(0.4));
    assert.same(1, new TypedArray([1, 2, 3]).at(0.5));
    assert.same(1, new TypedArray([1, 2, 3]).at(0.6));
    assert.same(1, new TypedArray([1]).at(NaN));
    assert.same(1, new TypedArray([1]).at());
    assert.same(1, new TypedArray([1, 2, 3]).at(-0));
    assert.throws(() => at.call({ 0: 1, length: 1 }, 0), TypeError);
    assert.throws(() => at.call(null, 0), TypeError);
    assert.throws(() => at.call(undefined, 0), TypeError);
  }
});
