import uniqueBy from 'core-js-pure/full/array/unique-by';
import { STRICT } from '../helpers/constants';

QUnit.test('Array#uniqueBy', assert => {
  assert.isFunction(uniqueBy);

  let array = [1, 2, 3, 2, 1];
  assert.ok(uniqueBy(array) !== array);
  assert.deepEqual(uniqueBy(array), [1, 2, 3]);

  array = [
    {
      id: 1,
      uid: 10000,
    },
    {
      id: 2,
      uid: 10000,
    },
    {
      id: 3,
      uid: 10001,
    },
  ];

  assert.deepEqual(uniqueBy(array, it => it.uid), [
    {
      id: 1,
      uid: 10000,
    },
    {
      id: 3,
      uid: 10001,
    },
  ]);

  assert.deepEqual(uniqueBy(array, ({ id, uid }) => `${ id }-${ uid }`), array);

  assert.deepEqual(uniqueBy([1, undefined, 2, undefined, null, 1]), [1, undefined, 2, null]);

  assert.deepEqual(uniqueBy([0, -0]), [0]);
  assert.deepEqual(uniqueBy([NaN, NaN]), [NaN]);

  assert.deepEqual(uniqueBy({ length: 1, 0: 1 }), [1]);

  if (STRICT) {
    assert.throws(() => uniqueBy(null), TypeError);
    assert.throws(() => uniqueBy(undefined), TypeError);
  }
});
