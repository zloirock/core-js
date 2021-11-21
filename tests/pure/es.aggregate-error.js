import AggregateError from 'core-js-pure/es/aggregate-error';
import Symbol from 'core-js-pure/es/symbol';
import toString from 'core-js-pure/es/object/to-string';

QUnit.test('AggregateError', assert => {
  assert.isFunction(AggregateError);
  assert.arity(AggregateError, 2);
  assert.name(AggregateError, 'AggregateError');
  assert.true(new AggregateError([1]) instanceof AggregateError);
  assert.true(new AggregateError([1]) instanceof Error);
  assert.true(AggregateError([1]) instanceof AggregateError);
  assert.true(AggregateError([1]) instanceof Error);
  assert.same(AggregateError([1], 'foo').message, 'foo');
  assert.same(AggregateError([1], 123).message, '123');
  assert.same(AggregateError([1]).message, '');
  assert.deepEqual(AggregateError([1, 2, 3]).errors, [1, 2, 3]);
  assert.throws(() => AggregateError([1], Symbol()), 'throws on symbol as a message');
  assert.same(toString(AggregateError([1])), '[object Error]', 'Object#toString');
});
