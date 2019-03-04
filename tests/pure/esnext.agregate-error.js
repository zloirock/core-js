import AgregateError from 'core-js-pure/features/agregate-error';

QUnit.test('AgregateError', assert => {
  assert.isFunction(AgregateError);
  assert.arity(AgregateError, 2);
  if ('name' in AgregateError) assert.name(AgregateError, 'AgregateError');
  assert.ok(new AgregateError([1]) instanceof AgregateError);
  assert.ok(new AgregateError([1]) instanceof Error);
  assert.ok(AgregateError([1]) instanceof AgregateError);
  assert.ok(AgregateError([1]) instanceof Error);
  assert.same(AgregateError([1], 'foo').message, 'foo');
  assert.deepEqual(AgregateError([1, 2, 3]).errors, [1, 2, 3]);
});
