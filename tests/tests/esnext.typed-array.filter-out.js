import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.filterOut', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { filterOut } = TypedArray.prototype;
    assert.isFunction(filterOut, `${ name }::filterOut is function`);
    assert.arity(filterOut, 1, `${ name }::filterOut arity is 1`);
    assert.name(filterOut, 'filterOut', `${ name }::filterOut name is 'filterOut'`);
    assert.looksNative(filterOut, `${ name }::filterOut looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.filterOut(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    const instance = new TypedArray([1, 2, 3, 4, 5, 6, 7, 8, 9]).filterOut(it => it % 2);
    assert.ok(instance instanceof TypedArray, 'correct instance');
    assert.arrayEqual(instance, [2, 4, 6, 8], 'works');
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).filterOut((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(() => filterOut.call([0], () => { /* empty */ }), "isn't generic");
  }
});
