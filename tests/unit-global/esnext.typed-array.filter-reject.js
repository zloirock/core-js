import { TYPED_ARRAYS } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.filterReject', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { filterReject } = TypedArray.prototype;
    assert.isFunction(filterReject, `${ name }::filterReject is function`);
    assert.arity(filterReject, 1, `${ name }::filterReject arity is 1`);
    assert.name(filterReject, 'filterReject', `${ name }::filterReject name is 'filterReject'`);
    assert.looksNative(filterReject, `${ name }::filterReject looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.filterReject(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    const instance = new TypedArray([1, 2, 3, 4, 5, 6, 7, 8, 9]).filterReject(it => it % 2);
    assert.true(instance instanceof TypedArray, 'correct instance');
    assert.arrayEqual(instance, [2, 4, 6, 8], 'works');
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).filterReject((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(() => filterReject.call([0], () => { /* empty */ }), "isn't generic");
  }
});
