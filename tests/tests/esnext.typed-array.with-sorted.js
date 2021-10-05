import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.withSorted', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { withSorted } = TypedArray.prototype;

    assert.isFunction(withSorted, `${ name }::withSorted is function`);
    assert.arity(withSorted, 1, `${ name }::withSorted arity is 1`);
    assert.name(withSorted, 'withSorted', `${ name }::withSorted name is 'withSorted'`);
    assert.looksNative(withSorted, `${ name }::withSorted looks native`);

    let array = new TypedArray([1]);
    assert.ok(array.withSorted() !== array, 'immutable');

    if (name.indexOf('Float') === 0) {
      assert.deepEqual(new TypedArray([1, -1, 3, NaN, 2, 0, 11, -0]).withSorted(), new TypedArray([-1, -0, 0, 1, 2, 3, 11, NaN]), '#1');
      assert.ok(1 / new TypedArray([0, -0]).withSorted()[0] < 0, '-0');
      assert.deepEqual(new TypedArray([NaN, 1, NaN]).withSorted(), new TypedArray([1, NaN, NaN]), 'NaN');
    }

    if (name.indexOf('8') === -1) {
      const expected = Array(516);
      array = new TypedArray(516);
      let index, mod, j, k, postfix;

      for (index = 0; index < 516; index++) {
        mod = index % 4;
        array[index] = 515 - index;
        expected[index] = index - 2 * mod + 3;
      }

      array = array.withSorted((a, b) => (a / 4 | 0) - (b / 4 | 0));

      assert.same(String(array), String(expected), 'stable #1');

      let result = '';
      array = new TypedArray(520);
      index = 0;

      for (j = 0; j < 10; j++) {
        switch (j) {
          case 1: case 4: case 5: case 7: postfix = 3; break;
          case 3: case 6: postfix = 4; break;
          default: postfix = 2;
        }

        for (k = 0; k < 52; k++) {
          array[index] = 10 * index++ + postfix;
        }
      }

      array = array.withSorted((a, b) => b % 10 - a % 10);

      for (index = 0; index < array.length; index++) {
        j = String((array[index] / 520) | 0);
        if (result.charAt(result.length - 1) !== j) result += j;
      }

      assert.same(result, '3614570289', 'stable #2');
    }

    assert.notThrows(() => new TypedArray([1, 2, 3]).withSorted(undefined).length === 3, 'works with undefined');
    assert.throws(() => new TypedArray([1, 2, 3]).withSorted(null), 'throws on null');
    assert.throws(() => new TypedArray([1, 2, 3]).withSorted({}), 'throws on {}');

    assert.throws(() => withSorted.call(null), TypeError, "isn't generic #1");
    assert.throws(() => withSorted.call(undefined), TypeError, "isn't generic #2");
    assert.throws(() => withSorted.call([1, 2]), TypeError, "isn't generic #3");
  }
});
