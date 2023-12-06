/* eslint-disable sonarjs/inconsistent-function-call -- required for testing */
import { GLOBAL } from '../helpers/constants.js';

const { create } = Object;

function runErrorTestCase($Error, ERROR_NAME) {
  QUnit.test(`${ ERROR_NAME } constructor with 'cause' param`, assert => {
    assert.isFunction($Error);
    assert.arity($Error, 1);
    assert.name($Error, ERROR_NAME);
    assert.looksNative($Error);

    if ($Error !== Error) {
      // eslint-disable-next-line no-prototype-builtins -- safe
      assert.true(Error.isPrototypeOf($Error), 'constructor has `Error` in the prototype chain');
    }

    assert.same($Error.prototype.constructor, $Error, 'prototype constructor');
    // eslint-disable-next-line no-prototype-builtins -- safe
    assert.false($Error.prototype.hasOwnProperty('cause'), 'prototype has not cause');

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
    assert.same(error.name, ERROR_NAME, 'instance name');
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
  runErrorTestCase(GLOBAL[ERROR_NAME], ERROR_NAME);
}

if (GLOBAL.WebAssembly) for (const ERROR_NAME of ['CompileError', 'LinkError', 'RuntimeError']) {
  if (GLOBAL.WebAssembly[ERROR_NAME]) runErrorTestCase(GLOBAL.WebAssembly[ERROR_NAME], ERROR_NAME);
}
