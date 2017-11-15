import { DESCRIPTORS, NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#findIndex', assert => {
  const { findIndex } = Array.prototype;
  assert.isFunction(findIndex);
  assert.arity(findIndex, 1);
  assert.name(findIndex, 'findIndex');
  assert.looksNative(findIndex);
  assert.nonEnumerable(Array.prototype, 'findIndex');
  const array = [1];
  const context = {};
  array.findIndex(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.same([1, 3, NaN, 42, {}].findIndex(it => it === 42), 3);
  assert.same([1, 3, NaN, 42, {}].findIndex(it => it === 43), -1);
  if (STRICT) {
    assert.throws(() => findIndex.call(null, 0), TypeError);
    assert.throws(() => findIndex.call(undefined, 0), TypeError);
  }
  if (NATIVE && DESCRIPTORS) {
    assert.ok((() => {
      try {
        return findIndex.call({
          length: -1,
          0: 1
        }, () => {
          throw new Error();
        }) === -1;
      } catch (e) { /* empty */ }
    })(), 'uses ToLength');
  }
  assert.ok('findIndex' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
