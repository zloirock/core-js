import { withForeignRealm } from '../helpers/helpers.js';
import { TYPED_ARRAYS } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.includes', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { includes } = TypedArray.prototype;
    assert.isFunction(includes, `${ name }::includes is function`);
    assert.arity(includes, 1, `${ name }::includes arity is 1`);
    assert.name(includes, 'includes', `${ name }::includes name is 'includes'`);
    assert.looksNative(includes, `${ name }::includes looks native`);
    assert.true(new TypedArray([1, 1, 1]).includes(1));
    assert.false(new TypedArray([1, 2, 3]).includes(1, 1));
    assert.true(new TypedArray([1, 2, 3]).includes(2, 1));
    assert.false(new TypedArray([1, 2, 3]).includes(2, -1));
    assert.true(new TypedArray([1, 2, 3]).includes(2, -2));
    assert.throws(() => includes.call([1], 1), "isn't generic");
  }

  const { includes } = Uint16Array.prototype;
  const array = new Uint16Array([1]);
  // typed arrays of old Firefox are not extensible
  if (Object.isExtensible(array)) {
    Object.defineProperty(array, Symbol.toStringTag, { get() { return assert.avoid(); } });
    assert.true(includes.call(array, 1), 'ignores an own @@toStringTag');
    Object.defineProperty(array, 'constructor', { get() { return assert.avoid(); } });
    assert.true(includes.call(array, 1), 'checks the receiver without reading its constructor');
  }
  const view = new DataView(new ArrayBuffer(0));
  Object.defineProperty(view, Symbol.toStringTag, { value: 'Uint16Array' });
  assert.throws(() => includes.call(view, 1), TypeError, 'rejects a DataView with a typed array tag');
  const fake = Object.create(Uint16Array.prototype, { length: { value: 0 } });
  assert.throws(() => includes.call(fake, 1), TypeError, 'rejects an object with a typed array prototype');

  withForeignRealm(foreign => {
    assert.true(includes.call(new foreign.Uint16Array([1]), 1), 'accepts a typed array from another realm');
  });
});
