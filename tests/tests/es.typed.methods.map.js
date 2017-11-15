import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.map', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { map } = TypedArray.prototype;
    assert.isFunction(map, `${ name }::map is function`);
    assert.arity(map, 1, `${ name }::map arity is 1`);
    assert.name(map, 'map', `${ name }::map name is 'map'`);
    assert.looksNative(map, `${ name }::map looks native`);
    const array = new TypedArray([1]);
    const context = {};
    array.map(function (value, key, that) {
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(that, array, 'correct link to array in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    const instance = new TypedArray([1, 2, 3, 4, 5]).map(it => it * 2);
    assert.ok(instance instanceof TypedArray, 'correct instance');
    assert.arrayEqual(instance, [2, 4, 6, 8, 10], 'works');
    let values = '';
    let keys = '';
    new TypedArray([1, 2, 3]).map((value, key) => {
      values += value;
      keys += key;
    });
    assert.same(values, '123');
    assert.same(keys, '012');
    assert.throws(() => {
      return map.call([0], () => { /* empty */ });
    }, "isn't generic");
  }
});
