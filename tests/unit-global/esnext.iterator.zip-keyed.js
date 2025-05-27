const { from } = Array;

QUnit.test('Iterator.zipKeyed', assert => {
  const { zipKeyed } = Iterator;

  assert.isFunction(zipKeyed);
  assert.arity(zipKeyed, 1);
  assert.name(zipKeyed, 'zipKeyed');
  assert.looksNative(zipKeyed);
  assert.nonEnumerable(Iterator, 'zipKeyed');

  let result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5], c: [7, 8, 9] });
  assert.deepEqual(from(result), [{ a: 0, b: 3, c: 7 }, { a: 1, b: 4, c: 8 }, { a: 2, b: 5, c: 9 }]);
  result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5, 6], c: [7, 8, 9] });
  assert.deepEqual(from(result), [{ a: 0, b: 3, c: 7 }, { a: 1, b: 4, c: 8 }, { a: 2, b: 5, c: 9 }]);
  result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5, 6], c: [7, 8, 9] }, { mode: 'longest', padding: { c: 10 } });
  assert.deepEqual(from(result), [{ a: 0, b: 3, c: 7 }, { a: 1, b: 4, c: 8 }, { a: 2, b: 5, c: 9 }, { a: undefined, b: 6, c: 10 }]);
  result = zipKeyed({ a: [0, 1, 2], b: [3, 4, 5, 6], c: [7, 8, 9] }, { mode: 'strict' });
  assert.throws(() => from(result), TypeError);
});
