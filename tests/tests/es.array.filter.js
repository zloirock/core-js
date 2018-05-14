import { STRICT } from '../helpers/constants';

QUnit.test('Array#filter', assert => {
  const { filter } = Array.prototype;
  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.name(filter, 'filter');
  assert.looksNative(filter);
  assert.nonEnumerable(Array.prototype, 'filter');
  let array = [1];
  const context = {};
  array.filter(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], [1, 2, 3, 'q', {}, 4, true, 5].filter(it => typeof it === 'number'));
  if (STRICT) {
    assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);
    assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
  }
  assert.notThrows(() => filter.call({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }), 'uses ToLength');
  array = [];
  array.constructor = { [Symbol.species]: function () { // eslint-disable-line object-shorthand
    return { foo: 1 };
  } };
  assert.same(array.filter(Boolean).foo, 1, '@@species');
});
