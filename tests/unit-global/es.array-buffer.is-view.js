import { TYPED_ARRAYS } from '../helpers/constants.js';

QUnit.test('ArrayBuffer.isView', assert => {
  const { isView } = ArrayBuffer;
  assert.isFunction(isView);
  assert.arity(isView, 1);
  assert.name(isView, 'isView');
  assert.looksNative(isView);
  assert.nonEnumerable(ArrayBuffer, 'isView');
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    if (TypedArray) {
      assert.true(isView(new TypedArray([1])), `${ name } - true`);
    }
  }
  assert.true(isView(new DataView(new ArrayBuffer(1))), 'DataView - true');
  assert.false(isView(new ArrayBuffer(1)), 'ArrayBuffer - false');
  const examples = [undefined, null, false, true, 0, 1, '', 'qwe', {}, [], function () { /* empty */ }];
  for (const example of examples) {
    assert.false(isView(example), `${ example } - false`);
  }
});
