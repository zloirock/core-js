import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.filter', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { filter } = TypedArray.prototype;
    assert.isFunction(filter, `${ name }::filter is function`);
    assert.arity(filter, 1, `${ name }::filter arity is 1`);
    assert.name(filter, 'filter', `${ name }::filter name is 'filter'`);
    assert.looksNative(filter, `${ name }::filter looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.filter(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    const instance = new TypedArray([1, 2, 3, 4, 5, 6, 7, 8, 9]).filter(it => it % 2);
    assert.ok(instance instanceof TypedArray, 'correct instance');
    assert.arrayEqual(instance, [1, 3, 5, 7, 9], 'works');
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).filter((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(() => {
      return filter.call([0], () => { /* empty */ });
    }, "isn't generic");
  }
});
