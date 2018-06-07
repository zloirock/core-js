import { DESCRIPTORS, GLOBAL, TYPED_ARRAYS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('%TypedArrayPrototype%.join', assert => {
  // we can't implement %TypedArrayPrototype% in all engines, so run all tests for each typed array constructor
  for (const name in TYPED_ARRAYS) {
    const TypedArray = GLOBAL[name];
    const { join } = TypedArray.prototype;
    assert.isFunction(join, `${ name }::join is function`);
    assert.arity(join, 1, `${ name }::join arity is 1`);
    assert.name(join, 'join', `${ name }::join name is 'join'`);
    assert.looksNative(join, `${ name }::join looks native`);
    assert.same(new TypedArray([1, 2, 3]).join('|'), '1|2|3', 'works #1');
    assert.same(new TypedArray([1, 2, 3]).join(), '1,2,3', 'works #2');
    assert.throws(() => join.call([1, 2, 3]), "isn't generic");
  }
});
