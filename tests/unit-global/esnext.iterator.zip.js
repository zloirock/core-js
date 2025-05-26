const { from } = Array;

QUnit.test('Iterator.zip', assert => {
  const { zip } = Iterator;

  assert.isFunction(zip);
  assert.arity(zip, 1);
  assert.name(zip, 'zip');
  assert.looksNative(zip);
  assert.nonEnumerable(Iterator, 'zip');

  let result = zip([[1, 2, 3], [4, 5, 6]]);
  assert.deepEqual(from(result), [[1, 4], [2, 5], [3, 6]]);
  result = zip([[1, 2, 3], [4, 5, 6, 7]]);
  assert.deepEqual(from(result), [[1, 4], [2, 5], [3, 6]]);
  result = zip([[1, 2, 3], [4, 5, 6, 7]], { mode: 'longest', padding: [9] });
  assert.deepEqual(from(result), [[1, 4], [2, 5], [3, 6], [9, 7]]);
  result = zip([[1, 2, 3, 4], [5, 6, 7]], { mode: 'longest', padding: [1, 9] });
  assert.deepEqual(from(result), [[1, 5], [2, 6], [3, 7], [4, 9]]);
  result = zip([[1, 2, 3], [4, 5, 6], [7, 8, 9]], { mode: 'strict' });
  assert.deepEqual(from(result), [[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
  result = zip([[1, 2, 3], [4, 5, 6, 7]], { mode: 'strict' });
  assert.throws(() => from(result), TypeError);
});
