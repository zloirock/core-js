import { DESCRIPTORS, GLOBAL, NATIVE, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.set', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { set } = TypedArray.prototype;
    assert.isFunction(set, `${ name }::set is function`);
    if (NATIVE) assert.arity(set, 1, `${ name }::set arity is 1`);
    assert.name(set, 'set', `${ name }::set name is 'set'`);
    assert.looksNative(set, `${ name }::set looks native`);
    assert.same(new TypedArray(1).set([1]), undefined, 'void');
    const array1 = new TypedArray([1, 2, 3, 4, 5]);
    const array2 = new TypedArray(5);
    array2.set(array1);
    assert.arrayEqual(array2, [1, 2, 3, 4, 5]);
    assert.throws(() => array2.set(array1, 1));
    assert.throws(() => array2.set(array1, -1));
    array2.set(new TypedArray([99, 98]), 2);
    assert.arrayEqual(array2, [1, 2, 99, 98, 5]);
    array2.set(new TypedArray([99, 98, 97]), 2);
    assert.arrayEqual(array2, [1, 2, 99, 98, 97]);
    assert.throws(() => array2.set(new TypedArray([99, 98, 97, 96]), 2));
    assert.throws(() => array2.set([101, 102, 103, 104], 4));
    const array3 = new TypedArray(2);
    array3.set({ length: 2, 0: 1, 1: 2 });
    assert.arrayEqual(array3, [1, 2]);
    assert.throws(() => set.call([1, 2, 3], [1]), "isn't generic");
  }
});
