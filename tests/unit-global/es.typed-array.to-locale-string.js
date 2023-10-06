import { TYPED_ARRAYS } from '../helpers/constants.js';

QUnit.test('%TypedArrayPrototype%.toLocaleString', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const { name, TypedArray } of TYPED_ARRAYS) {
    const { toLocaleString } = TypedArray.prototype;
    assert.isFunction(toLocaleString, `${ name }::toLocaleString is function`);
    assert.arity(toLocaleString, 0, `${ name }::toLocaleString arity is 0`);
    assert.name(toLocaleString, 'toLocaleString', `${ name }::toLocaleString name is 'toLocaleString'`);
    assert.looksNative(toLocaleString, `${ name }::toLocaleString looks native`);
    assert.same(new TypedArray([1, 2, 3]).toLocaleString(), [1, 2, 3].toLocaleString(), 'works');
    assert.throws(() => toLocaleString.call([1, 2, 3]), "isn't generic");
  }
});
