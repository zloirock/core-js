QUnit.test('Error.isError', assert => {
  const { isError } = Error;
  assert.isFunction(isError);
  assert.arity(isError, 1);
  assert.name(isError, 'isError');
  assert.looksNative(isError);
  assert.nonEnumerable(Error, 'isError');

  assert.true(isError(new Error('error')));
  assert.true(isError(new TypeError('error')));
  assert.true(isError(new AggregateError([1, 2, 3], 'error')));
  assert.true(isError(new SuppressedError(1, 2, 'error')));
  assert.true(isError(new DOMException('error')));

  assert.false(isError(null));
  assert.false(isError({}));
  assert.false(isError(Object.create(Error.prototype)));
});
