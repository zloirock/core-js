import { STRICT } from '../helpers/constants';

QUnit.test('Array#filterOut', assert => {
  const { filterOut } = Array.prototype;
  assert.isFunction(filterOut);
  assert.arity(filterOut, 1);
  assert.name(filterOut, 'filterOut');
  assert.looksNative(filterOut);
  assert.nonEnumerable(Array.prototype, 'filterOut');
  let array = [1];
  const context = {};
  array.filterOut(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], [1, 2, 3, 'q', {}, 4, true, 5].filterOut(it => typeof it !== 'number'));
  if (STRICT) {
    assert.throws(() => filterOut.call(null, () => { /* empty */ }), TypeError);
    assert.throws(() => filterOut.call(undefined, () => { /* empty */ }), TypeError);
  }
  assert.notThrows(() => filterOut.call({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }), 'uses ToLength');
  array = [];
  array.constructor = { [Symbol.species]: function () { // eslint-disable-line object-shorthand
    return { foo: 1 };
  } };
  assert.same(array.filterOut(Boolean).foo, 1, '@@species');
});
