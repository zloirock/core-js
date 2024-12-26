import isError from 'core-js-pure/actual/error/is-error';
import create from 'core-js-pure/es/object/create';
import AggregateError from 'core-js-pure/es/aggregate-error';
import SuppressedError from 'core-js-pure/actual/suppressed-error';
import DOMException from 'core-js-pure/stable/dom-exception';

QUnit.test('Error.isError', assert => {
  assert.isFunction(isError);
  assert.arity(isError, 1);
  assert.name(isError, 'isError');

  assert.true(isError(new Error('error')));
  assert.true(isError(new TypeError('error')));
  assert.true(isError(new AggregateError([1, 2, 3], 'error')));
  assert.true(isError(new SuppressedError(1, 2, 'error')));
  assert.true(isError(new DOMException('error')));

  assert.false(isError(null));
  assert.false(isError({}));
  assert.false(isError(create(Error.prototype)));
});
