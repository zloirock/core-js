/* eslint-disable unicorn/throw-new-error, sonarjs/inconsistent-function-call -- required for testing */
import AggregateError from '@core-js/pure/es/aggregate-error';
import Symbol from '@core-js/pure/es/symbol';
import toString from '@core-js/pure/es/object/to-string';

const { create } = Object;

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

  assert.true(AggregateError([1], 1) instanceof AggregateError, 'no cause, without new');
  assert.true(new AggregateError([1], 1) instanceof AggregateError, 'no cause, with new');

  assert.true(AggregateError([1], 1, {}) instanceof AggregateError, 'with options, without new');
  assert.true(new AggregateError([1], 1, {}) instanceof AggregateError, 'with options, with new');

  assert.true(AggregateError([1], 1, 'foo') instanceof AggregateError, 'non-object options, without new');
  assert.true(new AggregateError([1], 1, 'foo') instanceof AggregateError, 'non-object options, with new');

  assert.same(AggregateError([1], 1, { cause: 7 }).cause, 7, 'cause, without new');
  assert.same(new AggregateError([1], 1, { cause: 7 }).cause, 7, 'cause, with new');

  assert.same(AggregateError([1], 1, create({ cause: 7 })).cause, 7, 'prototype cause, without new');
  assert.same(new AggregateError([1], 1, create({ cause: 7 })).cause, 7, 'prototype cause, with new');

  let error = AggregateError([1], 1, { cause: 7 });
  assert.deepEqual(error.errors, [1]);
  assert.same(error.name, 'AggregateError', 'instance name');
  assert.same(error.message, '1', 'instance message');
  assert.same(error.cause, 7, 'instance cause');
  // eslint-disable-next-line no-prototype-builtins -- safe
  assert.true(error.hasOwnProperty('cause'), 'cause is own');

  error = AggregateError([1]);
  assert.deepEqual(error.errors, [1]);
  assert.same(error.message, '', 'default instance message');
  assert.same(error.cause, undefined, 'default instance cause undefined');
  // eslint-disable-next-line no-prototype-builtins -- safe
  assert.false(error.hasOwnProperty('cause'), 'default instance cause missed');
});
