import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.toString', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { toString } = TypedArray.prototype;
    assert.isFunction(toString, `${ name }::toString is function`);
    assert.arity(toString, 0, `${ name }::toString arity is 0`);
    assert.name(toString, 'toString', `${ name }::toString name is 'toString'`);
    assert.looksNative(toString, `${ name }::toString looks native`);
    assert.same(new TypedArray([1, 2, 3]).toString(), '1,2,3', 'works');
    assert.same(toString.call([1, 2, 3]), '1,2,3', 'generic');
  }
});
