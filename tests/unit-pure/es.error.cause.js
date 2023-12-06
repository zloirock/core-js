/* eslint-disable sonarjs/inconsistent-function-call -- required for testing */
import path from '@core-js/pure/es/error';

const { create } = Object;

function runErrorTestCase($Error, ERROR_NAME, WEB_ASSEMBLY) {
  QUnit.test(`${ ERROR_NAME } constructor with 'cause' param`, assert => {
    assert.isFunction($Error);
    assert.arity($Error, 1);
    assert.name($Error, ERROR_NAME);

    if ($Error !== path.Error) {
      // eslint-disable-next-line no-prototype-builtins -- safe
      assert.true(path.Error.isPrototypeOf($Error), 'constructor has `Error` in the prototype chain');
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

for (const ERROR_NAME of ['Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError']) {
  runErrorTestCase(path[ERROR_NAME], ERROR_NAME);
}

if (path.WebAssembly) for (const ERROR_NAME of ['CompileError', 'LinkError', 'RuntimeError']) {
  if (path.WebAssembly[ERROR_NAME]) runErrorTestCase(path.WebAssembly[ERROR_NAME], ERROR_NAME, true);
}
