/* eslint-disable sonarjs/inconsistent-function-call -- required for testing */
import Error from '@core-js/pure/es/error';
import EvalError from '@core-js/pure/es/eval-error';
import RangeError from '@core-js/pure/es/range-error';
import ReferenceError from '@core-js/pure/es/reference-error';
import SyntaxError from '@core-js/pure/es/syntax-error';
import TypeError from '@core-js/pure/es/type-error';
import URIError from '@core-js/pure/es/uri-error';

const { create } = Object;

function runErrorTestCase($Error, ERROR_NAME, WEB_ASSEMBLY) {
  QUnit.test(`${ ERROR_NAME } constructor with 'cause' param`, assert => {
    assert.isFunction($Error);
    assert.arity($Error, 1);
    assert.name($Error, ERROR_NAME);

    if ($Error !== Error) {
      // eslint-disable-next-line no-prototype-builtins -- safe
      assert.true(Error.isPrototypeOf($Error), 'constructor has `Error` in the prototype chain');
    }

    assert.true($Error(1) instanceof $Error, 'no cause, without new');
    assert.true(new $Error(1) instanceof $Error, 'no cause, with new');

    assert.true($Error(1, {}) instanceof $Error, 'with options, without new');
    assert.true(new $Error(1, {}) instanceof $Error, 'with options, with new');

    assert.true($Error(1, 'foo') instanceof $Error, 'non-object options, without new');
    assert.true(new $Error(1, 'foo') instanceof $Error, 'non-object options, with new');

    assert.same($Error(1, { cause: 7 }).cause, 7, 'cause, without new');
    assert.same(new $Error(1, { cause: 7 }).cause, 7, 'cause, with new');

    assert.same($Error(1, create({ cause: 7 })).cause, 7, 'prototype cause, without new');
    assert.same(new $Error(1, create({ cause: 7 })).cause, 7, 'prototype cause, with new');

    let error = $Error(1, { cause: 7 });
    if (!WEB_ASSEMBLY) assert.same(error.name, ERROR_NAME, 'instance name');
    assert.same(error.message, '1', 'instance message');
    assert.same(error.cause, 7, 'instance cause');
    // eslint-disable-next-line no-prototype-builtins -- safe
    assert.true(error.hasOwnProperty('cause'), 'cause is own');

    error = $Error();
    assert.same(error.message, '', 'default instance message');
    assert.same(error.cause, undefined, 'default instance cause undefined');
    // eslint-disable-next-line no-prototype-builtins -- safe
    assert.false(error.hasOwnProperty('cause'), 'default instance cause missed');
  });
}

const ERRORS = [
  [Error, 'Error'],
  [EvalError, 'EvalError'],
  [RangeError, 'RangeError'],
  [ReferenceError, 'ReferenceError'],
  [SyntaxError, 'SyntaxError'],
  [TypeError, 'TypeError'],
  [URIError, 'URIError'],
];

for (const [ErrorConstructor, name] of ERRORS) {
  runErrorTestCase(ErrorConstructor, name);
}
