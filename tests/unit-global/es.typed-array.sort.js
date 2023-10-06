import { STRICT, TYPED_ARRAYS } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.sort', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { sort } = TypedArray.prototype;
    assert.isFunction(sort, `${ name }::sort is function`);
    assert.arity(sort, 1, `${ name }::sort arity is 1`);
    assert.name(sort, 'sort', `${ name }::sort name is 'sort'`);
    assert.looksNative(sort, `${ name }::sort looks native`);

    if (name.indexOf('Float') === 0) {
      assert.deepEqual(new TypedArray([1, -1, 3, NaN, 2, 0, 11, -0]).sort(), new TypedArray([-1, -0, 0, 1, 2, 3, 11, NaN]), '#1');
      assert.true(1 / new TypedArray([0, -0]).sort()[0] < 0, '-0');
      assert.deepEqual(new TypedArray([NaN, 1, NaN]).sort(), new TypedArray([1, NaN, NaN]), 'NaN');
    }

    if (name.indexOf('8') === -1) {
      const expected = Array(516);
      let array = new TypedArray(516);
      let index, mod, j, k, postfix;

      for (index = 0; index < 516; index++) {
        mod = index % 4;
        array[index] = 515 - index;
        expected[index] = index - 2 * mod + 3;
      }

      array.sort((a, b) => (a / 4 | 0) - (b / 4 | 0));

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

      array.sort((a, b) => b % 10 - a % 10);

      for (index = 0; index < array.length; index++) {
        j = String((array[index] / 520) | 0);
        if (result.charAt(result.length - 1) !== j) result += j;
      }

      assert.same(result, '3614570289', 'stable #2');
    }

    assert.throws(() => sort.call([0], () => { /* empty */ }), "isn't generic");
    assert.notThrows(() => new TypedArray([1, 2, 3]).sort(undefined).length === 3, 'works with undefined');
    assert.throws(() => new TypedArray([1, 2, 3]).sort(null), 'throws on null');
    assert.throws(() => new TypedArray([1, 2, 3]).sort({}), 'throws on {}');
    if (STRICT) {
      assert.throws(() => sort.call(null), TypeError, 'ToObject(this)');
      assert.throws(() => sort.call(undefined), TypeError, 'ToObject(this)');
    }
  }
});
