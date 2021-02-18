import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.uniqueBy', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { uniqueBy } = TypedArray.prototype;
    assert.isFunction(uniqueBy, `${ name }::uniqueBy is function`);
    assert.arity(uniqueBy, 1, `${ name }::uniqueBy arity is 1`);
    assert.name(uniqueBy, 'uniqueBy', `${ name }::uniqueBy name is 'uniqueBy'`);
    assert.looksNative(uniqueBy, `${ name }::uniqueBy looks native`);
    const array = new TypedArray([1, 2, 3, 2, 1]);
    assert.ok(array.uniqueBy() !== array);
    assert.deepEqual(array.uniqueBy(), new TypedArray([1, 2, 3]));
    let values = '';
    new TypedArray([1, 2, 3]).uniqueBy(value => {
      values += value;
    });
    assert.same(values, '123');
    assert.throws(() => uniqueBy.call(null, () => { /* empty */ }), TypeError);
    assert.throws(() => uniqueBy.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => uniqueBy.call([0], () => { /* empty */ }), "isn't generic");
  }
});
