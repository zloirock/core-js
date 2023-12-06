QUnit.test('Array#filterReject', assert => {
  const { filterReject } = Array.prototype;
  assert.isFunction(filterReject);
  assert.arity(filterReject, 1);
  assert.name(filterReject, 'filterReject');
  assert.looksNative(filterReject);
  assert.nonEnumerable(Array.prototype, 'filterReject');
  let array = [1];
  const context = {};
  array.filterReject(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([1, 2, 3, 4, 5], [1, 2, 3, 'q', {}, 4, true, 5].filterReject(it => typeof it != 'number'));

  assert.throws(() => filterReject.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => filterReject.call(undefined, () => { /* empty */ }), TypeError);

  assert.notThrows(() => filterReject.call({
    length: -1,
    0: 1,
  }, () => {
    throw new Error();
  }), 'uses ToLength');
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(array.filterReject(Boolean).foo, 1, '@@species');
});
