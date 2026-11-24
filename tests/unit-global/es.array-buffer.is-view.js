import { withForeignRealm } from '../helpers/helpers.js';
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

  assert.false(isView(Object.defineProperty({}, Symbol.toStringTag, { value: 'Uint8Array' })), 'an object with a typed array tag - false');
  assert.false(isView(Object.create(Uint8Array.prototype)), 'an object with a typed array prototype - false');
  const tagged = new Uint8Array(1);
  // typed arrays of old Firefox are not extensible
  if (Object.isExtensible(tagged)) {
    Object.defineProperty(tagged, Symbol.toStringTag, { get() { return assert.avoid(); } });
    assert.true(isView(tagged), 'ignores an own @@toStringTag of a typed array');
  }
  withForeignRealm(foreign => {
    assert.true(isView(new foreign.Uint8Array(1)), 'a typed array from another realm - true');
  });
});
