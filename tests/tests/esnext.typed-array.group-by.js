import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

const { getPrototypeOf } = Object;

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.groupBy', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { groupBy } = TypedArray.prototype;
    assert.isFunction(groupBy, `${ name }::groupBy is function`);
    assert.arity(groupBy, 1, `${ name }::groupBy arity is 1`);
    assert.name(groupBy, 'groupBy', `${ name }::groupBy name is 'groupBy'`);
    assert.looksNative(groupBy, `${ name }::groupBy looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.groupBy(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);

    assert.same(getPrototypeOf(new TypedArray([1]).groupBy(it => it)), null, 'null proto');
    assert.ok(new TypedArray([1]).groupBy(it => it)[1] instanceof TypedArray, 'instance');
    assert.deepEqual(
      new TypedArray([1, 2, 3]).groupBy(it => it % 2),
      { 1: new TypedArray([1, 3]), 0: new TypedArray([2]) },
      '#1',
    );
    assert.deepEqual(new TypedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).groupBy(it => `i${ it % 5 }`), {
      i1: new TypedArray([1, 6, 11]),
      i2: new TypedArray([2, 7, 12]),
      i3: new TypedArray([3, 8]),
      i4: new TypedArray([4, 9]),
      i0: new TypedArray([5, 10]),
    }, '#2');

    assert.throws(() => groupBy.call([0], () => { /* empty */ }), "isn't generic");
  }
});

