/* eslint-disable unicorn/throw-new-error, sonarjs/inconsistent-function-call -- testing */
import SuppressedError from '@core-js/pure/es/suppressed-error';
import Symbol from '@core-js/pure/es/symbol';
import toString from '@core-js/pure/es/object/to-string';

QUnit.test('SuppressedError', assert => {
  assert.isFunction(SuppressedError);
  assert.arity(SuppressedError, 3);
  assert.name(SuppressedError, 'SuppressedError');
  assert.true(new SuppressedError() instanceof SuppressedError);
  assert.true(new SuppressedError() instanceof Error);
  assert.true(SuppressedError() instanceof SuppressedError);
  assert.true(SuppressedError() instanceof Error);

  assert.same(SuppressedError().error, undefined);
  assert.same(SuppressedError().suppressed, undefined);
  assert.same(SuppressedError().message, '');
  assert.same(SuppressedError().cause, undefined);
  assert.same(SuppressedError().name, 'SuppressedError');

  assert.same(new SuppressedError().error, undefined);
  assert.same(new SuppressedError().suppressed, undefined);
  assert.same(new SuppressedError().message, '');
  assert.same(new SuppressedError().cause, undefined);
  assert.same(new SuppressedError().name, 'SuppressedError');

  const error1 = SuppressedError(1, 2, 3, { cause: 4 });

  assert.same(error1.error, 1);
  assert.same(error1.suppressed, 2);
  assert.same(error1.message, '3');
  assert.same(error1.cause, undefined);
  assert.same(error1.name, 'SuppressedError');

  const error2 = new SuppressedError(1, 2, 3, { cause: 4 });

  assert.same(error2.error, 1);
  assert.same(error2.suppressed, 2);
  assert.same(error2.message, '3');
  assert.same(error2.cause, undefined);
  assert.same(error2.name, 'SuppressedError');

  assert.throws(() => SuppressedError(1, 2, Symbol('SuppressedError constructor test')), 'throws on symbol as a message');
  assert.same(toString(SuppressedError()), '[object Error]', 'Object#toString');

  // eslint-disable-next-line no-prototype-builtins -- safe
  assert.false(SuppressedError.prototype.hasOwnProperty('cause'), 'prototype has not cause');
});
