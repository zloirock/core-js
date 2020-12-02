import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.indexOf', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { indexOf } = TypedArray.prototype;
    assert.isFunction(indexOf, `${ name }::indexOf is function`);
    assert.arity(indexOf, 1, `${ name }::indexOf arity is 1`);
    assert.name(indexOf, 'indexOf', `${ name }::indexOf name is 'indexOf'`);
    assert.looksNative(indexOf, `${ name }::indexOf looks native`);
    assert.same(new TypedArray([1, 1, 1]).indexOf(1), 0);
    assert.same(new TypedArray([1, 2, 3]).indexOf(1, 1), -1);
    assert.same(new TypedArray([1, 2, 3]).indexOf(2, 1), 1);
    assert.same(new TypedArray([1, 2, 3]).indexOf(2, -1), -1);
    assert.same(new TypedArray([1, 2, 3]).indexOf(2, -2), 1);
    assert.throws(() => indexOf.call([1], 1), "isn't generic");
  }
});
