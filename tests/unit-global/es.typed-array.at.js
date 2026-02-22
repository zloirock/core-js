import { DESCRIPTORS, TYPED_ARRAYS } from '../helpers/constants.js';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.at', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { at } = TypedArray.prototype;
    assert.isFunction(at, `${ name }::at is function`);
    assert.arity(at, 1, `${ name }::at arity is 1`);
    assert.name(at, 'at', `${ name }::at name is 'at'`);
    assert.looksNative(at, `${ name }::at looks native`);
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
