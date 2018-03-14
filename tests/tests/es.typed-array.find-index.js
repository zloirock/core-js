import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.findIndex', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { findIndex } = TypedArray.prototype;
    assert.isFunction(findIndex, `${ name }::findIndex is function`);
    assert.arity(findIndex, 1, `${ name }::findIndex arity is 1`);
    assert.name(findIndex, 'findIndex', `${ name }::findIndex name is 'findIndex'`);
    assert.looksNative(findIndex, `${ name }::findIndex looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.findIndex(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.same(new TypedArray([1, 2, 3]).findIndex(it => !(it % 2)), 1);
    assert.same(new TypedArray([1, 2, 3]).findIndex(it => it === 4), -1);
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).findIndex((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(() => findIndex.call([0], () => { /* empty */ }), "isn't generic");
  }
});
