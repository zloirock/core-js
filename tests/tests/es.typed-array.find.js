import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.find', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { find } = TypedArray.prototype;
    assert.isFunction(find, `${ name }::find is function`);
    assert.arity(find, 1, `${ name }::find arity is 1`);
    assert.name(find, 'find', `${ name }::find name is 'find'`);
    assert.looksNative(find, `${ name }::find looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.find(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.same(new TypedArray([1, 2, 3]).find(it => !(it % 2)), 2);
    assert.same(new TypedArray([1, 2, 3]).find(it => it === 4), undefined);
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).find((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(() => find.call([0], () => { /* empty */ }), "isn't generic");
  }
});
