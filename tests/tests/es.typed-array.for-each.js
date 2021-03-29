import { GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

QUnit.test('%TypedArrayPrototype%.forEach', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { forEach } = TypedArray.prototype;
    assert.isFunction(forEach, `${ name }::forEach is function`);
    assert.arity(forEach, 1, `${ name }::forEach arity is 1`);
    assert.name(forEach, 'forEach', `${ name }::forEach name is 'forEach'`);
    assert.looksNative(forEach, `${ name }::forEach looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.forEach(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.same(new TypedArray([1, 2, 3]).forEach(it => it % 2), undefined);
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).forEach((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(() => forEach.call([0], () => { /* empty */ }), "isn't generic");
  }
});
