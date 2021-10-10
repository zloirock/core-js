import { PROTO } from '../helpers/constants';

import path from 'core-js-pure/features/error';
import create from 'core-js-pure/es/object/create';

for (const ERROR_NAME of ['Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError']) {
  QUnit.test(`${ ERROR_NAME } constructor with 'cause' param`, assert => {
    const $Error = path[ERROR_NAME];
    assert.isFunction($Error);
    assert.arity($Error, 1);
    assert.name($Error, ERROR_NAME);

    if (PROTO && $Error !== path.Error) {
      // eslint-disable-next-line no-prototype-builtins -- safe
      assert.ok(path.Error.isPrototypeOf($Error), 'constructor has `Error` in the prototype chain');
    }

    assert.ok($Error(1) instanceof $Error, 'no cause, without new');
    assert.ok(new $Error(1) instanceof $Error, 'no cause, with new');

    assert.ok($Error(1, {}) instanceof $Error, 'with options, without new');
    assert.ok(new $Error(1, {}) instanceof $Error, 'with options, with new');

    assert.ok($Error(1, 'foo') instanceof $Error, 'non-object options, without new');
    assert.ok(new $Error(1, 'foo') instanceof $Error, 'non-object options, with new');

    assert.same($Error(1, { cause: 7 }).cause, 7, 'cause, without new');
    assert.same(new $Error(1, { cause: 7 }).cause, 7, 'cause, with new');

    assert.same($Error(1, create({ cause: 7 })).cause, 7, 'prototype cause, without new');
    assert.same(new $Error(1, create({ cause: 7 })).cause, 7, 'prototype cause, with new');

    let error = $Error(1, { cause: 7 });
    assert.same(error.name, ERROR_NAME, 'instance name');
    assert.same(error.message, '1', 'instance message');
    assert.same(error.cause, 7, 'instance cause');
    // eslint-disable-next-line no-prototype-builtins -- safe
    assert.ok(error.hasOwnProperty('cause'), 'cause is own');

    error = $Error();
    assert.same(error.message, '', 'default instance message');
    assert.same(error.cause, undefined, 'default instance cause undefined');
    // eslint-disable-next-line no-prototype-builtins -- safe
    assert.ok(!error.hasOwnProperty('cause'), 'default instance cause missed');
  });
}
