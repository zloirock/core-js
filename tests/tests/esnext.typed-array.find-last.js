import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.findLast', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { findLast } = TypedArray.prototype;
    assert.isFunction(findLast, `${ name }::findLast is function`);
    assert.arity(findLast, 1, `${ name }::findLast arity is 1`);
    assert.name(findLast, 'findLast', `${ name }::findLast name is 'findLast'`);
    assert.looksNative(findLast, `${ name }::findLast looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.findLast(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.same(new TypedArray([1, 2, 3, 4, 5]).findLast(it => !(it % 2)), 4);
    assert.same(new TypedArray([1, 2, 3, 4, 5]).findLast(it => it === 6), undefined);
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).findLast((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '321');
    assert.same(keys, '210');
    assert.throws(() => findLast.call([0], () => { /* empty */ }), "isn't generic");
  }
});
