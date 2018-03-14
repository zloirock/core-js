import { DESCRIPTORS, GLOBAL, NATIVE, TYPED_ARRAYS } from '../helpers/constants';
import { createIterable } from '../helpers/helpers';

if (DESCRIPTORS) QUnit.test('%TypedArray%.from', assert => {
  // we can't implement %TypedArray% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    assert.isFunction(TypedArray.from, `${ name }.from is function`);
    assert.arity(TypedArray.from, 1, `${ name }.from arity is 1`);
    assert.name(TypedArray.from, 'from', `${ name }.from name is 'from'`);
    assert.looksNative(TypedArray.from, `${ name }.from looks native`);
    let instance = TypedArray.from([1, 2, 3]);
    assert.ok(instance instanceof TypedArray, 'correct instance with array');
    assert.arrayEqual(instance, [1, 2, 3], 'correct elements with array');
    instance = TypedArray.from({
      0: 1,
      1: 2,
      2: 3,
      length: 3,
    });
    assert.ok(instance instanceof TypedArray, 'correct instance with array-like');
    assert.arrayEqual(instance, [1, 2, 3], 'correct elements with array-like');
    instance = TypedArray.from(createIterable([1, 2, 3]));
    assert.ok(instance instanceof TypedArray, 'correct instance with iterable');
    assert.arrayEqual(instance, [1, 2, 3], 'correct elements with iterable');
    assert.arrayEqual(TypedArray.from([1, 2, 3], it => it * it), [1, 4, 9], 'accept callback');
    const context = {};
    TypedArray.from([1], function (value, key) {
      assert.same(arguments.length, 2, 'correct number of callback arguments');
      assert.same(value, 1, 'correct value in callback');
      assert.same(key, 0, 'correct index in callback');
      assert.same(this, context, 'correct callback context');
    }, context);
    assert.throws(() => TypedArray.from.call(undefined, []), "isn't generic #1");
    if (NATIVE) {
      assert.throws(() => TypedArray.from.call(Array, []), "isn't generic #2");
      assert.notThrows(() => TypedArray.from({
        length: -1,
        0: 1,
      }, () => {
        throw new Error();
      }), 'uses ToLength');
    }
  }
});
