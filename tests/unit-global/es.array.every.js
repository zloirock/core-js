QUnit.test('Array#every', assert => {
  const { every } = Array.prototype;
  assert.isFunction(every);
  assert.arity(every, 1);
  assert.name(every, 'every');
  assert.looksNative(every);
  assert.nonEnumerable(Array.prototype, 'every');
  let array = [1];
  const context = {};
  array.every(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.true([1, 2, 3].every(it => typeof it == 'number'));
  assert.true([1, 2, 3].every(it => it < 4));
  assert.false([1, 2, 3].every(it => it < 3));
  assert.false([1, 2, 3].every(it => typeof it == 'string'));
  assert.true([1, 2, 3].every(function () {
    return +this === 1;
  }, 1));
  let result = '';
  [1, 2, 3].every((value, key) => result += key);
  assert.same(result, '012');
  array = [1, 2, 3];
  assert.true(array.every((value, key, that) => that === array));

  assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
});
