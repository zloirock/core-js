import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.findLastIndex', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { findLastIndex } = TypedArray.prototype;
    assert.isFunction(findLastIndex, `${ name }::findLastIndex is function`);
    assert.arity(findLastIndex, 1, `${ name }::findLastIndex arity is 1`);
    assert.name(findLastIndex, 'findLastIndex', `${ name }::findLastIndex name is 'findLastIndex'`);
    assert.looksNative(findLastIndex, `${ name }::findLastIndex looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.findLastIndex(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.same(new TypedArray([1, 2, 3, 2, 1]).findLastIndex(it => !(it % 2)), 3);
    assert.same(new TypedArray([1, 2, 3, 2, 1]).findLastIndex(it => it === 4), -1);
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).findLastIndex((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '321');
    assert.same(keys, '210');
    assert.throws(() => findLastIndex.call([0], () => { /* empty */ }), "isn't generic");
  }
});
