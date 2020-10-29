import AggregateError from 'core-js-pure/es/aggregate-error';

QUnit.test('AggregateError', assert => {
  assert.isFunction(AggregateError);
  assert.arity(AggregateError, 2);
  assert.name(AggregateError, 'AggregateError');
  assert.ok(new AggregateError([1]) instanceof AggregateError);
  assert.ok(new AggregateError([1]) instanceof Error);
  assert.ok(AggregateError([1]) instanceof AggregateError);
  assert.ok(AggregateError([1]) instanceof Error);
  assert.same(AggregateError([1], 'foo').message, 'foo');
  assert.deepEqual(AggregateError([1, 2, 3]).errors, [1, 2, 3]);
});
