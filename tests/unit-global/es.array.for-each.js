QUnit.test('Array#forEach', assert => {
  const { forEach } = Array.prototype;
  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.name(forEach, 'forEach');
  assert.looksNative(forEach);
  assert.nonEnumerable(Array.prototype, 'forEach');
  let array = [1];
  const context = {};
  array.forEach(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  let result = '';
  [1, 2, 3].forEach(value => {
    result += value;
  });
  assert.same(result, '123');
  result = '';
  [1, 2, 3].forEach((value, key) => {
    result += key;
  });
  assert.same(result, '012');
  result = '';
  [1, 2, 3].forEach((value, key, that) => {
    result += that;
  });
  assert.same(result, '1,2,31,2,31,2,3');
  result = '';
  [1, 2, 3].forEach(function () {
    result += this;
  }, 1);
  assert.same(result, '111');
  result = '';
  array = [];
  array[5] = '';
  array.forEach((value, key) => {
    result += key;
  });
  assert.same(result, '5');

  assert.throws(() => {
    forEach.call(null, () => { /* empty */ });
  }, TypeError);
  assert.throws(() => {
    forEach.call(undefined, () => { /* empty */ });
  }, TypeError);
});
